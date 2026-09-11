import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { DyeingJob, DyeingJobStatus, TrackingStatus } from '../dyeing-jobs/dyeing-job.entity';
import { Packing } from '../packing/packing.entity';
import { Delivery } from '../delivery/delivery.entity';
import { FabricReceipt } from '../fabric-receiving/fabric-receipt.entity';

/**
 * ReadyForInvoiceService
 * 
 * Handles the production-to-invoice handoff workflow.
 * Provides dashboard view of jobs ready for invoicing.
 * Auto-populates invoice data from job and delivery records.
 */
@Injectable()
export class ReadyForInvoiceService {
  constructor(
    @InjectRepository(DyeingJob)
    private readonly jobRepo: Repository<DyeingJob>,
    @InjectRepository(Packing)
    private readonly packingRepo: Repository<Packing>,
    @InjectRepository(Delivery)
    private readonly deliveryRepo: Repository<Delivery>,
    @InjectRepository(FabricReceipt)
    private readonly fabricReceiptRepo: Repository<FabricReceipt>,
  ) {}

  /**
   * Get all jobs ready for invoicing
   * Returns dashboard data with job metrics
   */
  async getReadyForInvoiceJobs(companyId: string) {
    const jobs = await this.jobRepo
      .createQueryBuilder('job')
      .where('job.company_id = :companyId', { companyId })
      .andWhere('job.status = :status', { status: DyeingJobStatus.READY_FOR_INVOICE })
      .andWhere('job.tracking_status = :tracking', { tracking: TrackingStatus.READY_FOR_INVOICE })
      .orderBy('job.created_at', 'DESC')
      .getMany();

    const dashboard = await Promise.all(
      jobs.map(async (job) => ({
        jobId: job.id,
        jobNumber: job.jobNo,
        customer: job.customerName,
        fabricType: job.fabricType,
        colour: job.colour,
        shadeNo: job.shadeNo,
        receivedQuantity: job.quantityReceived || null,
        deliveredQuantity: job.quantityDelivered || null,
        deliveryDate: job.expectedDeliveryDate,
        daysPending: await this.getDaysPending(job),
        readyForInvoiceAt: job.readyForInvoiceAt,
        invoiceStatus: job.invoicedAt ? 'INVOICED' : 'AWAITING_INVOICE',
      })),
    );

    return {
      count: dashboard.length,
      jobs: dashboard,
    };
  }

  /**
   * Get job count waiting for invoice
   * Used for reporting: "How many completed jobs are waiting for invoicing?"
   */
  async getWaitingForInvoiceCount(companyId: string): Promise<number> {
    return this.jobRepo.count({
      where: {
        company: { id: companyId },
        status: DyeingJobStatus.READY_FOR_INVOICE,
      },
    });
  }

  /**
   * Get awaiting invoice jobs with days pending
   * Used for reporting: "How many days has each finished job been waiting?"
   */
  async getAwaitingInvoiceMetrics(companyId: string) {
    const jobs = await this.jobRepo
      .createQueryBuilder('job')
      .where('job.company_id = :companyId', { companyId })
      .andWhere('job.status = :status', { status: DyeingJobStatus.READY_FOR_INVOICE })
      .andWhere('job.invoiced_at IS NULL')
      .orderBy('job.ready_for_invoice_at', 'ASC')
      .getMany();

    return jobs.map((job) => ({
      jobNumber: job.jobNo,
      customer: job.customerName,
      readyForInvoiceAt: job.readyForInvoiceAt,
      daysPending: this.calculateDaysPending(job.readyForInvoiceAt),
    }));
  }

  /**
   * Get preset invoice data from a job
   * Auto-populates invoice form for the accounts user
   */
  async getInvoicePreset(jobId: string, companyId: string) {
    const job = await this.jobRepo.findOne({
      where: {
        id: jobId,
        company: { id: companyId },
        status: DyeingJobStatus.READY_FOR_INVOICE,
      },
    });

    if (!job) {
      throw new NotFoundException(
        `Job ${jobId} not found or is not ready for invoicing`,
      );
    }

    // Get fabric receipt for received quantity
    const fabricReceipt = await this.fabricReceiptRepo
      .createQueryBuilder('receipt')
      .where('receipt.job_id = :jobId', { jobId })
      .orderBy('receipt.created_at', 'DESC')
      .getOne();

    // Get delivery for delivery info
    const delivery = await this.deliveryRepo
      .createQueryBuilder('delivery')
      .where('delivery.job_id = :jobId', { jobId })
      .orderBy('delivery.updated_at', 'DESC')
      .getOne();

    // Get packing for finished quantity
    const packing = await this.packingRepo
      .createQueryBuilder('packing')
      .where('packing.job_id = :jobId', { jobId })
      .orderBy('packing.updated_at', 'DESC')
      .getOne();

    // Build preset data
    const preset = {
      // Customer Info
      buyerName: job.customerName,
      buyerGstin: '', // To be filled by accounts user
      customerReference: '', // To be filled by accounts user

      // Job Info
      jobNumber: job.jobNo,
      orderNo: fabricReceipt?.customerReference || '',

      // Fabric Details
      fabricType: job.fabricType,
      colour: job.colour,
      shadeNo: job.shadeNo,

      // Quantity Info
      receivedQuantity: fabricReceipt?.netWeight || job.quantityReceived,
      receivedUnit: fabricReceipt?.uom || job.unit,
      finishedQuantity: packing?.finishedQuantity || job.quantityDelivered,
      deliveredQuantity: delivery?.deliveryQuantity || job.quantityDelivered,

      // Processing Info
      processingDescription: this.buildProcessingDescription(job),
      deliveryReference: delivery?.deliveryChallan || '',
      deliveryDate: delivery?.dispatchedAt,

      // Delivery Info
      deliveryChallan: delivery?.deliveryChallan,
      vehicle: delivery?.vehicleNumber,
      transporter: delivery?.transporter,

      // Dates
      receivedDate: fabricReceipt?.receiptDate,
      readyForInvoiceDate: job.readyForInvoiceAt,

      // Notes
      remarks: fabricReceipt?.remarks || '',
    };

    return preset;
  }

  /**
   * Record READY_FOR_INVOICE timestamp on job
   * Called when job transitions to READY_FOR_INVOICE status
   * Validates job belongs to user's company
   */
  async recordReadyForInvoiceTimestamp(jobId: string, companyId: string): Promise<DyeingJob> {
    const job = await this.jobRepo.findOne({
      where: { id: jobId, company: { id: companyId } },
    });
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found or access denied`);
    }

    if (!job.readyForInvoiceAt) {
      job.readyForInvoiceAt = new Date();
      await this.jobRepo.save(job);
    }

    return job;
  }

  /**
   * Calculate days pending since ready for invoice
   */
  private getDaysPending(job: DyeingJob): number {
    if (!job.readyForInvoiceAt) return 0;
    const now = new Date();
    const diff = now.getTime() - job.readyForInvoiceAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Helper: Calculate days pending from a date
   */
  private calculateDaysPending(date: Date): number {
    if (!date) return 0;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Build processing description from job details
   * e.g., "Reactive Dyeing (Navy) + Hot Wash + Softener + Hydro + Drying"
   */
  private buildProcessingDescription(job: DyeingJob): string {
    const parts: string[] = [];

    if (job.colour) {
      parts.push(`Dyeing (${job.colour})`);
    }

    if (job.fabricType) {
      parts.push(job.fabricType);
    }

    if (parts.length === 0) {
      return 'Fabric Processing';
    }

    return parts.join(' + ');
  }

  /**
   * Validate that a job is ready for invoice creation
   */
  async validateJobReadyForInvoice(jobId: string, companyId: string): Promise<boolean> {
    const job = await this.jobRepo.findOne({
      where: {
        id: jobId,
        company: { id: companyId },
      },
    });

    if (!job) return false;

    // Check status is READY_FOR_INVOICE
    if (job.status !== DyeingJobStatus.READY_FOR_INVOICE) {
      return false;
    }

    // Check tracking status
    if (job.trackingStatus !== TrackingStatus.READY_FOR_INVOICE) {
      return false;
    }

    return true;
  }
}
