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
import { ReprocessingService } from './reprocessing.service';

@Controller('api/reprocessing')
@UseGuards(JwtAuthGuard)
export class ReprocessingController {
  constructor(private readonly reprocessingService: ReprocessingService) {}

  /**
   * POST /api/reprocessing/request
   * Create a reprocess request (when QC fails)
   * Typically called automatically by QC service, but can also be manual
   */
  @Post('request')
  async createReprocessRequest(@Body() body: any, @Req() req: any) {
    if (!body.jobId || !body.qcExecutionId || !body.failureReason) {
      throw new BadRequestException(
        'jobId, qcExecutionId, and failureReason are required',
      );
    }

    return this.reprocessingService.createReprocessRequest({
      jobId: body.jobId,
      qcExecutionId: body.qcExecutionId,
      failureReason: body.failureReason,
      proposedAction: body.proposedAction || '',
      userId: req.user.id,
    });
  }

  /**
   * PATCH /api/reprocessing/request/:requestId/authorize
   * Supervisor authorizes reprocessing
   * Creates a new reprocess cycle
   */
  @Patch('request/:requestId/authorize')
  async authorizeReprocessRequest(
    @Param('requestId') requestId: string,
    @Req() req: any,
  ) {
    return this.reprocessingService.authorizeReprocess({
      requestId,
      userId: req.user.id,
    });
  }

  /**
   * PATCH /api/reprocessing/request/:requestId/reject
   * Supervisor rejects reprocessing
   */
  @Patch('request/:requestId/reject')
  async rejectReprocessRequest(
    @Param('requestId') requestId: string,
    @Body() body: { rejectionReason: string },
    @Req() req: any,
  ) {
    if (!body.rejectionReason) {
      throw new BadRequestException('rejectionReason is required');
    }

    return this.reprocessingService.rejectReprocess({
      requestId,
      rejectionReason: body.rejectionReason,
      userId: req.user.id,
    });
  }

  /**
   * PATCH /api/reprocessing/cycle/:cycleId/start
   * Operator starts the reprocess cycle
   */
  @Patch('cycle/:cycleId/start')
  async startReprocessCycle(
    @Param('cycleId') cycleId: string,
    @Req() req: any,
  ) {
    return this.reprocessingService.startReprocessCycle({
      cycleId,
      userId: req.user.id,
    });
  }

  /**
   * PATCH /api/reprocessing/cycle/:cycleId/record-step
   * Record completion of a reprocess step
   */
  @Patch('cycle/:cycleId/record-step')
  async recordReprocessStep(
    @Param('cycleId') cycleId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    if (!body.processType || typeof body.stepOrder !== 'number') {
      throw new BadRequestException(
        'processType and stepOrder (number) are required',
      );
    }

    return this.reprocessingService.recordReprocessStepCompletion({
      cycleId,
      processType: body.processType,
      stepOrder: body.stepOrder,
      executionData: body.executionData,
      userId: req.user.id,
    });
  }

  /**
   * PATCH /api/reprocessing/cycle/:cycleId/complete
   * Complete reprocess cycle
   */
  @Patch('cycle/:cycleId/complete')
  async completeReprocessCycle(
    @Param('cycleId') cycleId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    if (
      typeof body.reprocessOutput !== 'number' ||
      typeof body.reprocessLoss !== 'number'
    ) {
      throw new BadRequestException(
        'reprocessOutput and reprocessLoss (numbers) are required',
      );
    }

    return this.reprocessingService.completeReprocessCycle({
      cycleId,
      reprocessOutput: body.reprocessOutput,
      reprocessLoss: body.reprocessLoss,
      remarks: body.remarks,
      userId: req.user.id,
    });
  }

  /**
   * GET /api/reprocessing/job/:jobId/history
   * Get complete reprocess history for a job
   */
  @Get('job/:jobId/history')
  async getJobReprocessHistory(@Param('jobId') jobId: string) {
    return this.reprocessingService.getReprocessHistory(jobId);
  }

  /**
   * GET /api/reprocessing/job/:jobId/cost-analysis
   * Get cost analysis for a job
   */
  @Get('job/:jobId/cost-analysis')
  async getJobCostAnalysis(@Param('jobId') jobId: string) {
    return this.reprocessingService.calculateCostAnalysis(jobId);
  }
}
