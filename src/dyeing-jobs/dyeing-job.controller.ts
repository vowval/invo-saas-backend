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
import { DyeingJobService } from './dyeing-job.service';

@Controller('dyeing-jobs')
@UseGuards(JwtAuthGuard)
export class DyeingJobController {
  constructor(private readonly jobService: DyeingJobService) {}

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.jobService.create(body, req.user.companyId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.jobService.findAll(req.user.companyId);
  }

  @Get('active')
  findActive(@Req() req: any) {
    return this.jobService.findActive(req.user.companyId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.jobService.updateStatus(
      id,
      body.status,
      body.quantityDelivered,
      req.user.companyId,
    );
  }
}
