import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Product } from '../products/product.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { InvoicePdfService } from './invoice-pdf.service';
import { ReadyForInvoiceService } from './ready-for-invoice.service';
import { ReadyForInvoiceController } from './ready-for-invoice.controller';
import { Company } from '../companies/company.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { Packing } from '../packing/packing.entity';
import { Delivery } from '../delivery/delivery.entity';
import { FabricReceipt } from '../fabric-receiving/fabric-receipt.entity';
import { SubscriptionModule } from '../subscriptions/subscription.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceItem,
      Product,
      Company,
      DyeingJob,
      Packing,
      Delivery,
      FabricReceipt,
    ]),
    SubscriptionModule,
  ],
  providers: [InvoiceService, InvoicePdfService, ReadyForInvoiceService],
  controllers: [InvoiceController, ReadyForInvoiceController],
})
export class InvoiceModule {}
