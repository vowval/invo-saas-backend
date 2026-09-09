import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchCost } from './batch-cost.entity';
import { Batch } from '../production/batch.entity';
import { InvoiceItem } from '../invoices/invoice-item.entity';
import { CostingService } from './costing.service';
import { CostingController } from './costing.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [TypeOrmModule.forFeature([BatchCost, Batch, InvoiceItem]), InventoryModule],
  providers: [CostingService],
  controllers: [CostingController],
})
export class CostingModule {}
