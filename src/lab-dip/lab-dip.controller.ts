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
import { LabDipService } from './lab-dip.service';

@Controller('lab-dips')
@UseGuards(JwtAuthGuard)
export class LabDipController {
  constructor(private readonly labDipService: LabDipService) {}

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.labDipService.create(body, req.user.companyId);
  }

  @Get()
  list(@Req() req: any) {
    return this.labDipService.list(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.labDipService.findOrFail(id, req.user.companyId);
  }

  @Post(':id/samples')
  addSample(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.labDipService.addSample(id, body, req.user.companyId);
  }

  @Post(':id/samples/:sampleId/approve')
  approveSample(@Param('id') id: string, @Param('sampleId') sampleId: string, @Req() req: any) {
    return this.labDipService.decideSample(id, sampleId, 'APPROVED', req.user.companyId);
  }

  @Post(':id/samples/:sampleId/reject')
  rejectSample(@Param('id') id: string, @Param('sampleId') sampleId: string, @Req() req: any) {
    return this.labDipService.decideSample(id, sampleId, 'REJECTED', req.user.companyId);
  }

  @Post(':id/promote')
  promote(@Param('id') id: string, @Req() req: any) {
    return this.labDipService.promoteToProduction(id, req.user.companyId);
  }
}
