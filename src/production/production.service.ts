import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/company.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { Machine, MachineStatus } from './machine.entity';
import { Batch, BatchStatus } from './batch.entity';
import { decimal, text } from '../common/input';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(Machine)
    private readonly machineRepo: Repository<Machine>,
    @InjectRepository(Batch)
    private readonly batchRepo: Repository<Batch>,
    @InjectRepository(DyeingJob)
    private readonly jobRepo: Repository<DyeingJob>,
  ) {}

  // ================= Machines =================

  async createMachine(data: any, companyId: string) {
    const machine = this.machineRepo.create({
      name: text(data.name, 'Machine name', { required: true, max: 100 }),
      machineType: text(data.machineType, 'Machine type', { max: 100 }),
      status: MachineStatus.IDLE,
      company: { id: companyId } as Company,
    });
    return this.machineRepo.save(machine);
  }

  listMachines(companyId: string) {
    return this.machineRepo.find({
      where: { company: { id: companyId } },
      order: { name: 'ASC' },
    });
  }

  async setMachineStatus(id: string, status: MachineStatus, companyId: string) {
    const machine = await this.machineRepo.findOne({ where: { id, company: { id: companyId } } });
    if (!machine) throw new NotFoundException('Machine not found');
    if (!Object.values(MachineStatus).includes(status)) {
      throw new BadRequestException('Invalid machine status');
    }
    if (status === MachineStatus.MAINTENANCE) {
      const activeBatch = await this.batchRepo.findOne({
        where: { machine: { id }, status: BatchStatus.RUNNING },
      });
      if (activeBatch) {
        throw new BadRequestException('Cannot set a machine to maintenance while a batch is running on it');
      }
    }
    machine.status = status;
    return this.machineRepo.save(machine);
  }

  // ================= Batches =================

  async createBatch(data: any, companyId: string) {
    const machineId = text(data.machineId, 'Machine', { required: true });
    const machine = await this.machineRepo.findOne({ where: { id: machineId, company: { id: companyId } } });
    if (!machine) throw new NotFoundException('Machine not found');

    let dyeingJob: DyeingJob | null = null;
    if (data.dyeingJobId) {
      dyeingJob = await this.jobRepo.findOne({
        where: { id: data.dyeingJobId, company: { id: companyId } },
      });
      if (!dyeingJob) throw new NotFoundException('Dyeing job not found');
    }

    const batch = this.batchRepo.create({
      batchNo: text(data.batchNo, 'Batch number', { required: true, max: 50 }),
      dyeingJob,
      machine,
      company: { id: companyId } as Company,
      recipe: text(data.recipe, 'Recipe', { max: 50 }),
      inputQty: data.inputQty === undefined || data.inputQty === null || data.inputQty === ''
        ? null
        : decimal(data.inputQty, 'Input quantity', { min: 0 }),
      status: BatchStatus.SCHEDULED,
    });
    return this.batchRepo.save(batch);
  }

  listBatches(companyId: string) {
    return this.batchRepo.find({
      where: { company: { id: companyId } },
      relations: ['machine', 'dyeingJob'],
      order: { createdAt: 'DESC' },
    });
  }

  private async findBatchOrFail(id: string, companyId: string) {
    const batch = await this.batchRepo.findOne({
      where: { id, company: { id: companyId } },
      relations: ['machine'],
    });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  async startBatch(id: string, companyId: string) {
    const batch = await this.findBatchOrFail(id, companyId);
    if (batch.status !== BatchStatus.SCHEDULED) {
      throw new BadRequestException('Only a scheduled batch can be started');
    }
    if (!batch.machine) {
      throw new BadRequestException('Batch has no assigned machine');
    }
    if (batch.machine.status === MachineStatus.MAINTENANCE) {
      throw new BadRequestException('Machine is under maintenance');
    }
    if (batch.machine.status === MachineStatus.RUNNING) {
      throw new BadRequestException('Machine is already running another batch');
    }

    batch.status = BatchStatus.RUNNING;
    batch.startTime = new Date();
    await this.batchRepo.save(batch);

    batch.machine.status = MachineStatus.RUNNING;
    await this.machineRepo.save(batch.machine);

    return batch;
  }

  async completeBatch(id: string, companyId: string) {
    const batch = await this.findBatchOrFail(id, companyId);
    if (batch.status !== BatchStatus.RUNNING) {
      throw new BadRequestException('Only a running batch can be completed');
    }

    batch.status = BatchStatus.COMPLETED;
    batch.endTime = new Date();
    await this.batchRepo.save(batch);

    if (batch.machine) {
      batch.machine.status = MachineStatus.IDLE;
      await this.machineRepo.save(batch.machine);
    }

    return batch;
  }

  // ================= Live machine board =================

  async getMachineBoard(companyId: string) {
    const machines = await this.listMachines(companyId);
    const runningBatches = await this.batchRepo.find({
      where: { company: { id: companyId }, status: BatchStatus.RUNNING },
      relations: ['machine', 'dyeingJob'],
    });
    const batchByMachineId = new Map(runningBatches.map(batch => [batch.machine?.id, batch]));

    return machines.map(machine => ({
      ...machine,
      currentBatch: batchByMachineId.get(machine.id) ?? null,
    }));
  }
}
