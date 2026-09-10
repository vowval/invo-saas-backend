import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { ProcessRoute } from '../process-route/process-route.entity';
import { ProcessRouteStep } from '../process-route/process-route-step.entity';
import { ReprocessCycle } from '../reprocessing/reprocess-cycle.entity';
import { Packing } from '../packing/packing.entity';
import { Delivery } from '../delivery/delivery.entity';
import { Invoice } from '../invoices/invoice.entity';
import { ProductionDashboardService } from './production-dashboard.service';
import { ProductionDashboardController } from './production-dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DyeingJob,
      ProcessRoute,
      ProcessRouteStep,
      ReprocessCycle,
      Packing,
      Delivery,
      Invoice,
    ]),
  ],
  providers: [ProductionDashboardService],
  controllers: [ProductionDashboardController],
  exports: [ProductionDashboardService],
})
export class DashboardModule {}
