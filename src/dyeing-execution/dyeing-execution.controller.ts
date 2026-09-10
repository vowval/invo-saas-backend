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
import { DyeingExecutionService } from './dyeing-execution.service';
import { DyeingProcessType } from './dyeing-batch.entity';

@Controller('dyeing-execution')
@UseGuards(JwtAuthGuard)
export class DyeingExecutionController {
  constructor(private readonly dyeingService: DyeingExecutionService) {}

  /**
   * Create a new dyeing batch (recipe-driven)
   */
  @Post('job/:jobId/batch')
  async createBatch(
    @Param('jobId') jobId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const {
      routeStepId,
      processType,
      recipeId,
      inputQuantity,
      colour,
      shadeCode,
      ...data
    } = body;

    // Validate process type
    if (!Object.values(DyeingProcessType).includes(processType)) {
      throw new BadRequestException('Invalid dyeing process type');
    }

    return this.dyeingService.createBatch(
      jobId,
      routeStepId,
      processType,
      recipeId,
      inputQuantity,
      colour,
      shadeCode,
      { ...data, userId: req.user.id },
      req.user.companyId,
    );
  }

  /**
   * Get batch details
   */
  @Get('batch/:batchId')
  async getBatch(@Param('batchId') batchId: string, @Req() req: any) {
    return this.dyeingService.getBatch(batchId, req.user.companyId);
  }

  /**
   * Get all batches for a job
   */
  @Get('job/:jobId/batches')
  async getJobBatches(@Param('jobId') jobId: string, @Req() req: any) {
    return this.dyeingService.getJobBatches(jobId, req.user.companyId);
  }

  /**
   * Approve lab dip (if required)
   */
  @Post('batch/:batchId/approve-lab-dip')
  async approveLabDip(
    @Param('batchId') batchId: string,
    @Body() body: { labDipReference: string },
    @Req() req: any,
  ) {
    return this.dyeingService.approveLabDip(
      batchId,
      body.labDipReference,
      req.user.id,
      req.user.companyId,
    );
  }

  /**
   * Reject lab dip
   */
  @Post('batch/:batchId/reject-lab-dip')
  async rejectLabDip(
    @Param('batchId') batchId: string,
    @Body() body: { reason: string },
    @Req() req: any,
  ) {
    return this.dyeingService.rejectLabDip(
      batchId,
      body.reason,
      req.user.id,
      req.user.companyId,
    );
  }

  /**
   * Start dyeing batch
   */
  @Post('batch/:batchId/start')
  async startBatch(@Param('batchId') batchId: string, @Req() req: any) {
    return this.dyeingService.startBatch(batchId, req.user.id, req.user.companyId);
  }

  /**
   * Record process event
   */
  @Post('batch/:batchId/event')
  async recordProcessEvent(
    @Param('batchId') batchId: string,
    @Body()
    body: {
      eventName: string;
      description?: string;
      actualParameters?: Record<string, any>;
    },
    @Req() req: any,
  ) {
    return this.dyeingService.recordProcessEvent(
      batchId,
      body.eventName,
      body.description || null,
      body.actualParameters || null,
      req.user.id,
      req.user.companyId,
    );
  }

  /**
   * Record chemical consumption
   */
  @Post('batch/:batchId/chemical-consumption')
  async recordChemicalConsumption(
    @Param('batchId') batchId: string,
    @Body()
    body: {
      chemicalName: string;
      chemicalItemId?: string;
      chemicalLot?: string;
      plannedQuantity?: number;
      actualQuantity: number;
      unit: string;
    },
    @Req() req: any,
  ) {
    return this.dyeingService.recordChemicalConsumption(
      batchId,
      body.chemicalName,
      body.chemicalItemId || null,
      body.chemicalLot || null,
      body.plannedQuantity || null,
      body.actualQuantity,
      body.unit,
      req.user.id,
      req.user.companyId,
    );
  }

  /**
   * Record dye consumption
   */
  @Post('batch/:batchId/dye-consumption')
  async recordDyeConsumption(
    @Param('batchId') batchId: string,
    @Body()
    body: {
      dyeName: string;
      dyeItemId?: string;
      dyeLot?: string;
      shadeCode?: string;
      plannedQuantity?: number;
      actualQuantity: number;
      unit: string;
    },
    @Req() req: any,
  ) {
    return this.dyeingService.recordDyeConsumption(
      batchId,
      body.dyeName,
      body.dyeItemId || null,
      body.dyeLot || null,
      body.shadeCode || null,
      body.plannedQuantity || null,
      body.actualQuantity,
      body.unit,
      req.user.id,
      req.user.companyId,
    );
  }

  /**
   * Update actual parameters during execution
   */
  @Put('batch/:batchId/parameters')
  async updateActualParameters(
    @Param('batchId') batchId: string,
    @Body() body: { actualParameters: Record<string, any> },
    @Req() req: any,
  ) {
    return this.dyeingService.updateActualParameters(
      batchId,
      body.actualParameters,
      req.user.id,
      req.user.companyId,
    );
  }

  /**
   * Pause dyeing batch
   */
  @Post('batch/:batchId/pause')
  async pauseBatch(
    @Param('batchId') batchId: string,
    @Body() body: { reason: string },
    @Req() req: any,
  ) {
    return this.dyeingService.pauseBatch(batchId, body.reason, req.user.id, req.user.companyId);
  }

  /**
   * Resume paused batch
   */
  @Post('batch/:batchId/resume')
  async resumeBatch(@Param('batchId') batchId: string, @Req() req: any) {
    return this.dyeingService.resumeBatch(batchId, req.user.id, req.user.companyId);
  }

  /**
   * Complete dyeing batch
   */
  @Post('batch/:batchId/complete')
  async completeBatch(
    @Param('batchId') batchId: string,
    @Body()
    body: {
      outputQuantity: number;
      remarks?: string;
      qcResults?: any;
    },
    @Req() req: any,
  ) {
    return this.dyeingService.completeBatch(
      batchId,
      body.outputQuantity,
      body.remarks || '',
      body.qcResults,
      req.user.id,
      req.user.companyId,
    );
  }

  /**
   * Supervisor override
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
    return this.dyeingService.supervisorOverride(
      batchId,
      body.outputQuantity,
      body.reason,
      req.user.id,
      req.user.companyId,
    );
  }

  /**
   * Get process events
   */
  @Get('batch/:batchId/events')
  async getProcessEvents(@Param('batchId') batchId: string, @Req() req: any) {
    return this.dyeingService.getProcessEvents(batchId, req.user.companyId);
  }

  /**
   * Get chemical consumptions
   */
  @Get('batch/:batchId/chemical-consumptions')
  async getChemicalConsumptions(@Param('batchId') batchId: string, @Req() req: any) {
    return this.dyeingService.getChemicalConsumptions(batchId, req.user.companyId);
  }

  /**
   * Get dye consumptions
   */
  @Get('batch/:batchId/dye-consumptions')
  async getDyeConsumptions(@Param('batchId') batchId: string, @Req() req: any) {
    return this.dyeingService.getDyeConsumptions(batchId, req.user.companyId);
  }

  /**
   * Get QC results
   */
  @Get('batch/:batchId/qc-results')
  async getQCResults(@Param('batchId') batchId: string, @Req() req: any) {
    return this.dyeingService.getQCResults(batchId, req.user.companyId);
  }

  /**
   * Get audit trail
   */
  @Get('batch/:batchId/audit')
  async getAuditTrail(@Param('batchId') batchId: string, @Req() req: any) {
    return this.dyeingService.getAuditTrail(batchId, req.user.companyId);
  }
}
