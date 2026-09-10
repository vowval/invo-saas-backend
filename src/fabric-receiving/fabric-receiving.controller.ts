import { Controller, Post, Get, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { FabricReceivingService, CreateFabricReceiptDto } from './fabric-receiving.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('fabric-receiving')
@UseGuards(JwtAuthGuard)
export class FabricReceivingController {
  constructor(private service: FabricReceivingService) {}

  /**
   * Create a fabric receipt with job
   * POST /fabric-receiving/receipt
   */
  @Post('receipt')
  async createReceipt(@Request() req, @Body() dto: CreateFabricReceiptDto) {
    const companyId = req.user.companyId;
    return this.service.createFabricReceipt(companyId, dto);
  }

  /**
   * Get fabric receipt details
   * GET /fabric-receiving/receipt/:id
   */
  @Get('receipt/:id')
  async getReceipt(@Request() req, @Param('id') id: string) {
    return this.service.getFabricReceipt(id, req.user.companyId);
  }

  /**
   * Get all receipts for a job
   * GET /fabric-receiving/job/:jobId
   */
  @Get('job/:jobId')
  async getJobReceipts(@Request() req, @Param('jobId') jobId: string) {
    return this.service.getJobReceipts(jobId, req.user.companyId);
  }

  /**
   * Get all receipts for company with pagination
   * GET /fabric-receiving/company/receipts?limit=50&offset=0
   */
  @Get('company/receipts')
  async getCompanyReceipts(
    @Request() req,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.service.getCompanyReceipts(
      req.user.companyId,
      parseInt(limit, 10),
      parseInt(offset, 10),
    );
  }

  /**
   * Get material traceability for a job
   * GET /fabric-receiving/traceability/:jobId
   */
  @Get('traceability/:jobId')
  async getTraceability(@Request() req, @Param('jobId') jobId: string) {
    return this.service.getMaterialTraceability(jobId, req.user.companyId);
  }

  /**
   * Mark fabric receipt as completed (move to inspection)
   * POST /fabric-receiving/receipt/:id/complete
   */
  @Post('receipt/:id/complete')
  async completeReceipt(@Request() req, @Param('id') id: string) {
    return this.service.completeReception(id, req.user.companyId);
  }
}
