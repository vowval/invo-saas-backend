import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DryingBatch, DryingBatchStatus, DryingProcessType } from './drying-batch.entity';
import { DryingBatchAudit } from './drying-batch-audit.entity';
import { ProcessRouteService } from '../process-route/process-route.service';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';

@Injectable()
export class DryingExecutionService {
  constructor(
    @InjectRepository(DryingBatch)
    private readonly dryingBatchRepository: Repository<DryingBatch>,
    @InjectRepository(DryingBatchAudit)
    private readonly auditRepository: Repository<DryingBatchAudit>,
    @InjectRepository(DyeingJob)
    private readonly jobRepository: Repository<DyeingJob>,
    private readonly processRouteService: ProcessRouteService,
  ) {}

  /**
   * Generate unique batch number for drying batches
   * Format: DB-YYYY-XXXXX (Drying Batch)
   */
  async generateBatchNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const lastBatch = await this.dryingBatchRepository
      .createQueryBuilder('batch')
      .where('batch.companyId = :companyId', { companyId })
      .where('batch.batchNumber LIKE :pattern', {
        pattern: `DB-${year}-%`,
      })
      .orderBy('batch.createdAt', 'DESC')
      .take(1)
      .getOne();

    let sequence = 1;
    if (lastBatch && lastBatch.batchNumber) {
      const parts = lastBatch.batchNumber.split('-');
      sequence = parseInt(parts[2] || '0') + 1;
    }

    return `DB-${year}-${sequence.toString().padStart(5, '0')}`;
  }

  /**
   * Create a new drying batch
   */
  async createBatch(
    companyId: string,
    jobId: string,
    routeStepId: string,
    processId: string,
    processType: DryingProcessType,
    inputQuantity: number,
    uom: string,
    machineId: string,
    machineCode: string,
    recipeId: string,
    recipeName: string,
    operatorId: string,
    operatorName: string,
    shift: string,
    targetParameters: Record<string, any>,
    userId: string,
  ): Promise<DryingBatch> {
    // Validate job exists and belongs to company
    const job = await this.jobRepository.findOne({
      where: { id: jobId, company: { id: companyId } },
    });

    if (!job) {
      throw new BadRequestException(`Job ${jobId} not found`);
    }

    if (inputQuantity <= 0) {
      throw new BadRequestException('Input quantity must be greater than 0');
    }

    const batchNumber = await this.generateBatchNumber(companyId);

    const batch = this.dryingBatchRepository.create({
      companyId,
      jobId,
      processId,
      batchNumber,
      processType,
      status: DryingBatchStatus.PENDING,
      inputQuantity,
      uom,
      machineId,
      machineCode,
      recipeId,
      recipeName,
      operatorId,
      operatorName,
      shift,
      targetParameters,
      routeStepId,
      createdBy: userId,
      updatedBy: userId,
    });

    const savedBatch = await this.dryingBatchRepository.save(batch);

    // Audit
    await this.auditRepository.save({
      companyId,
      batchId: savedBatch.id,
      action: 'create',
      newValues: JSON.stringify({
        batchNumber: savedBatch.batchNumber,
        processType,
        inputQuantity,
        status: DryingBatchStatus.PENDING,
      }),
      userId,
      reason: 'Batch created',
    });

    return savedBatch;
  }

  /**
   * Start a drying batch
   */
  async startBatch(
    companyId: string,
    batchId: string,
    userId: string,
  ): Promise<DryingBatch> {
    const batch = await this.dryingBatchRepository.findOne({
      where: { id: batchId, companyId },
    });

    if (!batch) {
      throw new BadRequestException(`Batch ${batchId} not found`);
    }

    if (!batch.canStart()) {
      throw new BadRequestException(
        `Cannot start batch in ${batch.status} status`,
      );
    }

    const previousValues = { status: batch.status };

    batch.status = DryingBatchStatus.IN_PROGRESS;
    batch.startedAt = new Date();
    batch.updatedBy = userId;

    const savedBatch = await this.dryingBatchRepository.save(batch);

    // Audit
    await this.auditRepository.save({
      companyId,
      batchId: savedBatch.id,
      action: 'start',
      previousValues: JSON.stringify(previousValues),
      newValues: JSON.stringify({ status: DryingBatchStatus.IN_PROGRESS }),
      userId,
      reason: 'Batch started',
    });

    return savedBatch;
  }

  /**
   * Pause a running drying batch
   */
  async pauseBatch(
    companyId: string,
    batchId: string,
    reason: string,
    userId: string,
  ): Promise<DryingBatch> {
    const batch = await this.dryingBatchRepository.findOne({
      where: { id: batchId, companyId },
    });

    if (!batch) {
      throw new BadRequestException(`Batch ${batchId} not found`);
    }

    if (!batch.canPause()) {
      throw new BadRequestException(
        `Cannot pause batch in ${batch.status} status`,
      );
    }

    const previousValues = { status: batch.status };

    batch.status = DryingBatchStatus.PAUSED;
    batch.pausedAt = new Date();
    batch.updatedBy = userId;

    const savedBatch = await this.dryingBatchRepository.save(batch);

    // Audit
    await this.auditRepository.save({
      companyId,
      batchId: savedBatch.id,
      action: 'pause',
      previousValues: JSON.stringify(previousValues),
      newValues: JSON.stringify({ status: DryingBatchStatus.PAUSED }),
      userId,
      userName: batch.operatorName,
      reason: reason || 'Batch paused',
    });

    return savedBatch;
  }

  /**
   * Resume a paused drying batch
   */
  async resumeBatch(
    companyId: string,
    batchId: string,
    userId: string,
  ): Promise<DryingBatch> {
    const batch = await this.dryingBatchRepository.findOne({
      where: { id: batchId, companyId },
    });

    if (!batch) {
      throw new BadRequestException(`Batch ${batchId} not found`);
    }

    if (!batch.canResume()) {
      throw new BadRequestException(
        `Cannot resume batch in ${batch.status} status`,
      );
    }

    const previousValues = { status: batch.status };

    batch.status = DryingBatchStatus.IN_PROGRESS;
    batch.updatedBy = userId;

    const savedBatch = await this.dryingBatchRepository.save(batch);

    // Audit
    await this.auditRepository.save({
      companyId,
      batchId: savedBatch.id,
      action: 'resume',
      previousValues: JSON.stringify(previousValues),
      newValues: JSON.stringify({ status: DryingBatchStatus.IN_PROGRESS }),
      userId,
      reason: 'Batch resumed',
    });

    return savedBatch;
  }

  /**
   * Record actual drying parameters during execution
   */
  async recordActualParameters(
    companyId: string,
    batchId: string,
    actualParameters: Record<string, any>,
    userId: string,
  ): Promise<DryingBatch> {
    const batch = await this.dryingBatchRepository.findOne({
      where: { id: batchId, companyId },
    });

    if (!batch) {
      throw new BadRequestException(`Batch ${batchId} not found`);
    }

    if (!batch.isInProgress() && !batch.isPaused()) {
      throw new BadRequestException(
        'Can only record parameters for in-progress batches',
      );
    }

    const previousValues = { actualParameters: batch.actualParameters };

    batch.actualParameters = actualParameters;
    batch.updatedBy = userId;

    const savedBatch = await this.dryingBatchRepository.save(batch);

    // Audit
    await this.auditRepository.save({
      companyId,
      batchId: savedBatch.id,
      action: 'record_parameters',
      previousValues: JSON.stringify(previousValues),
      newValues: JSON.stringify({ actualParameters }),
      userId,
      reason: 'Drying parameters recorded',
    });

    return savedBatch;
  }

  /**
   * Complete a drying batch with output and loss tracking
   */
  async completeBatch(
    companyId: string,
    batchId: string,
    outputQuantity: number,
    qualityNotes: string,
    remarks: string,
    userId: string,
  ): Promise<DryingBatch> {
    const batch = await this.dryingBatchRepository.findOne({
      where: { id: batchId, companyId },
      relations: ['job'],
    });

    if (!batch) {
      throw new BadRequestException(`Batch ${batchId} not found`);
    }

    if (!batch.canComplete()) {
      throw new BadRequestException(
        `Cannot complete batch in ${batch.status} status`,
      );
    }

    if (outputQuantity < 0) {
      throw new BadRequestException('Output quantity cannot be negative');
    }

    // Allow output > input only with supervisor override
    if (outputQuantity > batch.inputQuantity && !batch.supervisorOverride) {
      throw new BadRequestException(
        'Output cannot exceed input. Request supervisor override.',
      );
    }

    const previousValues = {
      status: batch.status,
      outputQuantity: batch.outputQuantity,
      lossQuantity: batch.lossQuantity,
      lossPercentage: batch.lossPercentage,
    };

    batch.outputQuantity = outputQuantity;
    batch.calculateLoss();
    batch.status = DryingBatchStatus.COMPLETED;
    batch.completedAt = new Date();
    batch.qualityNotes = qualityNotes;
    batch.remarks = remarks;
    batch.updatedBy = userId;

    // Calculate duration in minutes
    if (batch.startedAt) {
      const durationMs = batch.completedAt.getTime() - batch.startedAt.getTime();
      batch.durationMinutes = durationMs / (1000 * 60);
    }

    const savedBatch = await this.dryingBatchRepository.save(batch);

    // Audit
    await this.auditRepository.save({
      companyId,
      batchId: savedBatch.id,
      action: 'complete',
      previousValues: JSON.stringify(previousValues),
      newValues: JSON.stringify({
        status: DryingBatchStatus.COMPLETED,
        outputQuantity,
        lossQuantity: savedBatch.lossQuantity,
        lossPercentage: savedBatch.lossPercentage,
      }),
      userId,
      reason: 'Batch completed',
    });

    // Auto-complete route step and unlock next process
    try {
      if (savedBatch.routeStepId) {
        await this.processRouteService.completeStep(
          savedBatch.routeStepId,
          outputQuantity,
          companyId,
        );
      }
    } catch (error) {
      console.error('Failed to complete route step:', error);
    }

    return savedBatch;
  }

  /**
   * Supervisor override for output > input scenarios
   * Example: fabric absorbed water during drying
   */
  async supervisorOverride(
    companyId: string,
    batchId: string,
    outputQuantity: number,
    reason: string,
    supervisorId: string,
  ): Promise<DryingBatch> {
    const batch = await this.dryingBatchRepository.findOne({
      where: { id: batchId, companyId },
    });

    if (!batch) {
      throw new BadRequestException(`Batch ${batchId} not found`);
    }

    if (outputQuantity <= batch.inputQuantity) {
      throw new BadRequestException(
        'Supervisor override is only needed when output exceeds input',
      );
    }

    const previousValues = {
      supervisorOverride: batch.supervisorOverride,
      outputQuantity: batch.outputQuantity,
    };

    batch.supervisorOverride = true;
    batch.outputQuantity = outputQuantity;
    batch.calculateLoss();
    batch.supervisorId = supervisorId;
    batch.supervisorOverrideReason = reason;
    batch.supervisorOverrideAt = new Date();

    const savedBatch = await this.dryingBatchRepository.save(batch);

    // Audit
    await this.auditRepository.save({
      companyId,
      batchId: savedBatch.id,
      action: 'supervisor_override',
      previousValues: JSON.stringify(previousValues),
      newValues: JSON.stringify({
        supervisorOverride: true,
        outputQuantity,
        lossQuantity: savedBatch.lossQuantity,
      }),
      userId: supervisorId,
      reason: `Supervisor override: ${reason}`,
    });

    return savedBatch;
  }

  /**
   * Reject a drying batch
   */
  async rejectBatch(
    companyId: string,
    batchId: string,
    reason: string,
    userId: string,
  ): Promise<DryingBatch> {
    const batch = await this.dryingBatchRepository.findOne({
      where: { id: batchId, companyId },
    });

    if (!batch) {
      throw new BadRequestException(`Batch ${batchId} not found`);
    }

    if (batch.isCompleted()) {
      throw new BadRequestException('Cannot reject a completed batch');
    }

    const previousValues = { status: batch.status };

    batch.status = DryingBatchStatus.REJECTED;
    batch.remarks = reason;
    batch.updatedBy = userId;

    const savedBatch = await this.dryingBatchRepository.save(batch);

    // Audit
    await this.auditRepository.save({
      companyId,
      batchId: savedBatch.id,
      action: 'reject',
      previousValues: JSON.stringify(previousValues),
      newValues: JSON.stringify({ status: DryingBatchStatus.REJECTED }),
      userId,
      reason: `Batch rejected: ${reason}`,
    });

    return savedBatch;
  }

  /**
   * Get batch with full details
   */
  async getBatchById(
    companyId: string,
    batchId: string,
  ): Promise<DryingBatch> {
    const batch = await this.dryingBatchRepository.findOne({
      where: { id: batchId, companyId },
      relations: ['job', 'process', 'company'],
    });

    if (!batch) {
      throw new BadRequestException(`Batch ${batchId} not found`);
    }

    return batch;
  }

  /**
   * Get all batches for a job
   */
  async getBatchesByJob(
    companyId: string,
    jobId: string,
  ): Promise<DryingBatch[]> {
    return this.dryingBatchRepository.find({
      where: { companyId, jobId },
      relations: ['job', 'process'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get audit trail for a batch
   */
  async getAuditTrail(
    companyId: string,
    batchId: string,
  ): Promise<DryingBatchAudit[]> {
    return this.auditRepository.find({
      where: { companyId, batchId },
      order: { createdAt: 'ASC' },
    });
  }
}
