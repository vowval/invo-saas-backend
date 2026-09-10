import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QcExecution, QcExecutionStatus, QcOverallResult } from './qc-execution.entity';
import { QcResult } from './qc-result.entity';
import { QcCheckTemplate } from './qc-check-template.entity';
import { QcAudit } from './qc-audit.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { User } from '../users/user.entity';

export interface CreateQCExecutionDto {
  jobId: string;
  inspectorId?: string;
}

export interface RecordCheckResultDto {
  executionId: string;
  checkTemplateId: string;
  actualValue: any;
  targetValue?: any;
  result: 'PASS' | 'FAIL' | 'HOLD';
  remarks?: string;
}

export interface CompleteQCDto {
  notes?: string;
}

export interface HoldQCDto {
  reason: string;
}

@Injectable()
export class QcService {
  constructor(
    @InjectRepository(QcExecution)
    private qcExecutionRepository: Repository<QcExecution>,
    @InjectRepository(QcResult)
    private qcResultRepository: Repository<QcResult>,
    @InjectRepository(QcCheckTemplate)
    private qcCheckTemplateRepository: Repository<QcCheckTemplate>,
    @InjectRepository(QcAudit)
    private qcAuditRepository: Repository<QcAudit>,
    @InjectRepository(DyeingJob)
    private dyeingJobRepository: Repository<DyeingJob>,
  ) {}

  /**
   * Create a new QC execution for a job
   * Transitions job to QC stage, set status to PENDING
   */
  async createQCExecution(
    jobId: string,
    companyId: string,
    createdBy: User,
  ): Promise<QcExecution> {
    // Verify job exists and belongs to company
    const job = await this.dyeingJobRepository.findOne({
      where: { id: jobId, company: { id: companyId } },
    });

    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    // Check if QC is already started (no concurrent QC)
    const existingQC = await this.qcExecutionRepository.findOne({
      where: {
        job: { id: jobId },
        qcStatus: QcExecutionStatus.IN_PROGRESS,
      },
    });

    if (existingQC) {
      throw new BadRequestException('QC is already in progress for this job');
    }

    // Create new QC execution
    const qcExecution = this.qcExecutionRepository.create({
      job,
      company: { id: companyId },
      qcStatus: QcExecutionStatus.PENDING,
      overallResult: null,
    });

    const saved = await this.qcExecutionRepository.save(qcExecution);

    // Create audit entry
    await this.qcAuditRepository.save({
      qcExecution: saved,
      action: 'QC_CREATED',
      reason: 'New QC execution created',
      userId: createdBy.id,
      userName: createdBy.name,
      createdAt: new Date(),
    });

    return saved;
  }

  /**
   * Start QC execution
   * Transitions from PENDING → IN_PROGRESS
   */
  async startQC(
    executionId: string,
    inspectorId: string,
    companyId: string,
    startedBy: User,
  ): Promise<QcExecution> {
    const qcExecution = await this.getQCExecution(executionId, companyId);

    if (!qcExecution.canStart()) {
      throw new BadRequestException(
        `Cannot start QC in ${qcExecution.qcStatus} state`,
      );
    }

    // Update QC status
    qcExecution.qcStatus = QcExecutionStatus.IN_PROGRESS;
    qcExecution.inspector = { id: inspectorId } as any;
    qcExecution.startedAt = new Date();

    const updated = await this.qcExecutionRepository.save(qcExecution);

    // Create audit entry
    await this.qcAuditRepository.save({
      qcExecution: updated,
      action: 'QC_STARTED',
      reason: 'QC inspection started',
      userId: startedBy.id,
      userName: startedBy.name,
      createdAt: new Date(),
    });

    return updated;
  }

  /**
   * Record individual check result
   * Called multiple times for each check in the QC template
   */
  async recordCheckResult(
    dto: RecordCheckResultDto,
    companyId: string,
    recordedBy: User,
  ): Promise<QcResult> {
    const { executionId, checkTemplateId, actualValue, targetValue, result, remarks } = dto;

    // Get QC execution
    const qcExecution = await this.getQCExecution(executionId, companyId);

    if (qcExecution.qcStatus !== QcExecutionStatus.IN_PROGRESS) {
      throw new BadRequestException('QC is not in progress');
    }

    // Get check template
    const template = await this.qcCheckTemplateRepository.findOne({
      where: { id: checkTemplateId, company: { id: companyId } },
    });

    if (!template) {
      throw new NotFoundException(`Check template ${checkTemplateId} not found`);
    }

    // Validate result value
    if (!['PASS', 'FAIL', 'HOLD'].includes(result)) {
      throw new BadRequestException('Invalid result value');
    }

    // Convert string to enum
    const resultEnum = result as QcOverallResult;

    // Check if this template already has a result in this execution
    const existingResult = await this.qcResultRepository.findOne({
      where: {
        qcExecution: { id: executionId },
        qcCheckTemplate: { id: checkTemplateId },
      },
    });

    let qcResult: QcResult;

    if (existingResult) {
      // Update existing result
      existingResult.actualValue = JSON.stringify(actualValue);
      existingResult.targetValue = JSON.stringify(targetValue);
      existingResult.result = resultEnum;
      existingResult.remarks = remarks || existingResult.remarks;
      existingResult.updatedAt = new Date();
      qcResult = await this.qcResultRepository.save(existingResult);
    } else {
      // Create new result
      qcResult = this.qcResultRepository.create({
        qcExecution,
        qcCheckTemplate: template,
        actualValue: JSON.stringify(actualValue),
        targetValue: JSON.stringify(targetValue),
        result: resultEnum,
        remarks: remarks || null,
      });
      qcResult = await this.qcResultRepository.save(qcResult);
    }

    // Create audit entry
    await this.qcAuditRepository.save({
      qcExecution,
      action: 'CHECK_RESULT_RECORDED',
      newValues: {
        checkTemplate: template.name,
        actualValue,
        targetValue,
        result,
      },
      reason: remarks || `${template.name} result recorded as ${result}`,
      userId: recordedBy.id,
      userName: recordedBy.name,
      createdAt: new Date(),
    });

    return qcResult;
  }

  /**
   * Complete QC execution
   * Analyzes all check results to determine overall result (PASS/FAIL/HOLD)
   */
  async completeQC(
    executionId: string,
    companyId: string,
    completedBy: User,
  ): Promise<QcExecution> {
    const qcExecution = await this.getQCExecution(executionId, companyId);

    if (!qcExecution.canComplete()) {
      throw new BadRequestException(
        `Cannot complete QC in ${qcExecution.qcStatus} state`,
      );
    }

    // Get all check results for this execution
    const results = await this.qcResultRepository.find({
      where: { qcExecution: { id: executionId } },
    });

    if (results.length === 0) {
      throw new BadRequestException('No check results recorded for this QC');
    }

    // Determine overall result based on individual results
    let overallResult: QcOverallResult;

    // If ANY result is FAIL → overall is FAIL
    if (results.some((r) => r.result === QcOverallResult.FAIL)) {
      overallResult = QcOverallResult.FAIL;
    }
    // If ANY result is HOLD and none FAIL → overall is HOLD
    else if (results.some((r) => r.result === QcOverallResult.HOLD)) {
      overallResult = QcOverallResult.HOLD;
    }
    // If ALL results are PASS → overall is PASS
    else {
      overallResult = QcOverallResult.PASS;
    }

    // Update QC execution
    qcExecution.qcStatus = QcExecutionStatus.COMPLETED;
    qcExecution.overallResult = overallResult;
    qcExecution.completedAt = new Date();

    const updated = await this.qcExecutionRepository.save(qcExecution);

    // Create audit entry
    await this.qcAuditRepository.save({
      qcExecution: updated,
      action: 'QC_COMPLETED',
      newValues: {
        status: 'COMPLETED',
        result: overallResult,
        checksPerformed: results.length,
        passCount: results.filter((r) => r.result === QcOverallResult.PASS).length,
        failCount: results.filter((r) => r.result === QcOverallResult.FAIL).length,
        holdCount: results.filter((r) => r.result === QcOverallResult.HOLD).length,
      },
      reason: `QC completed with result: ${overallResult}`,
      userId: completedBy.id,
      userName: completedBy.name,
      createdAt: new Date(),
    });

    return updated;
  }

  /**
   * Put QC on hold
   * Useful when supervisor needs to make decision
   */
  async holdQC(
    executionId: string,
    reason: string,
    companyId: string,
    heldBy: User,
  ): Promise<QcExecution> {
    const qcExecution = await this.getQCExecution(executionId, companyId);

    if (!qcExecution.canHold()) {
      throw new BadRequestException(
        `Cannot hold QC in ${qcExecution.qcStatus} state`,
      );
    }

    qcExecution.qcStatus = QcExecutionStatus.ON_HOLD;
    qcExecution.holdReason = reason;
    qcExecution.heldAt = new Date();

    const updated = await this.qcExecutionRepository.save(qcExecution);

    // Create audit entry
    await this.qcAuditRepository.save({
      qcExecution: updated,
      action: 'QC_HELD',
      reason: reason,
      userId: heldBy.id,
      userName: heldBy.name,
      createdAt: new Date(),
    });

    return updated;
  }

  /**
   * Release QC from hold
   * Supervisor releases the hold, inspection can continue
   */
  async releaseHold(
    executionId: string,
    companyId: string,
    releasedBy: User,
  ): Promise<QcExecution> {
    const qcExecution = await this.getQCExecution(executionId, companyId);

    if (!qcExecution.canResume()) {
      throw new BadRequestException(
        `Cannot resume QC from ${qcExecution.qcStatus} state`,
      );
    }

    qcExecution.qcStatus = QcExecutionStatus.IN_PROGRESS;
    qcExecution.holdReason = null;
    qcExecution.releasedAt = new Date();

    const updated = await this.qcExecutionRepository.save(qcExecution);

    // Create audit entry
    await this.qcAuditRepository.save({
      qcExecution: updated,
      action: 'QC_HOLD_RELEASED',
      reason: 'Hold released by supervisor',
      userId: releasedBy.id,
      userName: releasedBy.name,
      createdAt: new Date(),
    });

    return updated;
  }

  /**
   * Get complete QC history for a job
   * Returns all QC executions in order with full results and audit trail
   */
  async getQCHistory(
    jobId: string,
    companyId: string,
  ): Promise<QcExecution[]> {
    const executions = await this.qcExecutionRepository.find({
      where: {
        job: { id: jobId },
        company: { id: companyId },
      },
      relations: ['job', 'inspector', 'results', 'results.qcCheckTemplate'],
      order: { createdAt: 'ASC' },
    });

    return executions;
  }

  /**
   * Get single QC execution with full details
   */
  async getQCExecution(
    executionId: string,
    companyId: string,
  ): Promise<QcExecution> {
    const execution = await this.qcExecutionRepository.findOne({
      where: {
        id: executionId,
        company: { id: companyId },
      },
      relations: ['job', 'inspector', 'results', 'results.qcCheckTemplate'],
    });

    if (!execution) {
      throw new NotFoundException(`QC execution ${executionId} not found`);
    }

    return execution;
  }

  /**
   * Get QC audit trail for an execution
   */
  async getQCAudit(executionId: string, companyId: string): Promise<QcAudit[]> {
    const audits = await this.qcAuditRepository.find({
      where: {
        qcExecution: { id: executionId },
      },
      order: { createdAt: 'ASC' },
    });

    return audits;
  }

  /**
   * Get all available QC check templates for a company
   */
  async getQCCheckTemplates(
    companyId: string,
    includeInactive: boolean = false,
  ): Promise<QcCheckTemplate[]> {
    const query = this.qcCheckTemplateRepository
      .createQueryBuilder('template')
      .where('template.company_id = :companyId', { companyId });

    if (!includeInactive) {
      query.andWhere('template.is_active = true');
    }

    return query.orderBy('template.display_order', 'ASC').getMany();
  }
}
