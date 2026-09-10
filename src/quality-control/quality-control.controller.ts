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
import { QualityControlService } from './quality-control.service';
import { QcService } from './qc.service';
import { ReprocessingService } from '../reprocessing/reprocessing.service';

@Controller('api/quality-control')
@UseGuards(JwtAuthGuard)
export class QualityControlController {
  constructor(
    private readonly legacyQcService: QualityControlService,
    private readonly qcService: QcService,
    private readonly reprocessingService: ReprocessingService,
  ) {}

  // Legacy endpoints (deprecated)
  @Get('stats')
  stats(@Req() req: any) {
    return this.legacyQcService.rejectionStats(req.user.companyId);
  }

  @Get()
  listAll(@Req() req: any) {
    return this.legacyQcService.listAll(req.user.companyId);
  }

  @Post('batches/:batchId')
  recordInspection(@Param('batchId') batchId: string, @Body() body: any, @Req() req: any) {
    return this.legacyQcService.recordInspection(batchId, body, req.user.companyId);
  }

  @Get('batches/:batchId')
  listForBatch(@Param('batchId') batchId: string, @Req() req: any) {
    return this.legacyQcService.listForBatch(batchId, req.user.companyId);
  }

  @Post('batches/:batchId/reprocess')
  reprocess(@Param('batchId') batchId: string, @Req() req: any) {
    return this.legacyQcService.createReprocessBatch(batchId, req.user.companyId);
  }

  // Phase 10: New QC Execution Endpoints
  
  /**
   * POST /api/quality-control/execute
   * Create a new QC execution for a job
   */
  @Post('execute')
  async executeQC(
    @Body() body: { jobId: string },
    @Req() req: any,
  ) {
    if (!body.jobId) {
      throw new BadRequestException('jobId is required');
    }
    return this.qcService.createQCExecution(
      body.jobId,
      req.user.companyId,
      req.user,
    );
  }

  /**
   * GET /api/quality-control/:executionId
   * Get complete QC execution details
   */
  @Get(':executionId')
  async getQCExecution(
    @Param('executionId') executionId: string,
    @Req() req: any,
  ) {
    return this.qcService.getQCExecution(executionId, req.user.companyId);
  }

  /**
   * PATCH /api/quality-control/:executionId/start
   * Start QC inspection
   */
  @Patch(':executionId/start')
  async startQCExecution(
    @Param('executionId') executionId: string,
    @Body() body: { inspectorId?: string },
    @Req() req: any,
  ) {
    const inspectorId = body.inspectorId || req.user.id;
    return this.qcService.startQC(
      executionId,
      inspectorId,
      req.user.companyId,
      req.user,
    );
  }

  /**
   * PATCH /api/quality-control/:executionId/record-check
   * Record individual QC check result
   */
  @Patch(':executionId/record-check')
  async recordCheckResult(
    @Param('executionId') executionId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const dto = {
      executionId,
      checkTemplateId: body.checkTemplateId,
      actualValue: body.actualValue,
      targetValue: body.targetValue,
      result: body.result,
      remarks: body.remarks,
    };

    return this.qcService.recordCheckResult(dto, req.user.companyId, req.user);
  }

  /**
   * PATCH /api/quality-control/:executionId/complete
   * Complete QC execution and determine result
   */
  @Patch(':executionId/complete')
  async completeQCExecution(
    @Param('executionId') executionId: string,
    @Req() req: any,
  ) {
    const qcExecution = await this.qcService.completeQC(
      executionId,
      req.user.companyId,
      req.user,
    );

    // If QC failed, automatically create reprocess request
    if (qcExecution.overallResult === 'FAIL') {
      const reprocessRequest = await this.reprocessingService.createReprocessRequest({
        jobId: qcExecution.job.id,
        qcExecutionId: executionId,
        failureReason: 'QC failed - requires reprocessing',
        proposedAction: 'Review failed checks and propose reprocessing action',
        userId: req.user.id,
      });
      return {
        qcExecution,
        reprocessRequest,
      };
    }

    return qcExecution;
  }

  /**
   * PATCH /api/quality-control/:executionId/hold
   * Put QC on hold (supervisor review needed)
   */
  @Patch(':executionId/hold')
  async holdQCExecution(
    @Param('executionId') executionId: string,
    @Body() body: { reason: string },
    @Req() req: any,
  ) {
    if (!body.reason) {
      throw new BadRequestException('Hold reason is required');
    }
    return this.qcService.holdQC(
      executionId,
      body.reason,
      req.user.companyId,
      req.user,
    );
  }

  /**
   * PATCH /api/quality-control/:executionId/release-hold
   * Release QC hold and resume inspection
   */
  @Patch(':executionId/release-hold')
  async releaseQCHold(
    @Param('executionId') executionId: string,
    @Req() req: any,
  ) {
    return this.qcService.releaseHold(
      executionId,
      req.user.companyId,
      req.user,
    );
  }

  /**
   * GET /api/quality-control/job/:jobId/history
   * Get complete QC history for a job
   */
  @Get('job/:jobId/history')
  async getJobQCHistory(
    @Param('jobId') jobId: string,
    @Req() req: any,
  ) {
    return this.qcService.getQCHistory(jobId, req.user.companyId);
  }

  /**
   * GET /api/quality-control/:executionId/audit
   * Get audit trail for a QC execution
   */
  @Get(':executionId/audit')
  async getQCAudit(
    @Param('executionId') executionId: string,
    @Req() req: any,
  ) {
    return this.qcService.getQCAudit(executionId, req.user.companyId);
  }

  /**
   * GET /api/quality-control/templates
   * Get available QC check templates
   */
  @Get('templates/all')
  async getQCCheckTemplates(@Req() req: any) {
    return this.qcService.getQCCheckTemplates(req.user.companyId);
  }
}
