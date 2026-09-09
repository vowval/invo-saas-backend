import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentMode } from './payment.entity';
import { Invoice } from '../invoices/invoice.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { date, decimal, text } from '../common/input';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(DyeingJob)
    private jobRepo: Repository<DyeingJob>,
  ) {}

  async create(data: any, companyId: string) {
    const customerName = text(data.customerName, 'Customer name', { required: true, max: 150 });
    const payment = this.paymentRepo.create({
      customerName,
      amount: decimal(data.amount, 'Amount', { min: 0.01 }),
      paymentDate: date(data.paymentDate, 'Payment date'),
      mode: Object.values(PaymentMode).includes(data.mode) ? data.mode : PaymentMode.BANK_TRANSFER,
      referenceNo: text(data.referenceNo, 'Reference number', { max: 100 }),
      remarks: text(data.remarks, 'Remarks', { max: 500 }),
      company: { id: companyId } as any,
    });
    return this.paymentRepo.save(payment);
  }

  findAll(companyId: string) {
    return this.paymentRepo.find({
      where: { company: { id: companyId } },
      order: { paymentDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async remove(id: string, companyId: string) {
    const payment = await this.paymentRepo.findOne({ where: { id, company: { id: companyId } } });
    if (!payment) throw new NotFoundException('Payment not found');
    await this.paymentRepo.remove(payment);
    return { success: true };
  }

  // ================= CUSTOMER LEDGER =================
  // A single "who owes me money" view per customer: job-work orders,
  // invoices raised, payments received, and the net outstanding balance.
  async listCustomers(companyId: string) {
    const [jobs, invoices, payments] = await Promise.all([
      this.jobRepo.find({ where: { company: { id: companyId } } }),
      this.invoiceRepo.find({ where: { company: { id: companyId } } }),
      this.paymentRepo.find({ where: { company: { id: companyId } } }),
    ]);

    const names = new Set<string>();
    jobs.forEach(job => names.add(job.customerName));
    invoices.forEach(invoice => names.add(invoice.buyerName));
    payments.forEach(payment => names.add(payment.customerName));

    return Array.from(names)
      .sort((a, b) => a.localeCompare(b))
      .map(customerName => {
        const customerInvoices = invoices.filter(invoice => invoice.buyerName === customerName);
        const customerPayments = payments.filter(payment => payment.customerName === customerName);
        const customerJobs = jobs.filter(job => job.customerName === customerName);
        const invoiced = customerInvoices.reduce((sum, invoice) => sum + Number(invoice.grandTotal), 0);
        const received = customerPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        return {
          customerName,
          jobCount: customerJobs.length,
          activeJobCount: customerJobs.filter(job => job.status !== 'DELIVERED').length,
          invoiceCount: customerInvoices.length,
          invoicedTotal: Number(invoiced.toFixed(2)),
          receivedTotal: Number(received.toFixed(2)),
          outstanding: Number((invoiced - received).toFixed(2)),
          lastActivity: [...customerInvoices.map(i => i.createdAt), ...customerPayments.map(p => p.createdAt)]
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null,
        };
      })
      .sort((a, b) => b.outstanding - a.outstanding);
  }

  async getCustomerLedger(customerName: string, companyId: string) {
    const [jobs, invoices, payments] = await Promise.all([
      this.jobRepo.find({ where: { company: { id: companyId }, customerName } }),
      this.invoiceRepo.find({
        where: { company: { id: companyId }, buyerName: customerName },
        relations: ['items'],
        order: { invoiceDate: 'DESC' },
      }),
      this.paymentRepo.find({
        where: { company: { id: companyId }, customerName },
        order: { paymentDate: 'DESC' },
      }),
    ]);

    if (jobs.length === 0 && invoices.length === 0 && payments.length === 0) {
      throw new NotFoundException('No ledger data found for this customer');
    }

    const invoicedTotal = Number(invoices.reduce((sum, invoice) => sum + Number(invoice.grandTotal), 0).toFixed(2));
    const receivedTotal = Number(payments.reduce((sum, payment) => sum + Number(payment.amount), 0).toFixed(2));
    const outstanding = Number((invoicedTotal - receivedTotal).toFixed(2));

    // Simple month-wise trend (last 6 months) for the charting UI.
    const monthly: Record<string, { invoiced: number; received: number }> = {};
    const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    invoices.forEach(invoice => {
      const key = monthKey(new Date(invoice.invoiceDate));
      monthly[key] = monthly[key] || { invoiced: 0, received: 0 };
      monthly[key].invoiced += Number(invoice.grandTotal);
    });
    payments.forEach(payment => {
      const key = monthKey(new Date(payment.paymentDate));
      monthly[key] = monthly[key] || { invoiced: 0, received: 0 };
      monthly[key].received += Number(payment.amount);
    });
    const trend = Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, values]) => ({
        month,
        invoiced: Number(values.invoiced.toFixed(2)),
        received: Number(values.received.toFixed(2)),
      }));

    return {
      customerName,
      summary: {
        invoicedTotal,
        receivedTotal,
        outstanding,
        jobCount: jobs.length,
        activeJobCount: jobs.filter(job => job.status !== 'DELIVERED').length,
      },
      jobs: jobs
        .sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime())
        .map(job => ({
          id: job.id,
          jobNo: job.jobNo,
          fabricType: job.fabricType,
          quantityReceived: job.quantityReceived,
          quantityDelivered: job.quantityDelivered,
          unit: job.unit,
          status: job.status,
          trackingStatus: job.trackingStatus,
          receivedDate: job.receivedDate,
        })),
      invoices: invoices.map(invoice => ({
        id: invoice.id,
        invoiceNo: invoice.invoiceNo,
        invoiceDate: invoice.invoiceDate,
        grandTotal: invoice.grandTotal,
        itemCount: invoice.items?.length ?? 0,
      })),
      payments: payments.map(payment => ({
        id: payment.id,
        paymentDate: payment.paymentDate,
        amount: payment.amount,
        mode: payment.mode,
        referenceNo: payment.referenceNo,
        remarks: payment.remarks,
      })),
      trend,
    };
  }
}
