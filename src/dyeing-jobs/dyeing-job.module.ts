import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DyeingJobController } from './dyeing-job.controller';
import { DyeingJob } from './dyeing-job.entity';
import { ProcessStage } from './process-stage.entity';
import { GoodsReceiptNote } from './grn.entity';
import { DyeingJobService } from './dyeing-job.service';

@Module({
  imports: [TypeOrmModule.forFeature([DyeingJob, ProcessStage, GoodsReceiptNote])],
  controllers: [DyeingJobController],
  providers: [DyeingJobService],
})
export class DyeingJobModule {}
