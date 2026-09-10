import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinishingBatch } from './finishing-batch.entity';
import { FinishingBatchAudit } from './finishing-batch-audit.entity';
import { FinishingExecutionService } from './finishing-execution.service';
import { FinishingExecutionController } from './finishing-execution.controller';
import { ProcessRouteModule } from '../process-route/process-route.module';
import { DyeingJobModule } from '../dyeing-jobs/dyeing-job.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FinishingBatch, FinishingBatchAudit]),
    ProcessRouteModule,
    DyeingJobModule,
  ],
  providers: [FinishingExecutionService],
  controllers: [FinishingExecutionController],
  exports: [FinishingExecutionService],
})
export class FinishingExecutionModule {}
