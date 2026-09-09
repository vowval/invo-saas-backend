import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CostingService } from './costing.service';

@Controller('costing')
@UseGuards(JwtAuthGuard)
export class CostingController {
  constructor(private readonly costingService: CostingService) {}

  @Post('batches/:batchId')
  upsertCost(@Param('batchId') batchId: string, @Body() body: any, @Req() req: any) {
    return this.costingService.upsertCost(batchId, body, req.user.companyId);
  }

  @Get('batches/:batchId')
  getBatchCosting(@Param('batchId') batchId: string, @Req() req: any) {
    return this.costingService.getBatchCosting(batchId, req.user.companyId);
  }

  @Get('profitability')
  getProfitabilityReport(@Req() req: any) {
    return this.costingService.getProfitabilityReport(req.user.companyId);
  }
}
