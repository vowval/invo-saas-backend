import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DyeingBatch, DyeingBatchStatus, DyeingProcessType, LabDipApprovalStatus } from './dyeing-batch.entity';
import { DyeingBatchAudit } from './dyeing-batch-audit.entity';
import { DyeingProcessEvent, DyeingChemicalConsumption, DyeingDyeConsumption, DyeingQCResult } from './dyeing-process-event.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { ProcessRouteStep } from '../process-route/process-route-step.entity';
import { Recipe } from '../inventory/recipe.entity';
import { ProcessRouteService } from '../process-route/process-route.service';

@Injectable()
export class DyeingExecutionService {
  constructor(
    @InjectRepository(DyeingBatch)
    private readonly batchRepo: Repository<DyeingBatch>,
    @InjectRepository(DyeingBatchAudit)
    private readonly auditRepo: Repository<DyeingBatchAudit>,
    @InjectRepository(DyeingProcessEvent)
    private readonly eventRepo: Repository<DyeingProcessEvent>,
    @InjectRepository(DyeingChemicalConsumption)
    private readonly chemicalConsumptionRepo: Repository<DyeingChemicalConsumption>,
    @InjectRepository(DyeingDyeConsumption)
    private readonly dyeConsumptionRepo: Repository<DyeingDyeConsumption>,
    @InjectRepository(DyeingQCResult)
    private readonly qcResultRepo: Repository<DyeingQCResult>,
    @InjectRepository(DyeingJob)
    private readonly jobRepo: Repository<DyeingJob>,
    @InjectRepository(ProcessRouteStep)
    private readonly routeStepRepo: Repository<ProcessRouteStep>,
    @InjectRepository(Recipe)
    private readonly recipeRepo: Repository<Recipe>,
    private readonly processRouteService: ProcessRouteService,
  ) {}

  /**
   * Generate unique batch number: DB-YYYY-XXXXX
   */
  async generateBatchNo(year: number = new Date().getFullYear()): Promise<string> {
    const prefix = `DB-${year}`;
    const lastBatch = await this.batchRepo
      .createQueryBuilder('b')
      .where('b.batchNo LIKE :prefix', { prefix: `${prefix}-%` })
      .orderBy('b.batchNo', 'DESC')
      .limit(1)
      .getOne();

    let sequence = 1;
    if (lastBatch) {
      const lastSeq = parseInt(lastBatch.batchNo.split('-')[2]);
      sequence = lastSeq + 1;
    }

    return `${prefix}-${String(sequence).padStart(5, '0')}`;
  }

  /**
   * Create a new dyeing batch (recipe-driven)
   */
  async createBatch(
    jobId: string,
    routeStepId: string,
    processType: DyeingProcessType,
    recipeId: string,
    inputQuantity: number,
    colour: string,
    shadeCode: string,
    data: any,
    companyId: string,
  ) {
    // Verify job exists
    const job = await this.jobRepo.findOne({
      where: { id: jobId, company: { id: companyId } },
    });
    if (!job) throw new NotFoundException('Job not found');

    // Verify recipe exists and get target parameters
    const recipe = await this.recipeRepo.findOne({
      where: { id: recipeId, company: { id: companyId } },
      relations: ['ingredients', 'ingredients.chemicalItem'],
    });
    if (!recipe) throw new NotFoundException('Recipe not found');

    // Verify route step if provided
    let routeStep = null;
    if (routeStepId) {
      routeStep = await this.routeStepRepo.findOne({
        where: { id: routeStepId },
      });
    }

    // Validate input quantity
    if (inputQuantity <= 0) {
      throw new BadRequestException('Input quantity must be greater than 0');
    }

    const batchNo = await this.generateBatchNo();

    // Extract target parameters from recipe
    const targetParameters = {
      recipeLiquorRatio: recipe.liquorRatio,
      recipeTemperature: recipe.temperatureC,
      recipeTime: recipe.timeMinutes,
      ...data.targetParameters,
    };

    const batch = this.batchRepo.create({
      batchNo,
      job: { id: jobId } as DyeingJob,
      routeStep: routeStep ? { id: routeStepId } : null,
      processType,
      recipe: { id: recipeId } as Recipe,
      recipeCode: recipe.code,
      colour,
      shadeCode,
      inputQuantity,
      targetParameters,
      status: DyeingBatchStatus.PENDING,
      labDipApprovalStatus: data.labDipApprovalRequired ? LabDipApprovalStatus.PENDING : LabDipApprovalStatus.NOT_REQUIRED,
      labDipReference: data.labDipReference,
      machineName: data.machineName,
      operatorName: data.operatorName,
      shift: data.shift,
      company: { id: companyId } as any,
    });

    const created = await this.batchRepo.save(batch);

    await this.auditRepo.save({
      batch: created,
      action: 'CREATED',
      newValue: {
        batchNo: created.batchNo,
        recipeCode: created.recipeCode,
        colour: created.colour,
        shadeCode: created.shadeCode,
      },
      changedBy: data.userId,
    });

    return created;
  }

  /**
   * Get batch details
   */
  async getBatch(batchId: string, companyId: string) {
    const batch = await this.batchRepo.findOne({
      where: { id: batchId, company: { id: companyId } },
      relations: ['job', 'recipe', 'company'],
    });

    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  /**
   * Get all batches for a job
   */
  async getJobBatches(jobId: string, companyId: string) {
    return this.batchRepo.find({
      where: { job: { id: jobId }, company: { id: companyId } },
      relations: ['recipe'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Approve lab dip (if required)
   */
  async approveLabDip(
    batchId: string,
    labDipReference: string,
    approvedBy: string,
    companyId: string,
  ) {
    const batch = await this.getBatch(batchId, companyId);

    if (batch.labDipApprovalStatus === LabDipApprovalStatus.NOT_REQUIRED) {
      throw new BadRequestException('Lab dip approval not required for this batch');
    }

    if (batch.labDipApprovalStatus === LabDipApprovalStatus.APPROVED) {
      throw new BadRequestException('Lab dip already approved');
    }

    const previousStatus = batch.labDipApprovalStatus;
    batch.labDipApprovalStatus = LabDipApprovalStatus.APPROVED;
    batch.labDipReference = labDipReference;
    batch.customerApproved = true;
    batch.customerApprovedAt = new Date();

    const updated = await this.batchRepo.save(batch);

    await this.auditRepo.save({
      batch: updated,
      action: 'LAB_DIP_APPROVED',
      previousValue: { labDipApprovalStatus: previousStatus },
      newValue: { labDipApprovalStatus: LabDipApprovalStatus.APPROVED, labDipReference },
      changedBy: approvedBy,
    });

    return updated;
  }

  /**
   * Reject lab dip
   */
  async rejectLabDip(
    batchId: string,
    reason: string,
    rejectedBy: string,
    companyId: string,
  ) {
    const batch = await this.getBatch(batchId, companyId);

    if (batch.labDipApprovalStatus === LabDipApprovalStatus.NOT_REQUIRED) {
      throw new BadRequestException('Lab dip approval not required for this batch');
    }

    if (batch.labDipApprovalStatus !== LabDipApprovalStatus.PENDING) {
      throw new BadRequestException('Can only reject pending lab dip');
    }

    const previousStatus = batch.labDipApprovalStatus;
    batch.labDipApprovalStatus = LabDipApprovalStatus.REJECTED;

    const updated = await this.batchRepo.save(batch);

    await this.auditRepo.save({
      batch: updated,
      action: 'LAB_DIP_REJECTED',
      previousValue: { labDipApprovalStatus: previousStatus },
      newValue: { labDipApprovalStatus: LabDipApprovalStatus.REJECTED },
      changedBy: rejectedBy,
      reason,
    });

    return updated;
  }

  /**
   * Start dyeing batch (PENDING → IN_PROGRESS)
   */
  async startBatch(batchId: string, userId: string, companyId: string) {
    const batch = await this.getBatch(batchId, companyId);

    if (batch.status !== DyeingBatchStatus.PENDING) {
      throw new BadRequestException('Batch must be in PENDING status to start');
    }

    // Check lab dip approval if required
    if (!batch.isLabDipApprovalObtained()) {
      throw new BadRequestException('Lab dip approval required but not obtained');
    }

    const previousStatus = batch.status;
    batch.status = DyeingBatchStatus.IN_PROGRESS;
    batch.startedAt = new Date();

    const updated = await this.batchRepo.save(batch);

    await this.auditRepo.save({
      batch: updated,
      action: 'STARTED',
      previousValue: { status: previousStatus },
      newValue: { status: DyeingBatchStatus.IN_PROGRESS, startedAt: batch.startedAt },
      changedBy: userId,
    });

    return updated;
  }

  /**
   * Record a process event within the dyeing batch
   */
  async recordProcessEvent(
    batchId: string,
    eventName: string,
    description: string | null,
    actualParameters: Record<string, any> | null,
    userId: string,
    companyId: string,
  ) {
    const batch = await this.getBatch(batchId, companyId);

    if (batch.isCompleted()) {
      throw new ForbiddenException('Cannot add events to completed batch');
    }

    if (batch.status === DyeingBatchStatus.PENDING) {
      throw new BadRequestException('Batch must be started before recording events');
    }

    // Get sequence number
    const lastEvent = await this.eventRepo
      .createQueryBuilder('e')
      .where('e.batchId = :batchId', { batchId })
      .orderBy('e.sequenceNumber', 'DESC')
      .limit(1)
      .getOne();

    const sequenceNumber = lastEvent ? lastEvent.sequenceNumber + 1 : 1;

    const event = this.eventRepo.create({
      batch: { id: batchId } as DyeingBatch,
      sequenceNumber,
      eventName,
      description,
      actualParameters,
      startedAt: new Date(),
    });

    const created = await this.eventRepo.save(event);

    await this.auditRepo.save({
      batch,
      action: 'PROCESS_EVENT_RECORDED',
      newValue: {
        eventName,
        sequenceNumber,
      },
      changedBy: userId,
    });

    return created;
  }

  /**
   * Record chemical consumption
   */
  async recordChemicalConsumption(
    batchId: string,
    chemicalName: string,
    chemicalItemId: string | null,
    chemicalLot: string | null,
    plannedQuantity: number | null,
    actualQuantity: number,
    unit: string,
    userId: string,
    companyId: string,
  ) {
    const batch = await this.getBatch(batchId, companyId);

    if (batch.isCompleted()) {
      throw new ForbiddenException('Cannot add consumption to completed batch');
    }

    const consumption = this.chemicalConsumptionRepo.create({
      batch: { id: batchId } as DyeingBatch,
      chemicalName,
      chemicalItemId,
      chemicalLot,
      plannedQuantity,
      actualQuantity,
      unit,
    });

    const created = await this.chemicalConsumptionRepo.save(consumption);

    await this.auditRepo.save({
      batch,
      action: 'CHEMICAL_CONSUMPTION_RECORDED',
      newValue: {
        chemicalName,
        actualQuantity,
        unit,
      },
      changedBy: userId,
    });

    return created;
  }

  /**
   * Record dye consumption
   */
  async recordDyeConsumption(
    batchId: string,
    dyeName: string,
    dyeItemId: string | null,
    dyeLot: string | null,
    shadeCode: string | null,
    plannedQuantity: number | null,
    actualQuantity: number,
    unit: string,
    userId: string,
    companyId: string,
  ) {
    const batch = await this.getBatch(batchId, companyId);

    if (batch.isCompleted()) {
      throw new ForbiddenException('Cannot add consumption to completed batch');
    }

    const consumption = this.dyeConsumptionRepo.create({
      batch: { id: batchId } as DyeingBatch,
      dyeName,
      dyeItemId,
      dyeLot,
      shadeCode,
      plannedQuantity,
      actualQuantity,
      unit,
    });

    const created = await this.dyeConsumptionRepo.save(consumption);

    await this.auditRepo.save({
      batch,
      action: 'DYE_CONSUMPTION_RECORDED',
      newValue: {
        dyeName,
        actualQuantity,
        unit,
      },
      changedBy: userId,
    });

    return created;
  }

  /**
   * Update actual parameters during execution
   */
  async updateActualParameters(
    batchId: string,
    actualParameters: Record<string, any>,
    userId: string,
    companyId: string,
  ) {
    const batch = await this.getBatch(batchId, companyId);

    if (batch.isCompleted()) {
      throw new ForbiddenException('Cannot update parameters on completed batch');
    }

    const previousParams = batch.actualParameters;
    batch.actualParameters = actualParameters;

    const updated = await this.batchRepo.save(batch);

    await this.auditRepo.save({
      batch: updated,
      action: 'PARAMETERS_UPDATED',
      previousValue: previousParams,
      newValue: actualParameters,
      changedBy: userId,
    });

    return updated;
  }

  /**
   * Pause dyeing batch
   */
  async pauseBatch(batchId: string, reason: string, userId: string, companyId: string) {
    const batch = await this.getBatch(batchId, companyId);

    if (batch.status !== DyeingBatchStatus.IN_PROGRESS) {
      throw new BadRequestException('Only IN_PROGRESS batches can be paused');
    }

    const previousStatus = batch.status;
    batch.status = DyeingBatchStatus.PAUSED;

    const updated = await this.batchRepo.save(batch);

    await this.auditRepo.save({
      batch: updated,
      action: 'PAUSED',
      previousValue: { status: previousStatus },
      newValue: { status: DyeingBatchStatus.PAUSED },
      changedBy: userId,
      reason,
    });

    return updated;
  }

  /**
   * Resume paused dyeing batch
   */
  async resumeBatch(batchId: string, userId: string, companyId: string) {
    const batch = await this.getBatch(batchId, companyId);

    if (batch.status !== DyeingBatchStatus.PAUSED) {
      throw new BadRequestException('Only PAUSED batches can be resumed');
    }

    const previousStatus = batch.status;
    batch.status = DyeingBatchStatus.IN_PROGRESS;

    const updated = await this.batchRepo.save(batch);

    await this.auditRepo.save({
      batch: updated,
      action: 'RESUMED',
      previousValue: { status: previousStatus },
      newValue: { status: DyeingBatchStatus.IN_PROGRESS },
      changedBy: userId,
    });

    return updated;
  }

  /**
   * Complete dyeing batch
   */
  async completeBatch(
    batchId: string,
    outputQuantity: number,
    remarks: string,
    qcResults: any,
    userId: string,
    companyId: string,
  ) {
    const batch = await this.getBatch(batchId, companyId);

    if (batch.isCompleted()) {
      throw new BadRequestException('Batch already completed');
    }

    if (outputQuantity < 0) {
      throw new BadRequestException('Output quantity cannot be negative');
    }

    // Check for override: output > input requires supervisor approval
    if (outputQuantity > batch.inputQuantity) {
      throw new BadRequestException(
        'Output quantity exceeds input quantity. Supervisor override required.',
      );
    }

    const previousOutput = batch.outputQuantity;
    const previousStatus = batch.status;

    batch.outputQuantity = outputQuantity;
    batch.calculateLoss();
    batch.status = DyeingBatchStatus.COMPLETED;
    batch.completedAt = new Date();
    batch.remarks = remarks;

    const updated = await this.batchRepo.save(batch);

    // Record QC results if provided
    if (qcResults) {
      const qcResult = this.qcResultRepo.create({
        batch: updated,
        testName: qcResults.testName || 'Standard QC',
        shadeResult: qcResults.shadeResult,
        colourMatchingResult: qcResults.colourMatchingResult,
        washFastnessResult: qcResults.washFastnessResult,
        washFastnessStandard: qcResults.washFastnessStandard,
        rubbingFastnessResult: qcResults.rubbingFastnessResult,
        rubbingFastnessStandard: qcResults.rubbingFastnessStandard,
        otherTestName: qcResults.otherTestName,
        otherTestResult: qcResults.otherTestResult,
        status: qcResults.status,
        remarks: qcResults.remarks,
        qcPersonnel: qcResults.qcPersonnel,
      });
      await this.qcResultRepo.save(qcResult);
    }

    await this.auditRepo.save({
      batch: updated,
      action: 'COMPLETED',
      previousValue: { outputQuantity: previousOutput, status: previousStatus },
      newValue: { outputQuantity, status: DyeingBatchStatus.COMPLETED },
      changedBy: userId,
    });

    // Auto-complete route step if linked
    if (batch.routeStep) {
      await this.completeRouteStep(batch.routeStep.id, outputQuantity);
    }

    return updated;
  }

  /**
   * Supervisor override: allow output > input
   */
  async supervisorOverride(
    batchId: string,
    outputQuantity: number,
    reason: string,
    supervisorId: string,
    companyId: string,
  ) {
    const batch = await this.getBatch(batchId, companyId);

    if (batch.isCompleted()) {
      throw new BadRequestException('Batch already completed');
    }

    if (outputQuantity <= batch.inputQuantity) {
      throw new BadRequestException(
        'Override only needed when output > input. Use normal complete for normal cases.',
      );
    }

    const previousOutput = batch.outputQuantity;

    batch.outputQuantity = outputQuantity;
    batch.calculateLoss(); // Will be negative
    batch.supervisorOverrideReason = reason;
    batch.supervisorId = supervisorId;
    batch.status = DyeingBatchStatus.COMPLETED;
    batch.completedAt = new Date();

    const updated = await this.batchRepo.save(batch);

    await this.auditRepo.save({
      batch: updated,
      action: 'SUPERVISOR_OVERRIDE',
      previousValue: { outputQuantity: previousOutput },
      newValue: { outputQuantity, supervisorOverrideReason: reason },
      changedBy: supervisorId,
      reason,
    });

    // Auto-complete route step if linked
    if (batch.routeStep) {
      await this.completeRouteStep(batch.routeStep.id, outputQuantity);
    }

    return updated;
  }

  /**
   * Get process events for batch
   */
  async getProcessEvents(batchId: string, companyId: string) {
    const batch = await this.getBatch(batchId, companyId);
    return this.eventRepo.find({
      where: { batch: { id: batchId } },
      order: { sequenceNumber: 'ASC' },
    });
  }

  /**
   * Get chemical consumptions for batch
   */
  async getChemicalConsumptions(batchId: string, companyId: string) {
    const batch = await this.getBatch(batchId, companyId);
    return this.chemicalConsumptionRepo.find({
      where: { batch: { id: batchId } },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get dye consumptions for batch
   */
  async getDyeConsumptions(batchId: string, companyId: string) {
    const batch = await this.getBatch(batchId, companyId);
    return this.dyeConsumptionRepo.find({
      where: { batch: { id: batchId } },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get QC results for batch
   */
  async getQCResults(batchId: string, companyId: string) {
    const batch = await this.getBatch(batchId, companyId);
    return this.qcResultRepo.find({
      where: { batch: { id: batchId } },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get audit trail for batch
   */
  async getAuditTrail(batchId: string, companyId: string) {
    const batch = await this.getBatch(batchId, companyId);
    return this.auditRepo.find({
      where: { batch: { id: batchId } },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Complete the route step when dyeing batch completes
   */
  private async completeRouteStep(stepId: string, actualQuantity?: number) {
    try {
      const routeStep = await this.routeStepRepo.findOne({
        where: { id: stepId },
        relations: ['route', 'route.job', 'route.job.company'],
      });

      if (!routeStep) return;

      const companyId = routeStep.route.job.company.id;
      const quantity = actualQuantity || 0;

      await this.processRouteService.completeStep(stepId, quantity, companyId);
    } catch (error) {
      console.error(`Failed to auto-complete route step ${stepId}:`, error.message);
    }
  }
}
