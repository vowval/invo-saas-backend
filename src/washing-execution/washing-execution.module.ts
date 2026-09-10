import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WashingBatch } from './washing-batch.entity';
import { WashingBatchAudit } from './washing-batch-audit.entity';
import { WashingExecutionService } from './washing-execution.service';
import { WashingExecutionController } from './washing-execution.controller';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { ProcessRouteStep } from '../process-route/process-route-step.entity';
import { ProcessRouteModule } from '../process-route/process-route.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WashingBatch, WashingBatchAudit, DyeingJob, ProcessRouteStep]),
    ProcessRouteModule,
  ],
  providers: [WashingExecutionService],
  controllers: [WashingExecutionController],
  exports: [WashingExecutionService],
})
export class WashingExecutionModule {}
