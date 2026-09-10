import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DyeingBatch } from './dyeing-batch.entity';
import { DyeingBatchAudit } from './dyeing-batch-audit.entity';
import { DyeingProcessEvent, DyeingChemicalConsumption, DyeingDyeConsumption, DyeingQCResult } from './dyeing-process-event.entity';
import { DyeingExecutionService } from './dyeing-execution.service';
import { DyeingExecutionController } from './dyeing-execution.controller';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { ProcessRouteStep } from '../process-route/process-route-step.entity';
import { Recipe } from '../inventory/recipe.entity';
import { ProcessRouteModule } from '../process-route/process-route.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DyeingBatch,
      DyeingBatchAudit,
      DyeingProcessEvent,
      DyeingChemicalConsumption,
      DyeingDyeConsumption,
      DyeingQCResult,
      DyeingJob,
      ProcessRouteStep,
      Recipe,
    ]),
    ProcessRouteModule,
  ],
  providers: [DyeingExecutionService],
  controllers: [DyeingExecutionController],
  exports: [DyeingExecutionService],
})
export class DyeingExecutionModule {}
