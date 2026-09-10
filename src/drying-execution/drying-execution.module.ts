import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DryingBatch } from './drying-batch.entity';
import { DryingBatchAudit } from './drying-batch-audit.entity';
import { DryingExecutionService } from './drying-execution.service';
import { DryingExecutionController } from './drying-execution.controller';
import { ProcessRouteModule } from '../process-route/process-route.module';
import { DyeingJobModule } from '../dyeing-jobs/dyeing-job.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DryingBatch, DryingBatchAudit]),
    ProcessRouteModule,
    DyeingJobModule,
  ],
  providers: [DryingExecutionService],
  controllers: [DryingExecutionController],
  exports: [DryingExecutionService],
})
export class DryingExecutionModule {}
