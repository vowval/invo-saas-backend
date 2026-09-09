import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabDip } from './lab-dip.entity';
import { LabDipSample } from './lab-dip-sample.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { Recipe } from '../inventory/recipe.entity';
import { LabDipController } from './lab-dip.controller';
import { LabDipService } from './lab-dip.service';

@Module({
  imports: [TypeOrmModule.forFeature([LabDip, LabDipSample, DyeingJob, Recipe])],
  controllers: [LabDipController],
  providers: [LabDipService],
})
export class LabDipModule {}
