import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  BadRequestException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FabricInspectionService } from './fabric-inspection.service';
import { InspectionResult } from './fabric-inspection.entity';

@UseGuards(JwtAuthGuard)
@Controller('fabric-receiving/inspection')
export class FabricInspectionController {
  constructor(private readonly inspectionService: FabricInspectionService) {}

  @Post(':receiptId')
  async createInspection(
    @Param('receiptId') receiptId: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.inspectionService.createInspection(receiptId, data, req.user.companyId);
  }

  @Put(':inspectionId/submit-result')
  async submitResult(
    @Param('inspectionId') inspectionId: string,
    @Body() body: { result: InspectionResult },
    @Req() req: any,
  ) {
    if (!Object.values(InspectionResult).includes(body.result)) {
      throw new BadRequestException('Invalid inspection result');
    }
    return this.inspectionService.submitInspectionResult(inspectionId, body.result, req.user.companyId);
  }

  @Get(':inspectionId')
  async getInspection(
    @Param('inspectionId') inspectionId: string,
    @Req() req: any,
  ) {
    return this.inspectionService.getInspectionById(inspectionId, req.user.companyId);
  }

  @Get('receipt/:receiptId')
  async getReceiptInspections(
    @Param('receiptId') receiptId: string,
    @Req() req: any,
  ) {
    return this.inspectionService.getReceiptInspections(receiptId, req.user.companyId);
  }

  @Get('receipt/:receiptId/summary')
  async getInspectionSummary(
    @Param('receiptId') receiptId: string,
    @Req() req: any,
  ) {
    return this.inspectionService.getInspectionSummary(receiptId, req.user.companyId);
  }

  @Get('job/:jobId/history')
  async getJobInspectionHistory(
    @Param('jobId') jobId: string,
    @Req() req: any,
  ) {
    return this.inspectionService.getJobInspectionHistory(jobId, req.user.companyId);
  }

  @Post(':inspectionId/checkpoints')
  async addCheckpoint(
    @Param('inspectionId') inspectionId: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.inspectionService.addCheckpoint(inspectionId, data, req.user.companyId);
  }

  @Put('checkpoints/:checkpointId')
  async updateCheckpoint(
    @Param('checkpointId') checkpointId: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.inspectionService.updateCheckpoint(checkpointId, data, req.user.companyId);
  }
}
