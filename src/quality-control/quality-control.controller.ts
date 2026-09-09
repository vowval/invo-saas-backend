import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QualityControlService } from './quality-control.service';

@Controller('quality-control')
@UseGuards(JwtAuthGuard)
export class QualityControlController {
  constructor(private readonly qcService: QualityControlService) {}

  @Get('stats')
  stats(@Req() req: any) {
    return this.qcService.rejectionStats(req.user.companyId);
  }

  @Get()
  listAll(@Req() req: any) {
    return this.qcService.listAll(req.user.companyId);
  }

  @Post('batches/:batchId')
  recordInspection(@Param('batchId') batchId: string, @Body() body: any, @Req() req: any) {
    return this.qcService.recordInspection(batchId, body, req.user.companyId);
  }

  @Get('batches/:batchId')
  listForBatch(@Param('batchId') batchId: string, @Req() req: any) {
    return this.qcService.listForBatch(batchId, req.user.companyId);
  }

  @Post('batches/:batchId/reprocess')
  reprocess(@Param('batchId') batchId: string, @Req() req: any) {
    return this.qcService.createReprocessBatch(batchId, req.user.companyId);
  }
}
