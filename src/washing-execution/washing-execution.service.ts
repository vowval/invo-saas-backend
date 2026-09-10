import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WashingBatch, WashingBatchStatus, WashingProcessType } from './washing-batch.entity';
import { WashingBatchAudit } from './washing-batch-audit.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { ProcessRouteStep } from '../process-route/process-route-step.entity';
import { Company } from '../companies/company.entity';
import { ProcessRouteService } from '../process-route/process-route.service';

@Injectable()
export class WashingExecutionService {
  private batchCounter = 0; // Simple counter for batch numbering (use DB sequence in production)

  constructor(
    @InjectRepository(WashingBatch)
    private readonly batchRepo: Repository<WashingBatch>,
    @InjectRepository(WashingBatchAudit)
    private readonly auditRepo: Repository<WashingBatchAudit>,
    @InjectRepository(DyeingJob)
    private readonly jobRepo: Repository<DyeingJob>,
    @InjectRepository(ProcessRouteStep)
    private readonly routeStepRepo: Repository<ProcessRouteStep>,
    private readonly processRouteService: ProcessRouteService,
  ) {}

  /**
   * Generate unique batch number: WB-YYYY-XXXXX
   */
  async generateBatchNo(year: number = new Date().getFullYear()): Promise<string> {
    const prefix = `WB-${year}`;
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
   * Create a new washing batch
   */
  async createBatch(
    jobId: string,
    routeStepId: string,
    processType: WashingProcessType,
    inputQuantity: number,
    data: any,
    companyId: string,
  ) {
    // Verify job exists
    const job = await this.jobRepo.findOne({
      where: { id: jobId, company: { id: companyId } },
    });
    if (!job) throw new NotFoundException('Job not found');

    // Verify route step exists
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

    const batch = this.batchRepo.create({
      batchNo,
      job: { id: jobId } as DyeingJob,
      routeStep: routeStep ? { id: routeStepId } : null,
      processType,
      inputQuantity,
      status: WashingBatchStatus.PENDING,
      machineId: data.machineId,
      machineName: data.machineName,
      operatorId: data.operatorId,
      operatorName: data.operatorName,
      recipeId: data.recipeId,
      recipeName: data.recipeName,
      shift: data.shift || 'Morning',
      parameters: data.parameters || {},
      company: { id: companyId } as Company,
    });

    const saved = await this.batchRepo.save(batch);

    // Create audit entry
    await this.auditRepo.save({
      batch: saved,
      action: 'CREATED',
      newValue: saved,
      changedBy: data.operatorId,
      changedByName: data.operatorName,
    });

    return saved;
  }

  /**
   * Get batch by ID
   */
  async getBatch(batchId: string, companyId: string) {
    const batch = await this.batchRepo.findOne({
      where: { id: batchId, company: { id: companyId } },
      relations: ['auditTrail', 'job', 'routeStep'],
    });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  /**
   * Get job's washing batches
   */
  async getJobBatches(jobId: string, companyId: string) {
    return this.batchRepo.find({
      where: { job: { id: jobId }, company: { id: companyId } },
      relations: ['job', 'auditTrail'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Start a batch (PENDING → IN_PROGRESS)
   */
  async startBatch(batchId: string, userId: string, companyId: string) {
    const batch = await this.getBatch(batchId, companyId);

    if (batch.status !== WashingBatchStatus.PENDING) {
      throw new BadRequestException(`Batch cannot start from status: ${batch.status}`);
    }

    const previousStatus = batch.status;
    batch.status = WashingBatchStatus.IN_PROGRESS;
    batch.startedAt = new Date();

    const updated = await this.batchRepo.save(batch);

    await this.auditRepo.save({
      batch: updated,
      action: 'STARTED',
      previousValue: { status: previousStatus },
      newValue: { status: WashingBatchStatus.IN_PROGRESS },
      changedBy: userId,
    });

    return updated;
  }

  /**
   * Update batch parameters during execution
   */
  async updateParameters(
    batchId: string,
    parameters: any,
    userId: string,
    companyId: string,
  ) {
    const batch = await this.getBatch(batchId, companyId);

    if (batch.isCompleted()) {
      throw new ForbiddenException('Cannot edit completed batch. Request supervisor adjustment.');
    }

    const previousParams = batch.parameters;
    batch.parameters = { ...batch.parameters, ...parameters };

    const updated = await this.batchRepo.save(batch);

    await this.auditRepo.save({
      batch: updated,
      action: 'PARAMETERS_UPDATED',
      previousValue: previousParams,
      newValue: batch.parameters,
      changedBy: userId,
    });

    return updated;
  }

  /**
   * Enter output quantity and complete batch
   */
  async completeBatch(
    batchId: string,
    outputQuantity: number,
    remarks: string,
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
    batch.status = WashingBatchStatus.COMPLETED;
    batch.completedAt = new Date();
    batch.remarks = remarks;

    const updated = await this.batchRepo.save(batch);

    await this.auditRepo.save({
      batch: updated,
      action: 'COMPLETED',
      previousValue: { outputQuantity: previousOutput, status: previousStatus },
      newValue: { outputQuantity, status: WashingBatchStatus.COMPLETED },
      changedBy: userId,
    });

    // If batch is linked to route step, complete the step
    if (batch.routeStep) {
      await this.completeRouteStep(batch.routeStep.id, outputQuantity);
    }

    return updated;
  }

  /**
   * Supervisor override: allow output > input with reason
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
    batch.status = WashingBatchStatus.COMPLETED;
    batch.completedAt = new Date();

    const updated = await this.batchRepo.save(batch);

    await this.auditRepo.save({
      batch: updated,
      action: 'SUPERVISOR_OVERRIDE',
      previousValue: { outputQuantity: previousOutput },
      newValue: { outputQuantity, reason },
      changedBy: supervisorId,
      approvedBy: supervisorId,
      reason,
    });

    if (batch.routeStep) {
      await this.completeRouteStep(batch.routeStep.id);
    }

    return updated;
  }

  /**
   * Put batch on hold
   */
  async putOnHold(batchId: string, reason: string, userId: string, companyId: string) {
    const batch = await this.getBatch(batchId, companyId);

    if (batch.isCompleted()) {
      throw new BadRequestException('Cannot hold completed batch');
    }

    const previousStatus = batch.status;
    batch.status = WashingBatchStatus.ON_HOLD;

    const updated = await this.batchRepo.save(batch);

    await this.auditRepo.save({
      batch: updated,
      action: 'HOLD_STATUS',
      previousValue: { status: previousStatus },
      newValue: { status: WashingBatchStatus.ON_HOLD },
      changedBy: userId,
      reason,
    });

    return updated;
  }

  /**
   * Reject batch
   */
  async rejectBatch(batchId: string, reason: string, userId: string, companyId: string) {
    const batch = await this.getBatch(batchId, companyId);

    if (batch.isCompleted()) {
      throw new BadRequestException('Cannot reject completed batch');
    }

    const previousStatus = batch.status;
    batch.status = WashingBatchStatus.REJECTED;

    const updated = await this.batchRepo.save(batch);

    await this.auditRepo.save({
      batch: updated,
      action: 'REJECTED',
      previousValue: { status: previousStatus },
      newValue: { status: WashingBatchStatus.REJECTED },
      changedBy: userId,
      reason,
    });

    return updated;
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
   * Complete the route step when washing batch completes
   * Automatically unlocks the next process in the route
   */
  private async completeRouteStep(stepId: string, actualQuantity?: number) {
    try {
      // Get the route step to extract company ID
      const routeStep = await this.routeStepRepo.findOne({
        where: { id: stepId },
        relations: ['route', 'route.job', 'route.job.company'],
      });

      if (!routeStep) return;

      const companyId = routeStep.route.job.company.id;
      const quantity = actualQuantity || 0;

      await this.processRouteService.completeStep(stepId, quantity, companyId);
    } catch (error) {
      // Log error but don't fail the batch completion
      console.error(`Failed to auto-complete route step ${stepId}:`, error.message);
    }
  }
}
