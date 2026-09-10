import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReprocessRequest } from './reprocess-request.entity';
import { ReprocessCycle } from './reprocess-cycle.entity';
import { ReprocessStepHistory } from './reprocess-step-history.entity';
import { ReprocessAudit } from './reprocess-audit.entity';
import { QcExecution } from '../quality-control/qc-execution.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { User } from '../users/user.entity';
import { ReprocessingService } from './reprocessing.service';
import { ReprocessingController } from './reprocessing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReprocessRequest,
      ReprocessCycle,
      ReprocessStepHistory,
      ReprocessAudit,
      QcExecution,
      DyeingJob,
      User,
    ]),
  ],
  controllers: [ReprocessingController],
  providers: [ReprocessingService],
  exports: [ReprocessingService],
})
export class ReprocessingModule {}
