import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Packing, PackingStatus } from './packing.entity';
import { PackingRoll } from './packing-roll.entity';
import { PackingAudit } from './packing-audit.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { User } from '../users/user.entity';

@Injectable()
export class PackingService {
  constructor(
    @InjectRepository(Packing)
    private readonly packingRepo: Repository<Packing>,
    @InjectRepository(PackingRoll)
    private readonly rollRepo: Repository<PackingRoll>,
    @InjectRepository(PackingAudit)
    private readonly auditRepo: Repository<PackingAudit>,
    @InjectRepository(DyeingJob)
    private readonly jobRepo: Repository<DyeingJob>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Creates packing record for a job
   * Can only be created after QC PASS
   */
  async createPacking(data: {
    jobId: string;
    finishedQuantity: number;
    rollCount: number;
    packageCount: number;
    packingType?: string;
    labels?: string;
    remarks?: string;
    userId: string;
  }): Promise<Packing> {
    const job = await this.jobRepo.findOne({ where: { id: data.jobId } });
    if (!job) throw new Error(`Job ${data.jobId} not found`);

    const user = await this.userRepo.findOne({ where: { id: data.userId } });

    const packing = this.packingRepo.create({
      job,
      finishedQuantity: data.finishedQuantity,
      rollCount: data.rollCount,
      packageCount: data.packageCount,
      packingType: data.packingType,
      labels: data.labels,
      remarks: data.remarks,
      status: PackingStatus.PENDING,
    });

    const savedPacking = await this.packingRepo.save(packing);

    await this.createAudit(
      savedPacking,
      'PACKING_CREATED',
      null,
      {
        finishedQuantity: data.finishedQuantity,
        rollCount: data.rollCount,
        packageCount: data.packageCount,
      },
      'Packing record created',
      user,
    );

    return savedPacking;
  }

  /**
   * Starts packing process
   */
  async startPacking(data: {
    packingId: string;
    userId: string;
  }): Promise<Packing> {
    const packing = await this.packingRepo.findOne({
      where: { id: data.packingId },
    });
    if (!packing) throw new Error(`Packing ${data.packingId} not found`);

    if (!packing.canStart()) {
      throw new Error(`Cannot start packing with status ${packing.status}`);
    }

    const user = await this.userRepo.findOne({ where: { id: data.userId } });

    packing.status = PackingStatus.IN_PROGRESS;
    const updated = await this.packingRepo.save(packing);

    await this.createAudit(
      updated,
      'PACKING_STARTED',
      { status: PackingStatus.PENDING },
      { status: PackingStatus.IN_PROGRESS },
      'Packing process started',
      user,
    );

    return updated;
  }

  /**
   * Add roll to packing
   */
  async addRoll(data: {
    packingId: string;
    rollNumber: string;
    weight: number;
    remarks?: string;
    userId: string;
  }): Promise<PackingRoll> {
    const packing = await this.packingRepo.findOne({
      where: { id: data.packingId },
    });
    if (!packing) throw new Error(`Packing ${data.packingId} not found`);

    if (!packing.isInProgress()) {
      throw new Error(`Cannot add roll - packing not in progress`);
    }

    const roll = this.rollRepo.create({
      packing,
      rollNumber: data.rollNumber,
      weight: data.weight,
      remarks: data.remarks,
    });

    return await this.rollRepo.save(roll);
  }

  /**
   * Complete packing
   */
  async completePacking(data: {
    packingId: string;
    userId: string;
  }): Promise<Packing> {
    const packing = await this.packingRepo.findOne({
      where: { id: data.packingId },
      relations: ['rolls'],
    });
    if (!packing) throw new Error(`Packing ${data.packingId} not found`);

    if (!packing.canComplete()) {
      throw new Error(
        `Cannot complete packing with status ${packing.status}`,
      );
    }

    // Calculate total roll weight
    if (packing.rolls && packing.rolls.length > 0) {
      packing.totalRollWeight = packing.rolls.reduce(
        (sum, roll) => sum + roll.weight,
        0,
      );
    }

    const user = await this.userRepo.findOne({ where: { id: data.userId } });

    packing.status = PackingStatus.COMPLETED;
    packing.packedBy = user;
    packing.packedAt = new Date();

    const updated = await this.packingRepo.save(packing);

    await this.createAudit(
      updated,
      'PACKING_COMPLETED',
      { status: PackingStatus.IN_PROGRESS },
      {
        status: PackingStatus.COMPLETED,
        packedAt: updated.packedAt,
        totalRollWeight: packing.totalRollWeight,
      },
      'Packing completed - ready for delivery',
      user,
    );

    return updated;
  }

  /**
   * Hold packing
   */
  async holdPacking(data: {
    packingId: string;
    reason: string;
    userId: string;
  }): Promise<Packing> {
    const packing = await this.packingRepo.findOne({
      where: { id: data.packingId },
    });
    if (!packing) throw new Error(`Packing ${data.packingId} not found`);

    if (!packing.canHold()) {
      throw new Error(`Cannot hold packing with status ${packing.status}`);
    }

    const user = await this.userRepo.findOne({ where: { id: data.userId } });

    packing.status = PackingStatus.ON_HOLD;
    packing.remarks = (packing.remarks || '') + `\n[ON HOLD: ${data.reason}]`;

    const updated = await this.packingRepo.save(packing);

    await this.createAudit(
      updated,
      'PACKING_HELD',
      { status: PackingStatus.IN_PROGRESS },
      { status: PackingStatus.ON_HOLD },
      data.reason,
      user,
    );

    return updated;
  }

  /**
   * Get packing details
   */
  async getPacking(packingId: string): Promise<Packing> {
    const packing = await this.packingRepo.findOne({
      where: { id: packingId },
      relations: ['job', 'rolls', 'auditTrail'],
    });
    if (!packing) throw new Error(`Packing ${packingId} not found`);
    return packing;
  }

  /**
   * Get packing by job
   */
  async getPackingByJob(jobId: string): Promise<Packing | null> {
    return await this.packingRepo.findOne({
      where: { job: { id: jobId } },
      relations: ['rolls'],
    });
  }

  /**
   * Helper: Create audit entry
   */
  private async createAudit(
    packing: Packing,
    action: string,
    previousValues: Record<string, any> | null,
    newValues: Record<string, any>,
    reason: string,
    user: User,
  ): Promise<PackingAudit> {
    const audit = this.auditRepo.create({
      packing,
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
