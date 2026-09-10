import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './delivery.entity';
import { DeliveryPackage } from './delivery-package.entity';
import { DeliveryAudit } from './delivery-audit.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { User } from '../users/user.entity';
import { Packing } from '../packing/packing.entity';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Delivery,
      DeliveryPackage,
      DeliveryAudit,
      DyeingJob,
      User,
      Packing,
    ]),
  ],
  controllers: [DeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
