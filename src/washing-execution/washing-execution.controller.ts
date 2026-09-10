import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WashingExecutionService } from './washing-execution.service';
import { WashingProcessType } from './washing-batch.entity';

@Controller('washing-execution')
@UseGuards(JwtAuthGuard)
export class WashingExecutionController {
  constructor(private readonly washingService: WashingExecutionService) {}

  /**
   * Create a new washing batch
   */
  @Post('job/:jobId/batch')
  async createBatch(
    @Param('jobId') jobId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const { routeStepId, processType, inputQuantity, ...data } = body;

    // Validate process type
    if (!Object.values(WashingProcessType).includes(processType)) {
      throw new BadRequestException('Invalid washing process type');
    }

    return this.washingService.createBatch(
      jobId,
      routeStepId,
      processType,
      inputQuantity,
      data,
      req.user.companyId,
    );
  }

  /**
   * Get batch details
   */
  @Get('batch/:batchId')
  async getBatch(@Param('batchId') batchId: string, @Req() req: any) {
    return this.washingService.getBatch(batchId, req.user.companyId);
  }

  /**
   * Get all batches for a job
   */
  @Get('job/:jobId/batches')
  async getJobBatches(@Param('jobId') jobId: string, @Req() req: any) {
    return this.washingService.getJobBatches(jobId, req.user.companyId);
  }

  /**
   * Start washing batch (PENDING → IN_PROGRESS)
   */
  @Post('batch/:batchId/start')
  async startBatch(@Param('batchId') batchId: string, @Req() req: any) {
    return this.washingService.startBatch(batchId, req.user.id, req.user.companyId);
  }

  /**
   * Update batch parameters during execution
   */
  @Put('batch/:batchId/parameters')
  async updateParameters(
    @Param('batchId') batchId: string,
    @Body() body: { parameters: any },
    @Req() req: any,
  ) {
    return this.washingService.updateParameters(
      batchId,
      body.parameters,
      req.user.id,
      req.user.companyId,
    );
  }

  /**
   * Complete washing batch with output quantity
   */
  @Post('batch/:batchId/complete')
  async completeBatch(
    @Param('batchId') batchId: string,
    @Body() body: { outputQuantity: number; remarks?: string },
    @Req() req: any,
  ) {
    return this.washingService.completeBatch(
      batchId,
      body.outputQuantity,
      body.remarks || '',
      req.user.id,
      req.user.companyId,
    );
  }

  /**
   * Supervisor override: allow output > input
   */
  @Post('batch/:batchId/supervisor-override')
  async supervisorOverride(
    @Param('batchId') batchId: string,
    @Body()
    body: {
      outputQuantity: number;
      reason: string;
    },
    @Req() req: any,
  ) {
    // In production, verify supervisor role
    return this.washingService.supervisorOverride(
      batchId,
      body.outputQuantity,
      body.reason,
      req.user.id,
      req.user.companyId,
    );
  }

  /**
   * Put batch on hold
   */
  @Post('batch/:batchId/hold')
  async holdBatch(
    @Param('batchId') batchId: string,
    @Body() body: { reason: string },
    @Req() req: any,
  ) {
    return this.washingService.putOnHold(batchId, body.reason, req.user.id, req.user.companyId);
  }

  /**
   * Reject batch
   */
  @Post('batch/:batchId/reject')
  async rejectBatch(
    @Param('batchId') batchId: string,
    @Body() body: { reason: string },
    @Req() req: any,
  ) {
    return this.washingService.rejectBatch(batchId, body.reason, req.user.id, req.user.companyId);
  }

  /**
   * Get audit trail for batch
   */
  @Get('batch/:batchId/audit')
  async getAuditTrail(@Param('batchId') batchId: string, @Req() req: any) {
    return this.washingService.getAuditTrail(batchId, req.user.companyId);
  }
}
