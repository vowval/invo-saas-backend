import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QcInspection } from './qc-inspection.entity';
import { Batch } from '../production/batch.entity';
import { QualityControlController } from './quality-control.controller';
import { QualityControlService } from './quality-control.service';

@Module({
  imports: [TypeOrmModule.forFeature([QcInspection, Batch])],
  controllers: [QualityControlController],
  providers: [QualityControlService],
})
export class QualityControlModule {}
