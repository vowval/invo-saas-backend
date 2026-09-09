import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/company.entity';
import { DyeingJob, DyeingJobStatus } from './dyeing-job.entity';
import { ProcessStage, ProcessStageStatus } from './process-stage.entity';
import { date, decimal, text } from '../common/input';

@Injectable()
export class DyeingJobService {
  constructor(
    @InjectRepository(DyeingJob)
    private readonly jobRepo: Repository<DyeingJob>,
    @InjectRepository(ProcessStage)
    private readonly stageRepo: Repository<ProcessStage>,
  ) {}

  async create(data: any, companyId: string) {
    const quantityReceived = decimal(data.quantityReceived, 'Received quantity', { min: 0.001 });
    const unit = text(data.unit, 'Unit', { required: true, max: 10 }).toUpperCase();

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
      partyDcNo: text(data.partyDcNo, 'Party DC number', { max: 50 }),
      receivedDate: date(data.receivedDate, 'Received date'),
      expectedDeliveryDate: date(data.expectedDeliveryDate, 'Expected delivery date', false),
      processNotes: text(data.processNotes, 'Process notes', { max: 1000 }),
      company: { id: companyId } as Company,
    });
    return this.jobRepo.save(job);
  }

  findAll(companyId: string) {
    return this.jobRepo.find({
      where: { company: { id: companyId } },
      order: { createdAt: 'DESC' },
    });
  }

  findActive(companyId: string) {
    return this.jobRepo.find({
      where: [
        { company: { id: companyId }, status: DyeingJobStatus.RECEIVED },
        { company: { id: companyId }, status: DyeingJobStatus.IN_PROCESS },
        { company: { id: companyId }, status: DyeingJobStatus.READY_FOR_DELIVERY },
      ],
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
    return { ...job, stages, ...this.computeWastage(job, stages) };
  }

  async listStages(jobId: string, companyId: string) {
    await this.findJobOrFail(jobId, companyId);
    return this.stageRepo.find({
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

    if (job.status === DyeingJobStatus.RECEIVED) {
      job.status = DyeingJobStatus.IN_PROCESS;
      await this.jobRepo.save(job);
    }

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

    // If this was the final (highest-sequence) stage and it's now completed, sync the job's delivered quantity.
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
      job.status = DyeingJobStatus.READY_FOR_DELIVERY;
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
}
