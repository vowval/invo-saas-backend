import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ReprocessRequest,
  ReprocessRequestStatus,
} from './reprocess-request.entity';
import { ReprocessCycle, ReprocessCycleStatus } from './reprocess-cycle.entity';
import {
  ReprocessStepHistory,
  ReprocessStepStatus,
} from './reprocess-step-history.entity';
import { ReprocessAudit } from './reprocess-audit.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { User } from '../users/user.entity';
import { QcExecution } from '../quality-control/qc-execution.entity';

@Injectable()
export class ReprocessingService {
  constructor(
    @InjectRepository(ReprocessRequest)
    private readonly reprocessRequestRepo: Repository<ReprocessRequest>,
    @InjectRepository(ReprocessCycle)
    private readonly reprocessCycleRepo: Repository<ReprocessCycle>,
    @InjectRepository(ReprocessStepHistory)
    private readonly stepHistoryRepo: Repository<ReprocessStepHistory>,
    @InjectRepository(ReprocessAudit)
    private readonly auditRepo: Repository<ReprocessAudit>,
    @InjectRepository(DyeingJob)
    private readonly dyeingJobRepo: Repository<DyeingJob>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(QcExecution)
    private readonly qcExecutionRepo: Repository<QcExecution>,
  ) {}

  /**
   * Creates a new Reprocess Request when QC fails
   * Transitions: (implicit PENDING status on creation)
   */
  async createReprocessRequest(data: {
    jobId: string;
    qcExecutionId: string;
    failureReason: string;
    proposedAction: string; // e.g., "Reactive Dyeing", "Washing"
    userId: string;
  }): Promise<ReprocessRequest> {
    const job = await this.dyeingJobRepo.findOne({
      where: { id: data.jobId },
    });

    const qcExecution = await this.qcExecutionRepo.findOne({
      where: { id: data.qcExecutionId },
    });

    const user = await this.userRepo.findOne({
      where: { id: data.userId },
    });

    const request = this.reprocessRequestRepo.create({
      job,
      qcExecution,
      failureReason: data.failureReason,
      proposedAction: data.proposedAction,
      status: ReprocessRequestStatus.PENDING,
      requestedBy: user,
      requestedAt: new Date(),
    });

    return await this.reprocessRequestRepo.save(request);
  }

  /**
   * Authorizes a reprocess request
   * Transitions: PENDING → AUTHORIZED
   * Creates initial ReprocessCycle with cycle number 1
   */
  async authorizeReprocess(data: {
    requestId: string;
    userId: string;
  }): Promise<ReprocessRequest> {
    const request = await this.reprocessRequestRepo.findOne({
      where: { id: data.requestId },
      relations: ['job', 'authorizedBy'],
    });

    if (!request) {
      throw new Error(`Reprocess request ${data.requestId} not found`);
    }

    if (!request.canAuthorize()) {
      throw new Error(
        `Cannot authorize reprocess request with status ${request.status}`,
      );
    }

    const user = await this.userRepo.findOne({
      where: { id: data.userId },
    });

    request.status = ReprocessRequestStatus.AUTHORIZED;
    request.authorizedBy = user;
    request.authorizedAt = new Date();

    const updatedRequest = await this.reprocessRequestRepo.save(request);

    // Create first Reprocess Cycle
    const cycle = await this.createReprocessCycle({
      reprocessRequest: updatedRequest,
      job: request.job,
      cycleNumber: 1,
      startProcess: updatedRequest.proposedAction,
    });

    // Create audit trail
    await this.createAudit(
      cycle,
      'REPROCESS_AUTHORIZED',
      null,
      {
        proposedAction: updatedRequest.proposedAction,
        cycleCreated: cycle.id,
      },
      `Reprocess authorized for job ${request.job.id}. Cycle #${cycle.cycleNumber} created.`,
      user,
    );

    return updatedRequest;
  }

  /**
   * Rejects a reprocess request
   * Transitions: PENDING → REJECTED
   */
  async rejectReprocess(data: {
    requestId: string;
    rejectionReason: string;
    userId: string;
  }): Promise<ReprocessRequest> {
    const request = await this.reprocessRequestRepo.findOne({
      where: { id: data.requestId },
      relations: ['job'],
    });

    if (!request) {
      throw new Error(`Reprocess request ${data.requestId} not found`);
    }

    if (!request.canReject()) {
      throw new Error(
        `Cannot reject reprocess request with status ${request.status}`,
      );
    }

    const user = await this.userRepo.findOne({
      where: { id: data.userId },
    });

    request.status = ReprocessRequestStatus.REJECTED;
    request.rejectionReason = data.rejectionReason;

    const updatedRequest = await this.reprocessRequestRepo.save(request);

    return updatedRequest;
  }

  /**
   * Creates a new Reprocess Cycle
   * This happens after authorization of a request
   */
  private async createReprocessCycle(data: {
    reprocessRequest: ReprocessRequest;
    job: DyeingJob;
    cycleNumber: number;
    startProcess: string; // e.g., "Reactive Dyeing"
  }): Promise<ReprocessCycle> {
    const cycle = this.reprocessCycleRepo.create({
      reprocessRequest: data.reprocessRequest,
      job: data.job,
      cycleNumber: data.cycleNumber,
      startProcess: data.startProcess,
      cycleStatus: ReprocessCycleStatus.PENDING,
      // Quantities will be filled as steps complete
      originalInput: 0,
      originalOutput: 0,
      originalLoss: 0,
      reprocessInput: 0,
    });

    return await this.reprocessCycleRepo.save(cycle);
  }

  /**
   * Starts a reprocess cycle
   * Transitions: PENDING → IN_PROGRESS
   */
  async startReprocessCycle(data: {
    cycleId: string;
    userId: string;
  }): Promise<ReprocessCycle> {
    const cycle = await this.reprocessCycleRepo.findOne({
      where: { id: data.cycleId },
      relations: ['reprocessRequest'],
    });

    if (!cycle) {
      throw new Error(`Reprocess cycle ${data.cycleId} not found`);
    }

    if (!cycle.canStart()) {
      throw new Error(
        `Cannot start reprocess cycle with status ${cycle.cycleStatus}`,
      );
    }

    const user = await this.userRepo.findOne({
      where: { id: data.userId },
    });

    cycle.cycleStatus = ReprocessCycleStatus.IN_PROGRESS;
    cycle.startedAt = new Date();

    const updatedCycle = await this.reprocessCycleRepo.save(cycle);

    // Create audit trail
    await this.createAudit(
      updatedCycle,
      'REPROCESS_CYCLE_STARTED',
      null,
      { status: 'IN_PROGRESS' },
      `Reprocess cycle #${cycle.cycleNumber} started`,
      user,
    );

    return updatedCycle;
  }

  /**
   * Records completion of a reprocess step (a process within the cycle)
   * Creates ReprocessStepHistory entry
   */
  async recordReprocessStepCompletion(data: {
    cycleId: string;
    processType: string; // e.g., "Reactive Dyeing"
    stepOrder: number;
    executionData?: Record<string, any>;
    userId: string;
  }): Promise<ReprocessStepHistory> {
    const cycle = await this.reprocessCycleRepo.findOne({
      where: { id: data.cycleId },
    });

    if (!cycle) {
      throw new Error(`Reprocess cycle ${data.cycleId} not found`);
    }

    if (!cycle.canComplete()) {
      throw new Error(
        `Cannot record step completion in cycle with status ${cycle.cycleStatus}`,
      );
    }

    const user = await this.userRepo.findOne({
      where: { id: data.userId },
    });

    const step = this.stepHistoryRepo.create({
      cycle,
      processType: data.processType,
      stepOrder: data.stepOrder,
      status: ReprocessStepStatus.COMPLETED,
      executionData: data.executionData || {},
    });

    const savedStep = await this.stepHistoryRepo.save(step);

    // Create audit trail
    await this.createAudit(
      cycle,
      'REPROCESS_STEP_COMPLETED',
      null,
      {
        stepOrder: data.stepOrder,
        processType: data.processType,
      },
      `Step #${data.stepOrder} (${data.processType}) completed`,
      user,
    );

    return savedStep;
  }

  /**
   * Completes a reprocess cycle
   * Transitions: IN_PROGRESS → COMPLETED
   */
  async completeReprocessCycle(data: {
    cycleId: string;
    reprocessOutput: number;
    reprocessLoss: number;
    remarks?: string;
    userId: string;
  }): Promise<ReprocessCycle> {
    const cycle = await this.reprocessCycleRepo.findOne({
      where: { id: data.cycleId },
    });

    if (!cycle) {
      throw new Error(`Reprocess cycle ${data.cycleId} not found`);
    }

    if (!cycle.canComplete()) {
      throw new Error(
        `Cannot complete reprocess cycle with status ${cycle.cycleStatus}`,
      );
    }

    const user = await this.userRepo.findOne({
      where: { id: data.userId },
    });

    cycle.cycleStatus = ReprocessCycleStatus.COMPLETED;
    cycle.reprocessOutput = data.reprocessOutput;
    cycle.reprocessLoss = data.reprocessLoss;
    cycle.completedAt = new Date();
    cycle.remarks = data.remarks || null;

    // Calculate additional loss
    cycle.calculateLoss();

    const updatedCycle = await this.reprocessCycleRepo.save(cycle);

    // Create audit trail
    await this.createAudit(
      updatedCycle,
      'REPROCESS_CYCLE_COMPLETED',
      null,
      {
        status: 'COMPLETED',
        reprocessOutput: data.reprocessOutput,
        reprocessLoss: data.reprocessLoss,
      },
      `Reprocess cycle #${cycle.cycleNumber} completed. Output: ${data.reprocessOutput}kg, Loss: ${data.reprocessLoss}kg`,
      user,
    );

    return updatedCycle;
  }

  /**
   * Retrieves complete reprocess history for a job
   */
  async getReprocessHistory(jobId: string): Promise<{
    requests: ReprocessRequest[];
    cycles: ReprocessCycle[];
    steps: ReprocessStepHistory[];
    audits: ReprocessAudit[];
  }> {
    // Get all requests for this job
    const requests = await this.reprocessRequestRepo.find({
      where: { job: { id: jobId } },
      relations: ['requestedBy', 'authorizedBy', 'qcExecution'],
    });

    // Get all cycles for these requests
    const requestIds = requests.map((r) => r.id);
    let cycles: ReprocessCycle[] = [];
    let steps: ReprocessStepHistory[] = [];
    let audits: ReprocessAudit[] = [];

    if (requestIds.length > 0) {
      cycles = await this.reprocessCycleRepo.find({
        where: requestIds.map((id) => ({
          reprocessRequest: { id },
        })),
        relations: ['reprocessRequest'],
      });

      const cycleIds = cycles.map((c) => c.id);
      if (cycleIds.length > 0) {
        steps = await this.stepHistoryRepo.find({
          where: cycleIds.map((id) => ({
            cycle: { id },
          })),
        });

        audits = await this.auditRepo.find({
          where: cycleIds.map((id) => ({
            cycle: { id },
          })),
          relations: ['user'],
        });
      }
    }

    return { requests, cycles, steps, audits };
  }

  /**
   * Calculates cost analysis across all reprocess cycles for a job
   */
  async calculateCostAnalysis(jobId: string): Promise<{
    totalOriginalInput: number;
    totalOriginalOutput: number;
    totalOriginalLoss: number;
    totalReprocessInput: number;
    totalReprocessOutput: number;
    totalReprocessLoss: number;
    totalAdditionalLoss: number;
    cycleCount: number;
  }> {
    const cycles = await this.reprocessCycleRepo.find({
      where: {
        job: { id: jobId },
        cycleStatus: ReprocessCycleStatus.COMPLETED,
      },
    });

    const analysis = {
      totalOriginalInput: 0,
      totalOriginalOutput: 0,
      totalOriginalLoss: 0,
      totalReprocessInput: 0,
      totalReprocessOutput: 0,
      totalReprocessLoss: 0,
      totalAdditionalLoss: 0,
      cycleCount: cycles.length,
    };

    for (const cycle of cycles) {
      analysis.totalOriginalInput += cycle.originalInput || 0;
      analysis.totalOriginalOutput += cycle.originalOutput || 0;
      analysis.totalOriginalLoss += cycle.originalLoss || 0;
      analysis.totalReprocessInput += cycle.reprocessInput || 0;
      analysis.totalReprocessOutput += cycle.reprocessOutput || 0;
      analysis.totalReprocessLoss += cycle.reprocessLoss || 0;
      analysis.totalAdditionalLoss += cycle.additionalLoss || 0;
    }

    return analysis;
  }

  /**
   * Helper: Create audit trail entry for a cycle
   */
  private async createAudit(
    cycle: ReprocessCycle,
    action: string,
    previousValues: Record<string, any> | null,
    newValues: Record<string, any>,
    reason: string,
    user: User,
  ): Promise<ReprocessAudit> {
    const audit = this.auditRepo.create({
      cycle,
      action,
      previousValues,
      newValues,
      reason,
      user,
      userName: user?.email || 'system',
    });

    return await this.auditRepo.save(audit);
  }
}
