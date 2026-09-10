import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QcInspection } from './qc-inspection.entity';
import { Batch } from '../production/batch.entity';
import { QcCheckTemplate } from './qc-check-template.entity';
import { QcExecution } from './qc-execution.entity';
import { QcResult } from './qc-result.entity';
import { QcAudit } from './qc-audit.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { QualityControlController } from './quality-control.controller';
import { QualityControlService } from './quality-control.service';
import { QcService } from './qc.service';
import { ReprocessingModule } from '../reprocessing/reprocessing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QcInspection,
      Batch,
      QcCheckTemplate,
      QcExecution,
      QcResult,
      QcAudit,
      DyeingJob,
    ]),
    ReprocessingModule,
  ],
  controllers: [QualityControlController],
  providers: [QualityControlService, QcService],
})
export class QualityControlModule {}
