import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DryingExecutionService } from './drying-execution.service';
import { DryingBatch, DryingProcessType, DryingBatchStatus } from './drying-batch.entity';

@Controller('drying-execution')
@UseGuards(JwtAuthGuard)
export class DryingExecutionController {
  constructor(private readonly dryingExecutionService: DryingExecutionService) {}

  @Post('create-batch')
  async createBatch(
    @Req() req,
    @Body()
    body: {
      jobId: string;
      routeStepId: string;
      processId: string;
      processType: DryingProcessType;
      inputQuantity: number;
      uom: string;
      machineId: string;
      machineCode: string;
      recipeId?: string;
      recipeName?: string;
      operatorId: string;
      operatorName: string;
      shift: string;
      targetParameters?: Record<string, any>;
    },
  ): Promise<DryingBatch> {
    return this.dryingExecutionService.createBatch(
      req.user.companyId,
      body.jobId,
      body.routeStepId,
      body.processId,
      body.processType,
      body.inputQuantity,
      body.uom,
      body.machineId,
      body.machineCode,
      body.recipeId,
      body.recipeName,
      body.operatorId,
      body.operatorName,
      body.shift,
      body.targetParameters || {},
      req.user.id,
    );
  }

  @Patch(':batchId/start')
  async startBatch(
    @Req() req,
    @Param('batchId') batchId: string,
  ): Promise<DryingBatch> {
    return this.dryingExecutionService.startBatch(
      req.user.companyId,
      batchId,
      req.user.id,
    );
  }

  @Patch(':batchId/pause')
  async pauseBatch(
    @Req() req,
    @Param('batchId') batchId: string,
    @Body() body: { reason?: string },
  ): Promise<DryingBatch> {
    return this.dryingExecutionService.pauseBatch(
      req.user.companyId,
      batchId,
      body.reason,
      req.user.id,
    );
  }

  @Patch(':batchId/resume')
  async resumeBatch(
    @Req() req,
    @Param('batchId') batchId: string,
  ): Promise<DryingBatch> {
    return this.dryingExecutionService.resumeBatch(
      req.user.companyId,
      batchId,
      req.user.id,
    );
  }

  @Patch(':batchId/record-parameters')
  async recordActualParameters(
    @Req() req,
    @Param('batchId') batchId: string,
    @Body() body: { actualParameters: Record<string, any> },
  ): Promise<DryingBatch> {
    return this.dryingExecutionService.recordActualParameters(
      req.user.companyId,
      batchId,
      body.actualParameters,
      req.user.id,
    );
  }

  @Patch(':batchId/complete')
  async completeBatch(
    @Req() req,
    @Param('batchId') batchId: string,
    @Body()
    body: {
      outputQuantity: number;
      qualityNotes?: string;
      remarks?: string;
    },
  ): Promise<DryingBatch> {
    return this.dryingExecutionService.completeBatch(
      req.user.companyId,
      batchId,
      body.outputQuantity,
      body.qualityNotes,
      body.remarks,
      req.user.id,
    );
  }

  @Patch(':batchId/supervisor-override')
  async supervisorOverride(
    @Req() req,
    @Param('batchId') batchId: string,
    @Body()
    body: {
      outputQuantity: number;
      reason: string;
    },
  ): Promise<DryingBatch> {
    if (!req.user.isSupervisor && !req.user.isAdmin) {
      throw new BadRequestException('Only supervisors can override');
    }

    return this.dryingExecutionService.supervisorOverride(
      req.user.companyId,
      batchId,
      body.outputQuantity,
      body.reason,
      req.user.id,
    );
  }

  @Patch(':batchId/reject')
  async rejectBatch(
    @Req() req,
    @Param('batchId') batchId: string,
    @Body() body: { reason: string },
  ): Promise<DryingBatch> {
    return this.dryingExecutionService.rejectBatch(
      req.user.companyId,
      batchId,
      body.reason,
      req.user.id,
    );
  }

  @Get(':batchId')
  async getBatchById(
    @Req() req,
    @Param('batchId') batchId: string,
  ): Promise<DryingBatch> {
    return this.dryingExecutionService.getBatchById(req.user.companyId, batchId);
  }

  @Get('job/:jobId')
  async getBatchesByJob(
    @Req() req,
    @Param('jobId') jobId: string,
  ): Promise<DryingBatch[]> {
    return this.dryingExecutionService.getBatchesByJob(
      req.user.companyId,
      jobId,
    );
  }

  @Get(':batchId/audit-trail')
  async getAuditTrail(
    @Req() req,
    @Param('batchId') batchId: string,
  ) {
    return this.dryingExecutionService.getAuditTrail(
      req.user.companyId,
      batchId,
    );
  }
}
