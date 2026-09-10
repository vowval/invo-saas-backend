import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery, DeliveryStatus } from './delivery.entity';
import { DeliveryPackage } from './delivery-package.entity';
import { DeliveryAudit } from './delivery-audit.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { User } from '../users/user.entity';
import { Packing } from '../packing/packing.entity';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepo: Repository<Delivery>,
    @InjectRepository(DeliveryPackage)
    private readonly pkgRepo: Repository<DeliveryPackage>,
    @InjectRepository(DeliveryAudit)
    private readonly auditRepo: Repository<DeliveryAudit>,
    @InjectRepository(DyeingJob)
    private readonly jobRepo: Repository<DyeingJob>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Packing)
    private readonly packingRepo: Repository<Packing>,
  ) {}

  /**
   * Creates delivery record after packing completion
   * Delivery quantity cannot exceed packed quantity
   */
  async createDelivery(data: {
    jobId: string;
    deliveryQuantity: number;
    packageCount: number;
    deliveryChallan?: string;
    vehicleNumber?: string;
    transporter?: string;
    destination?: string;
    remarks?: string;
    userId: string;
    supervisorOverride?: boolean;
    overrideReason?: string;
  }): Promise<Delivery> {
    const job = await this.jobRepo.findOne({ where: { id: data.jobId } });
    if (!job) throw new Error(`Job ${data.jobId} not found`);

    // Validate delivery quantity doesn't exceed packed quantity
    const packing = await this.packingRepo.findOne({
      where: { job: { id: data.jobId } },
    });

    if (!packing) {
      throw new Error(`No packing record found for job ${data.jobId}`);
    }

    if (data.deliveryQuantity > packing.finishedQuantity) {
      if (!data.supervisorOverride) {
        throw new Error(
          `Delivery quantity (${data.deliveryQuantity}) exceeds packed quantity (${packing.finishedQuantity}). Requires supervisor override.`,
        );
      }
    }

    const user = await this.userRepo.findOne({ where: { id: data.userId } });

    const delivery = this.deliveryRepo.create({
      job,
      deliveryQuantity: data.deliveryQuantity,
      packageCount: data.packageCount,
      deliveryChallan: data.deliveryChallan,
      vehicleNumber: data.vehicleNumber,
      transporter: data.transporter,
      destination: data.destination,
      remarks: data.remarks,
      status: DeliveryStatus.PENDING,
      supervisorOverrideReason: data.supervisorOverride
        ? data.overrideReason
        : null,
    });

    const saved = await this.deliveryRepo.save(delivery);

    await this.createAudit(
      saved,
      'DELIVERY_CREATED',
      null,
      {
        deliveryQuantity: data.deliveryQuantity,
        packageCount: data.packageCount,
        packedQuantity: packing.finishedQuantity,
      },
      'Delivery record created',
      user,
    );

    return saved;
  }

  /**
   * Starts delivery process
   */
  async startDelivery(data: {
    deliveryId: string;
    userId: string;
  }): Promise<Delivery> {
    const delivery = await this.deliveryRepo.findOne({
      where: { id: data.deliveryId },
    });
    if (!delivery) throw new Error(`Delivery ${data.deliveryId} not found`);

    if (!delivery.canStart()) {
      throw new Error(`Cannot start delivery with status ${delivery.status}`);
    }

    const user = await this.userRepo.findOne({ where: { id: data.userId } });

    delivery.status = DeliveryStatus.IN_PROGRESS;
    delivery.dispatchedBy = user;
    delivery.dispatchedAt = new Date();

    const updated = await this.deliveryRepo.save(delivery);

    await this.createAudit(
      updated,
      'DELIVERY_STARTED',
      { status: DeliveryStatus.PENDING },
      { status: DeliveryStatus.IN_PROGRESS, dispatchedAt: new Date() },
      'Delivery dispatch started',
      user,
    );

    return updated;
  }

  /**
   * Add package to delivery
   */
  async addPackage(data: {
    deliveryId: string;
    packageNumber: number;
    weight: number;
    rolls?: string;
    remarks?: string;
  }): Promise<DeliveryPackage> {
    const delivery = await this.deliveryRepo.findOne({
      where: { id: data.deliveryId },
    });
    if (!delivery) throw new Error(`Delivery ${data.deliveryId} not found`);

    const pkg = this.pkgRepo.create({
      delivery,
      packageNumber: data.packageNumber,
      weight: data.weight,
      rolls: data.rolls,
      remarks: data.remarks,
    });

    return await this.pkgRepo.save(pkg);
  }

  /**
   * Complete delivery
   * Job status transitions to DELIVERED
   */
  async completeDelivery(data: {
    deliveryId: string;
    userId: string;
  }): Promise<Delivery> {
    const delivery = await this.deliveryRepo.findOne({
      where: { id: data.deliveryId },
      relations: ['job'],
    });
    if (!delivery) throw new Error(`Delivery ${data.deliveryId} not found`);

    if (!delivery.canComplete()) {
      throw new Error(
        `Cannot complete delivery with status ${delivery.status}`,
      );
    }

    const user = await this.userRepo.findOne({ where: { id: data.userId } });

    delivery.status = DeliveryStatus.COMPLETED;
    const updated = await this.deliveryRepo.save(delivery);

    // Update job status to DELIVERED
    if (delivery.job) {
      delivery.job.status = 'DELIVERED' as any;
      await this.jobRepo.save(delivery.job);
    }

    await this.createAudit(
      updated,
      'DELIVERY_COMPLETED',
      { status: DeliveryStatus.IN_PROGRESS },
      { status: DeliveryStatus.COMPLETED },
      'Delivery completed - job status updated to DELIVERED',
      user,
    );

    return updated;
  }

  /**
   * Check if job is ready for invoice
   * Auto-transitions job to READY_FOR_INVOICE if all conditions met
   */
  async checkAndTransitionToReadyForInvoice(jobId: string): Promise<boolean> {
    const job = await this.jobRepo.findOne({
      where: { id: jobId },
    });

    if (!job) return false;

    // Check conditions:
    // 1. Job status is DELIVERED
    // 2. All QC passed
    // 3. Packing completed
    // 4. Delivery completed

    const delivery = await this.deliveryRepo.findOne({
      where: { job: { id: jobId } },
    });

    if (job.status === 'DELIVERED' && delivery?.isCompleted()) {
      // All commercial requirements satisfied
      job.status = 'READY_FOR_INVOICE' as any;
      await this.jobRepo.save(job);
      return true;
    }

    return false;
  }

  /**
   * Get delivery details
   */
  async getDelivery(deliveryId: string): Promise<Delivery> {
    const delivery = await this.deliveryRepo.findOne({
      where: { id: deliveryId },
      relations: ['job', 'packages', 'auditTrail'],
    });
    if (!delivery) throw new Error(`Delivery ${deliveryId} not found`);
    return delivery;
  }

  /**
   * Get delivery by job
   */
  async getDeliveryByJob(jobId: string): Promise<Delivery | null> {
    return await this.deliveryRepo.findOne({
      where: { job: { id: jobId } },
      relations: ['packages'],
    });
  }

  /**
   * Helper: Create audit entry
   */
  private async createAudit(
    delivery: Delivery,
    action: string,
    previousValues: Record<string, any> | null,
    newValues: Record<string, any>,
    reason: string,
    user: User,
  ): Promise<DeliveryAudit> {
    const audit = this.auditRepo.create({
      delivery,
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
