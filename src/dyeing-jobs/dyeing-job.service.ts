import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/company.entity';
import { DyeingJob, DyeingJobStatus, TrackingStatus } from './dyeing-job.entity';
import { ProcessStage, ProcessStageStatus } from './process-stage.entity';
import { GoodsReceiptNote } from './grn.entity';
import { date, decimal, text } from '../common/input';

@Injectable()
export class DyeingJobService {
  constructor(
    @InjectRepository(DyeingJob)
    private readonly jobRepo: Repository<DyeingJob>,
    @InjectRepository(ProcessStage)
    private readonly stageRepo: Repository<ProcessStage>,
    @InjectRepository(GoodsReceiptNote)
    private readonly grnRepo: Repository<GoodsReceiptNote>,
  ) {}

  async create(data: any, companyId: string) {
    // DEPRECATED RECEIVING FIELDS: These are kept for backward compatibility only.
    // New receiving workflows MUST use the FabricReceipt entity (fabric-receiving module).
    // For new jobs, create a FabricReceipt first, then create the DyeingJob with reference.
    const quantityReceived = data.quantityReceived ? decimal(data.quantityReceived, 'Received quantity', { min: 0.001 }) : null;
    const unit = text(data.unit, 'Unit', { required: true, max: 10 }).toUpperCase();
    const receivedDate = data.receivedDate ? date(data.receivedDate, 'Received date') : null;

    const job = this.jobRepo.create({
      jobNo: text(data.jobNo, 'Job number', { required: true, max: 50 }),
      customerName: text(data.customerName, 'Customer name', { required: true, max: 150 }),
      customerContact: text(data.customerContact, 'Customer contact', { max: 30 }),
      fabricType: text(data.fabricType, 'Fabric type', { required: true, max: 100 }),
      colour: text(data.colour, 'Colour', { max: 50 }),
      shadeNo: text(data.shadeNo, 'Shade number', { max: 50 }),
      unit,
      quantityReceived,
      quantityDelivered: 0,
      status: DyeingJobStatus.RECEIVED,
      trackingStatus: TrackingStatus.FABRIC_RECEIVED,
      partyDcNo: text(data.partyDcNo, 'Party DC number', { max: 50, required: false }),
      receivedDate,
      expectedDeliveryDate: date(data.expectedDeliveryDate, 'Expected delivery date', false),
      processNotes: text(data.processNotes, 'Process notes', { max: 1000 }),
      company: { id: companyId } as Company,
    });
    const savedJob = await this.jobRepo.save(job);

    // Auto-create the inward GRN when vehicle/roll/lot/inspection details are provided at intake.
    const hasGrnDetails = [data.vehicleNo, data.lotNumber, data.rollCount, data.weight, data.inspectionNotes]
      .some(value => value !== undefined && value !== null && value !== '');
    if (hasGrnDetails) {
      await this.createGrn(savedJob.id, { ...data, receivedDate: data.receivedDate }, companyId);
    }

    return savedJob;
  }

  async findAll(companyId: string) {
    return await this.jobRepo.find({
      where: { company: { id: companyId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(companyId: string) {
    return await this.jobRepo.find({
      where: {
        company: { id: companyId },
        trackingStatus: TrackingStatus.READY_FOR_INVOICE,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: string,
    status: DyeingJobStatus,
    quantityDelivered: number | undefined,
    companyId: string,
  ) {
    const job = await this.jobRepo.findOne({
      where: { id, company: { id: companyId } },
    });
    if (!job) {
      throw new NotFoundException('Dyeing job not found');
    }
    if (!Object.values(DyeingJobStatus).includes(status)) {
      throw new BadRequestException('Invalid dyeing job status');
    }
    if (status !== this.statusForTrackingStatus(job.trackingStatus)) {
      throw new BadRequestException('Job status is derived from its current workflow stage');
    }

    const delivered = quantityDelivered === undefined
      ? Number(job.quantityDelivered)
      : Number(quantityDelivered);
    if (!Number.isFinite(delivered) || delivered < 0 || delivered > Number(job.quantityReceived)) {
      throw new BadRequestException('Delivered quantity must be between zero and received quantity');
    }

    job.status = status;
    job.quantityDelivered = delivered;
    return this.jobRepo.save(job);
  }

  private async findJobOrFail(id: string, companyId: string): Promise<DyeingJob> {
    const job = await this.jobRepo.findOne({
      where: { id, company: { id: companyId } },
    });
    if (!job) {
      throw new NotFoundException('Dyeing job not found');
    }
    return job;
  }

  async getJobWithSummary(id: string, companyId: string) {
    const job = await this.findJobOrFail(id, companyId);
    const stages = await this.stageRepo.find({
      where: { dyeingJob: { id: job.id } },
      order: { sequence: 'ASC' },
    });
    const grns = await this.grnRepo.find({
      where: { dyeingJob: { id: job.id } },
      order: { createdAt: 'DESC' },
    });
    return { ...job, stages, grns, ...this.computeWastage(job, stages) };
  }

  async listStages(jobId: string, companyId: string) {
    await this.findJobOrFail(jobId, companyId);
    return await this.stageRepo.find({
      where: { dyeingJob: { id: jobId } },
      order: { sequence: 'ASC' },
    });
  }

  async addStage(jobId: string, data: any, companyId: string) {
    const job = await this.findJobOrFail(jobId, companyId);
    const stageName = text(data.stageName, 'Stage name', { required: true, max: 100 });

    const existingStages = await this.stageRepo.find({
      where: { dyeingJob: { id: job.id } },
      order: { sequence: 'DESC' },
      take: 1,
    });
    const previousStage = existingStages[0];
    const sequence = previousStage ? previousStage.sequence + 1 : 1;

    // Default input to the previous stage's output, or the job's received quantity for the first stage.
    const defaultInput = previousStage
      ? Number(previousStage.outputQty ?? previousStage.inputQty ?? 0)
      : Number(job.quantityReceived);
    const inputQty = data.inputQty === undefined || data.inputQty === null || data.inputQty === ''
      ? defaultInput
      : decimal(data.inputQty, 'Input quantity', { min: 0 });

    const stage = this.stageRepo.create({
      dyeingJob: job,
      stageName,
      sequence,
      inputQty,
      outputQty: null,
      status: ProcessStageStatus.PENDING,
      notes: text(data.notes, 'Notes', { max: 500 }),
    });
    const saved = await this.stageRepo.save(stage);

    return saved;
  }

  async updateStage(jobId: string, stageId: string, data: any, companyId: string) {
    const job = await this.findJobOrFail(jobId, companyId);
    const stage = await this.stageRepo.findOne({
      where: { id: stageId, dyeingJob: { id: job.id } },
    });
    if (!stage) {
      throw new NotFoundException('Process stage not found');
    }

    if (data.action === 'start') {
      if (stage.status !== ProcessStageStatus.PENDING) {
        throw new BadRequestException('Only a pending stage can be started');
      }
      stage.status = ProcessStageStatus.IN_PROGRESS;
      stage.startedAt = new Date();
    } else if (data.action === 'complete') {
      if (stage.status === ProcessStageStatus.COMPLETED) {
        throw new BadRequestException('Stage is already completed');
      }
      const maxInput = stage.inputQty !== null ? Number(stage.inputQty) : Number(job.quantityReceived);
      const outputQty = decimal(data.outputQty, 'Output quantity', { min: 0, max: maxInput });
      stage.outputQty = outputQty;
      stage.status = ProcessStageStatus.COMPLETED;
      stage.completedAt = new Date();
      if (!stage.startedAt) stage.startedAt = stage.completedAt;
    } else {
      throw new BadRequestException('Invalid stage action');
    }

    if (typeof data.notes === 'string') {
      stage.notes = text(data.notes, 'Notes', { max: 500 });
    }

    const savedStage = await this.stageRepo.save(stage);

    // The last completed process stage provides the delivered quantity; workflow
    // progression is still controlled exclusively by the ordered tracking stages.
    const allStages = await this.stageRepo.find({
      where: { dyeingJob: { id: job.id } },
      order: { sequence: 'DESC' },
    });
    const finalStage = allStages[0];
    if (
      finalStage &&
      finalStage.id === savedStage.id &&
      finalStage.status === ProcessStageStatus.COMPLETED &&
      finalStage.outputQty !== null
    ) {
      job.quantityDelivered = Number(finalStage.outputQty);
      await this.jobRepo.save(job);
    }

    return savedStage;
  }

  private computeWastage(job: DyeingJob, stages: ProcessStage[]) {
    const completedStages = stages.filter(
      stage => stage.status === ProcessStageStatus.COMPLETED && stage.outputQty !== null,
    );
    const finalOutput = completedStages.length
      ? Number(completedStages[completedStages.length - 1].outputQty)
      : null;
    const inputQty = Number(job.quantityReceived);
    const wastageQty = finalOutput === null ? null : Number((inputQty - finalOutput).toFixed(3));
    const wastagePercent = finalOutput === null || inputQty <= 0
      ? null
      : Number(((wastageQty! / inputQty) * 100).toFixed(2));
    return {
      inputQty,
      outputQty: finalOutput,
      wastageQty,
      wastagePercent,
    };
  }

  // ================= GRN (fabric inward) =================

  async createGrn(jobId: string, data: any, companyId: string) {
    const job = await this.findJobOrFail(jobId, companyId);

    const grn = this.grnRepo.create({
      grnNo: text(data.grnNo, 'GRN number', { max: 50 }) || `GRN-${Date.now()}`,
      dyeingJob: job,
      company: { id: companyId } as Company,
      vehicleNo: text(data.vehicleNo, 'Vehicle number', { max: 30 }),
      lotNumber: text(data.lotNumber, 'Lot number', { max: 50 }),
      colour: text(data.colour, 'Colour', { max: 50 }),
      rollCount: data.rollCount === undefined || data.rollCount === null || data.rollCount === ''
        ? null
        : decimal(data.rollCount, 'Roll count', { min: 0 }),
      weight: data.weight === undefined || data.weight === null || data.weight === ''
        ? null
        : decimal(data.weight, 'Weight', { min: 0 }),
      inspectionNotes: text(data.inspectionNotes, 'Inspection notes', { max: 1000 }),
      receivedDate: date(data.receivedDate, 'Received date', false) ?? job.receivedDate,
    });
    return this.grnRepo.save(grn);
  }

  async listGrns(jobId: string, companyId: string) {
    await this.findJobOrFail(jobId, companyId);
    return await this.grnRepo.find({
      where: { dyeingJob: { id: jobId } },
      order: { createdAt: 'DESC' },
    });
  }

  // ================= Live production/status board =================

  async updateTrackingStatus(jobId: string, trackingStatus: TrackingStatus, companyId: string) {
    const job = await this.findJobOrFail(jobId, companyId);
    if (!Object.values(TrackingStatus).includes(trackingStatus)) {
      throw new BadRequestException('Invalid tracking status');
    }

    const workflow = Object.values(TrackingStatus);
    const currentIndex = workflow.indexOf(job.trackingStatus);
    const nextStatus = workflow[currentIndex + 1];
    if (trackingStatus !== nextStatus) {
      throw new BadRequestException(
        `Jobs must advance one stage at a time. The next stage is ${nextStatus ?? 'not available because the workflow is closed'}`,
      );
    }

    job.trackingStatus = trackingStatus;
    job.status = this.statusForTrackingStatus(trackingStatus);
    return this.jobRepo.save(job);
  }

  private statusForTrackingStatus(trackingStatus: TrackingStatus): DyeingJobStatus {
    if (trackingStatus === TrackingStatus.FABRIC_RECEIVED) {
      return DyeingJobStatus.RECEIVED;
    }
    if (trackingStatus === TrackingStatus.READY_FOR_DELIVERY) {
      return DyeingJobStatus.READY_FOR_DELIVERY;
    }
    if (
      trackingStatus === TrackingStatus.DELIVERY ||
      trackingStatus === TrackingStatus.READY_FOR_INVOICE ||
      trackingStatus === TrackingStatus.GST_INVOICE ||
      trackingStatus === TrackingStatus.PAYMENT_CLOSED
    ) {
      return DyeingJobStatus.DELIVERED;
    }
    return DyeingJobStatus.IN_PROCESS;
  }

  async getStatusBoard(companyId: string) {
    const jobs = await this.jobRepo.find({
      where: { company: { id: companyId } },
      order: { updatedAt: 'DESC' },
    });
    const board: Record<string, DyeingJob[]> = {};
    for (const status of Object.values(TrackingStatus)) {
      board[status] = [];
    }
    for (const job of jobs) {
      board[job.trackingStatus].push(job);
    }
    return board;
  }
}
