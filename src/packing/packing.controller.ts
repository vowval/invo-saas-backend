import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PackingService } from './packing.service';

@Controller('api/packing')
@UseGuards(JwtAuthGuard)
export class PackingController {
  constructor(private readonly packingService: PackingService) {}

  /**
   * POST /api/packing
   * Create packing record for a job (after QC PASS)
   */
  @Post()
  async createPacking(@Body() body: any, @Req() req: any) {
    if (!body.jobId || !body.finishedQuantity || typeof body.rollCount !== 'number') {
      throw new BadRequestException(
        'jobId, finishedQuantity, and rollCount are required',
      );
    }

    return this.packingService.createPacking({
      jobId: body.jobId,
      finishedQuantity: body.finishedQuantity,
      rollCount: body.rollCount,
      packageCount: body.packageCount || 0,
      packingType: body.packingType,
      labels: body.labels,
      remarks: body.remarks,
      userId: req.user.id,
      companyId: req.user.companyId,
    });
  }

  /**
   * PATCH /api/packing/:packingId/start
   * Start packing process
   */
  @Patch(':packingId/start')
  async startPacking(
    @Param('packingId') packingId: string,
    @Req() req: any,
  ) {
    return this.packingService.startPacking({
      packingId,
      userId: req.user.id,
      companyId: req.user.companyId,
    });
  }

  /**
   * POST /api/packing/:packingId/roll
   * Add roll to packing
   */
  @Post(':packingId/roll')
  async addRoll(
    @Param('packingId') packingId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    if (!body.rollNumber || typeof body.weight !== 'number') {
      throw new BadRequestException('rollNumber and weight are required');
    }

    return this.packingService.addRoll({
      packingId,
      rollNumber: body.rollNumber,
      weight: body.weight,
      remarks: body.remarks,
      userId: req.user.id,
      companyId: req.user.companyId,
    });
  }

  /**
   * PATCH /api/packing/:packingId/complete
   * Complete packing - unlock delivery
   */
  @Patch(':packingId/complete')
  async completePacking(
    @Param('packingId') packingId: string,
    @Req() req: any,
  ) {
    return this.packingService.completePacking({
      packingId,
      userId: req.user.id,
      companyId: req.user.companyId,
    });
  }

  /**
   * PATCH /api/packing/:packingId/hold
   * Hold packing
   */
  @Patch(':packingId/hold')
  async holdPacking(
    @Param('packingId') packingId: string,
    @Body() body: { reason: string },
    @Req() req: any,
  ) {
    if (!body.reason) {
      throw new BadRequestException('reason is required');
    }

    return this.packingService.holdPacking({
      packingId,
      reason: body.reason,
      userId: req.user.id,
      companyId: req.user.companyId,
    });
  }

  /**
   * GET /api/packing/:packingId
   * Get packing details
   */
  @Get(':packingId')
  async getPacking(
    @Param('packingId') packingId: string,
    @Req() req: any,
  ) {
    return this.packingService.getPacking(packingId, req.user.companyId);
  }

  /**
   * GET /api/packing/job/:jobId
   * Get packing for a job
   */
  @Get('job/:jobId')
  async getPackingByJob(
    @Param('jobId') jobId: string,
    @Req() req: any,
  ) {
    return this.packingService.getPackingByJob(jobId, req.user.companyId);
  }
}
