import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Machine } from './machine.entity';
import { Batch } from './batch.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

@Module({
  imports: [TypeOrmModule.forFeature([Machine, Batch, DyeingJob])],
  controllers: [ProductionController],
  providers: [ProductionService],
})
export class ProductionModule {}
