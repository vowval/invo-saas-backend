import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Product } from '../products/product.entity';
import { date, decimal, text } from '../common/input';
import { Company } from '../companies/company.entity';
import { DyeingJob, TrackingStatus } from '../dyeing-jobs/dyeing-job.entity';
import { SubscriptionService } from '../subscriptions/subscription.service';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,

    @InjectRepository(InvoiceItem)
    private itemRepo: Repository<InvoiceItem>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
    @InjectRepository(DyeingJob)
    private jobRepo: Repository<DyeingJob>,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  // ================= CREATE INVOICE =================
  async create(data: any, companyId: string) {
    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const plan = company.lifetimeSubscription
      ? null
      : await this.subscriptionService.getPlanStatus(company.subscriptionPlan);
    if (!company.lifetimeSubscription && (!plan || !plan.active)) {
      throw new ForbiddenException(
        'Your subscription plan is no longer active. Please contact the administrator to be assigned a new plan',
      );
    }
    if (!company.lifetimeSubscription && company.subscriptionStatus !== 'ACTIVE') {
      throw new ForbiddenException('Your subscription is awaiting payment confirmation or has been suspended');
    }
    if (
      !company.lifetimeSubscription &&
      company.subscriptionExpiresAt &&
      company.subscriptionExpiresAt.getTime() <= Date.now()
    ) {
      company.subscriptionStatus = 'EXPIRED';
      await this.companyRepo.save(company);
      throw new ForbiddenException('Your subscription has expired. Please renew your plan');
    }
    const currentInvoiceCount = await this.invoiceRepo.count({
      where: { company: { id: companyId } },
    });
    if (
      !company.lifetimeSubscription &&
      company.invoiceLimit !== null &&
      currentInvoiceCount >= company.invoiceLimit
    ) {
      throw new ForbiddenException(
        'Your free invoice allowance is complete. Please subscribe to continue',
      );
    }

    let totalAmount = 0;
    const items: InvoiceItem[] = [];

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new BadRequestException('At least one invoice item is required');
    }

    for (const i of data.items) {
      const job = await this.jobRepo.findOne({
        where: {
          id: i.dyeingJobId,
          company: { id: companyId },
        },
      });
      if (!job || job.trackingStatus !== TrackingStatus.READY_FOR_INVOICE) {
        throw new BadRequestException('Each invoice item must reference a job that is ready for invoice');
      }
      if (data.buyerName !== job.customerName) {
        throw new BadRequestException('Invoice customer must match the selected fabric job');
      }
      const product = await this.productRepo.findOne({
        where: {
          id: i.productId,
          company: { id: companyId },
        },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Job work billing (KG based)
      const quantity = decimal(i.quantity, 'Item quantity', { min: 0.001 });
      const rate = decimal(i.rate !== undefined ? i.rate : product.rate, 'Item rate', { min: 0 });
      const amount = Number((quantity * rate).toFixed(2));

      totalAmount += amount;

      const item = this.itemRepo.create({
        product,
        dyeingJob: job,

        // DC details
        partyDcNo: text(i.partyDcNo ?? job.partyDcNo, 'Party DC number', { max: 50 }),
        partyDcDate: date(i.partyDcDate ?? job.receivedDate, 'Party DC date', false),
        deliveryDcNo: text(i.deliveryDcNo, 'Delivery DC number', { max: 50 }),

        // Fabric details
        colour: text(i.colour ?? job.colour, 'Colour', { max: 50 }),
        fabricWidth: text(i.fabricWidth, 'Fabric width', { max: 30 }),

        // Billing
        quantity,
        rate,
        amount,
      });

      items.push(item);
    }

    const gstRate = decimal(data.gstRate ?? 5, 'GST rate', { min: 0, max: 28 });
    const supplyType = data.supplyType === 'INTER_STATE'
      ? 'INTER_STATE'
      : 'INTRA_STATE';
    const cgstAmount = supplyType === 'INTRA_STATE'
      ? Number((totalAmount * gstRate / 200).toFixed(2))
      : 0;
    const sgstAmount = cgstAmount;
    const igstAmount = supplyType === 'INTER_STATE'
      ? Number((totalAmount * gstRate / 100).toFixed(2))
      : 0;
    const grandTotal = Number(
      (totalAmount + cgstAmount + sgstAmount + igstAmount).toFixed(2),
    );

    const invoiceNumber = company.invoiceNextNumber;
    const prefix = company.invoicePrefix || 'INV';
    const invoiceNo = `${prefix}-${String(invoiceNumber).padStart(5, '0')}`;
    company.invoiceNextNumber = invoiceNumber + 1;

    // Get the primary job from the first invoice item
    const primaryJob = items[0].dyeingJob;

    const invoice = this.invoiceRepo.create({
      invoiceNo,
      buyerName: text(data.buyerName, 'Customer name', { required: true, max: 150 }),
      buyerAddress: text(data.buyerAddress, 'Customer address', { required: true, max: 500 }),
      buyerGstin: text(data.buyerGstin, 'Customer GSTIN', { max: 20 }).toUpperCase(),

      invoiceDate: date(data.invoiceDate, 'Invoice date'),
      orderNo: text(data.orderNo, 'Order number', { max: 50 }),
      placeOfSupply: text(data.placeOfSupply, 'Place of supply', { required: true, max: 100 }),

      // Link to primary job
      job: primaryJob,
      customerReference: text(data.customerReference, 'Customer reference', { max: 100 }),
      processingDescription: text(data.processingDescription, 'Processing description', { max: 500 }),
      deliveryReference: text(data.deliveryReference, 'Delivery reference', { max: 100 }),
      deliveryDate: data.deliveryDate ? date(data.deliveryDate, 'Delivery date', false) : null,

      totalAmount: Number(totalAmount.toFixed(2)),
      gstRate,
      supplyType,
      cgstAmount,
      sgstAmount,
      igstAmount,
      grandTotal,
      company: { id: companyId } as any,
      items,
    });

    const savedInvoice = await this.invoiceRepo.save(invoice);
    const invoicedJobs = new Map(items.map(item => [item.dyeingJob.id, item.dyeingJob]));
    
    // Track invoice creation in job
    await Promise.all(
      Array.from(invoicedJobs.values()).map(job => {
        job.trackingStatus = TrackingStatus.GST_INVOICE;
        
        // Set invoice tracking fields (only on first invoice)
        if (!job.invoicedAt) {
          job.invoicedAt = new Date();
          job.invoiceId = savedInvoice.id;
        }
        
        return this.jobRepo.save(job);
      }),
    );
    company.invoicesUsed = currentInvoiceCount + 1;
    await this.companyRepo.save(company);
    return savedInvoice;
  }

  // ================= LIST INVOICES =================
  async findAll(companyId: string) {
    return await this.invoiceRepo.find({
      where: { company: { id: companyId } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  // ================= SINGLE INVOICE =================
  async findOne(id: string, companyId: string) {
    return await this.invoiceRepo.findOne({
      where: { id, company: { id: companyId } },
      relations: ['items', 'items.product'],
    });
  }
}
