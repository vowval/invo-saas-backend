import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductionService } from './production.service';

@Controller('production')
@UseGuards(JwtAuthGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post('machines')
  createMachine(@Body() body: any, @Req() req: any) {
    return this.productionService.createMachine(body, req.user.companyId);
  }

  @Get('machines')
  listMachines(@Req() req: any) {
    return this.productionService.listMachines(req.user.companyId);
  }

  @Patch('machines/:id/status')
  setMachineStatus(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.productionService.setMachineStatus(id, body.status, req.user.companyId);
  }

  @Get('machines/board')
  getMachineBoard(@Req() req: any) {
    return this.productionService.getMachineBoard(req.user.companyId);
  }

  @Post('batches')
  createBatch(@Body() body: any, @Req() req: any) {
    return this.productionService.createBatch(body, req.user.companyId);
  }

  @Get('batches')
  listBatches(@Req() req: any) {
    return this.productionService.listBatches(req.user.companyId);
  }

  @Patch('batches/:id/start')
  startBatch(@Param('id') id: string, @Req() req: any) {
    return this.productionService.startBatch(id, req.user.companyId);
  }

  @Patch('batches/:id/complete')
  completeBatch(@Param('id') id: string, @Req() req: any) {
    return this.productionService.completeBatch(id, req.user.companyId);
  }
}
