import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProcessRouteService } from './process-route.service';

@UseGuards(JwtAuthGuard)
@Controller('process-route')
export class ProcessRouteController {
  constructor(private readonly routeService: ProcessRouteService) {}

  @Post('job/:jobId')
  async createRoute(
    @Param('jobId') jobId: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.routeService.createRoute(jobId, data, req.user.companyId);
  }

  @Get(':routeId')
  async getRoute(@Param('routeId') routeId: string, @Req() req: any) {
    return this.routeService.getRouteById(routeId, req.user.companyId);
  }

  @Get('job/:jobId')
  async getJobRoute(@Param('jobId') jobId: string, @Req() req: any) {
    return this.routeService.getJobRoute(jobId, req.user.companyId);
  }

  @Post(':routeId/steps')
  async addStep(
    @Param('routeId') routeId: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.routeService.addStep(routeId, data, req.user.companyId);
  }

  @Delete('steps/:stepId')
  async removeStep(@Param('stepId') stepId: string, @Req() req: any) {
    return this.routeService.removeStep(stepId, req.user.companyId);
  }

  @Put(':routeId/reorder')
  async reorderSteps(
    @Param('routeId') routeId: string,
    @Body() body: { steps: { id: string; sequence: number }[] },
    @Req() req: any,
  ) {
    return this.routeService.reorderSteps(routeId, body.steps, req.user.companyId);
  }

  @Put('steps/:stepId')
  async updateStep(
    @Param('stepId') stepId: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.routeService.updateStep(stepId, data, req.user.companyId);
  }

  @Put(':routeId/lock')
  async lockRoute(@Param('routeId') routeId: string, @Req() req: any) {
    return this.routeService.lockRoute(routeId, req.user.companyId);
  }

  @Post('steps/:stepId/start')
  async startStep(@Param('stepId') stepId: string, @Req() req: any) {
    return this.routeService.startStep(stepId, req.user.companyId);
  }

  @Post('steps/:stepId/complete')
  async completeStep(
    @Param('stepId') stepId: string,
    @Body() body: { actualQuantity: number },
    @Req() req: any,
  ) {
    return this.routeService.completeStep(stepId, body.actualQuantity, req.user.companyId);
  }

  @Get(':routeId/timeline')
  async getTimeline(@Param('routeId') routeId: string, @Req() req: any) {
    return this.routeService.getRouteTimeline(routeId, req.user.companyId);
  }
}
