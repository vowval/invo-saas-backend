import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/company.entity';
import { DyeingJob, DyeingJobStatus } from './dyeing-job.entity';
import { date, decimal, text } from '../common/input';

@Injectable()
export class DyeingJobService {
  constructor(
    @InjectRepository(DyeingJob)
    private readonly jobRepo: Repository<DyeingJob>,
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
}
