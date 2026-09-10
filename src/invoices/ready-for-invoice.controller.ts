import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReadyForInvoiceService } from './ready-for-invoice.service';

/**
 * ReadyForInvoiceController
 * 
 * Endpoints for production-to-invoice handoff workflow.
 * Provides dashboard view and invoice preset data.
 */
@Controller('api/ready-for-invoice')
@UseGuards(JwtAuthGuard)
export class ReadyForInvoiceController {
  constructor(
    private readonly readyForInvoiceService: ReadyForInvoiceService,
  ) {}

  /**
   * GET /api/ready-for-invoice
   * Dashboard: List all jobs ready for invoicing
   * 
   * Returns:
   * - Job Number
   * - Customer
   * - Fabric Type & Colour
   * - Received Quantity
   * - Delivered Quantity
   * - Delivery Date
   * - Days Pending Since Ready for Invoice
   * - Invoice Status (INVOICED | AWAITING_INVOICE)
   */
  @Get()
  async getReadyForInvoiceDashboard(@Req() req: any) {
    const companyId = req.user.company_id;
    return this.readyForInvoiceService.getReadyForInvoiceJobs(companyId);
  }

  /**
   * GET /api/ready-for-invoice/waiting-count
   * Metric: Count of jobs waiting for invoice
   * 
   * Used for reporting:
   * "How many completed jobs are waiting for invoicing?"
   */
  @Get('waiting-count')
  async getWaitingCount(@Req() req: any) {
    const companyId = req.user.company_id;
    const count = await this.readyForInvoiceService.getWaitingForInvoiceCount(
      companyId,
    );
    return { waitingCount: count };
  }

  /**
   * GET /api/ready-for-invoice/awaiting-metrics
   * Detailed metrics for jobs awaiting invoice
   * 
   * Used for reporting:
   * "How many days has each finished job been waiting for invoice?"
   */
  @Get('awaiting-metrics')
  async getAwaitingMetrics(@Req() req: any) {
    const companyId = req.user.company_id;
    return this.readyForInvoiceService.getAwaitingInvoiceMetrics(companyId);
  }

  /**
   * GET /api/ready-for-invoice/:jobId/preset
   * Auto-populate invoice form
   * 
   * Returns pre-filled invoice data from job:
   * - Customer name & GSTIN
   * - Job number & reference
   * - Fabric type, colour, shade
   * - Received/Finished/Delivered quantities
   * - Processing description
   * - Delivery reference & date
   * - Vehicle & transporter details
   */
  @Get(':jobId/preset')
  async getInvoicePreset(
    @Param('jobId') jobId: string,
    @Req() req: any,
  ) {
    const companyId = req.user.company_id;
    return this.readyForInvoiceService.getInvoicePreset(jobId, companyId);
  }
}
