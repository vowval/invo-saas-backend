import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FabricReceivingService } from './fabric-receiving.service';
import { FabricReceivingController } from './fabric-receiving.controller';
import { FabricReceipt } from './fabric-receipt.entity';
import { ReceiptLot } from './receipt-lot.entity';
import { ReceiptRoll } from './receipt-roll.entity';
import { FabricInspection } from './fabric-inspection.entity';
import { InspectionCheckpoint } from './inspection-checkpoint.entity';
import { FabricInspectionService } from './fabric-inspection.service';
import { FabricInspectionController } from './fabric-inspection.controller';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { Company } from '../companies/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FabricReceipt,
      ReceiptLot,
      ReceiptRoll,
      FabricInspection,
      InspectionCheckpoint,
      DyeingJob,
      Company,
    ]),
  ],
  providers: [FabricReceivingService, FabricInspectionService],
  controllers: [FabricReceivingController, FabricInspectionController],
  exports: [FabricReceivingService, FabricInspectionService],
})
export class FabricReceivingModule {}
