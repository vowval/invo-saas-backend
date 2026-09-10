import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductionDashboardService } from './production-dashboard.service';

@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
export class ProductionDashboardController {
  constructor(private readonly dashboardService: ProductionDashboardService) {}

  /**
   * GET /api/dashboard/overview
   * Status card counts for today
   */
  @Get('overview')
  async getOverview(@Request() req: any) {
    return this.dashboardService.getDashboardOverview(req.user.companyId);
  }

  /**
   * GET /api/dashboard/active-production
   * Currently running jobs with current process step
   */
  @Get('active-production')
  async getActiveProduction(@Request() req: any) {
    return this.dashboardService.getActiveProduction(req.user.companyId);
  }

  /**
   * GET /api/dashboard/pipeline
   * Visual pipeline with stage counts
   */
  @Get('pipeline')
  async getPipeline(@Request() req: any) {
    return this.dashboardService.getPipeline(req.user.companyId);
  }

  /**
   * GET /api/dashboard/pipeline/:stage/jobs
   * Drill down to specific pipeline stage
   */
  @Get('pipeline/:stage/jobs')
  async getJobsByStage(@Param('stage') stage: string, @Request() req: any) {
    return this.dashboardService.getJobsByStage(req.user.companyId, stage);
  }

  /**
   * GET /api/dashboard/alerts/delayed
   * Jobs exceeding expected completion date
   */
  @Get('alerts/delayed')
  async getDelayedJobs(@Request() req: any) {
    return this.dashboardService.getDelayedJobs(req.user.companyId);
  }

  /**
   * GET /api/dashboard/alerts/on-hold
   * Routes currently ON_HOLD
   */
  @Get('alerts/on-hold')
  async getJobsOnHold(@Request() req: any) {
    return this.dashboardService.getJobsOnHold(req.user.companyId);
  }

  /**
   * GET /api/dashboard/alerts/reprocess
   * Jobs in reprocessing
   */
  @Get('alerts/reprocess')
  async getJobsInReprocess(@Request() req: any) {
    return this.dashboardService.getJobsInReprocess(req.user.companyId);
  }

  /**
   * GET /api/dashboard/alerts/waiting-qc
   * Jobs queued for QC
   */
  @Get('alerts/waiting-qc')
  async getJobsWaitingForQc(@Request() req: any) {
    return this.dashboardService.getJobsWaitingForQc(req.user.companyId);
  }

  /**
   * GET /api/dashboard/alerts/waiting-delivery
   * Jobs ready to ship
   */
  @Get('alerts/waiting-delivery')
  async getJobsWaitingForDelivery(@Request() req: any) {
    return this.dashboardService.getJobsWaitingForDelivery(req.user.companyId);
  }

  /**
   * GET /api/dashboard/alerts/waiting-invoice
   * Jobs waiting for invoicing
   */
  @Get('alerts/waiting-invoice')
  async getJobsWaitingForInvoice(@Request() req: any) {
    return this.dashboardService.getJobsWaitingForInvoice(req.user.companyId);
  }

  /**
   * GET /api/dashboard/complete
   * Full dashboard: all metrics and alerts
   */
  @Get('complete')
  async getCompleteDashboard(@Request() req: any) {
    return this.dashboardService.getCompleteDashboard(req.user.companyId);
  }
}
