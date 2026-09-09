import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { Invoice } from '../invoices/invoice.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { PaymentService } from './payment.service';
import { PaymentController, CustomerLedgerController } from './payment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Invoice, DyeingJob])],
  providers: [PaymentService],
  controllers: [PaymentController, CustomerLedgerController],
})
export class PaymentModule {}
