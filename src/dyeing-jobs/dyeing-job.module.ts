import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DyeingJobController } from './dyeing-job.controller';
import { DyeingJob } from './dyeing-job.entity';
import { ProcessStage } from './process-stage.entity';
import { DyeingJobService } from './dyeing-job.service';

@Module({
  imports: [TypeOrmModule.forFeature([DyeingJob, ProcessStage])],
  controllers: [DyeingJobController],
  providers: [DyeingJobService],
})
export class DyeingJobModule {}
