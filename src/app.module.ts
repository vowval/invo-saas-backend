import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { Company } from './companies/company.entity';
import { ProductModule } from './products/product.module';
import { Product } from './products/product.entity';
import { InvoiceModule } from './invoices/invoice.module';
import { Invoice } from './invoices/invoice.entity';
import { InvoiceItem } from './invoices/invoice-item.entity';
import { DyeingJobModule } from './dyeing-jobs/dyeing-job.module';
import { DyeingJob } from './dyeing-jobs/dyeing-job.entity';
import { ProcessStage } from './dyeing-jobs/process-stage.entity';
import { GoodsReceiptNote } from './dyeing-jobs/grn.entity';
import { CompanyModule } from './companies/company.module';
import { SubscriptionModule } from './subscriptions/subscription.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { SubscriptionPlan } from './subscriptions/subscription-plan.entity';
import { ProductionModule } from './production/production.module';
import { Machine } from './production/machine.entity';
import { Batch } from './production/batch.entity';
import { InventoryModule } from './inventory/inventory.module';
import { ChemicalItem } from './inventory/chemical-item.entity';
import { StockTransaction } from './inventory/stock-transaction.entity';
import { Recipe } from './inventory/recipe.entity';
import { RecipeIngredient } from './inventory/recipe-ingredient.entity';
import { LabDipModule } from './lab-dip/lab-dip.module';
import { LabDip } from './lab-dip/lab-dip.entity';
import { LabDipSample } from './lab-dip/lab-dip-sample.entity';
import { QualityControlModule } from './quality-control/quality-control.module';
import { QcInspection } from './quality-control/qc-inspection.entity';
import { PaymentModule } from './payments/payment.module';
import { Payment } from './payments/payment.entity';
import { CostingModule } from './costing/costing.module';
import { BatchCost } from './costing/batch-cost.entity';
import { ProcessMasterModule } from './process-master/process-master.module';
import { ProcessCategory } from './process-master/entities/process-category.entity';
import { Process } from './process-master/entities/process.entity';
import { ProcessParameter } from './process-master/entities/process-parameter.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 👈 makes env available everywhere
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        port: Number(config.get('DB_PORT')),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [User, Company, Product, Invoice, InvoiceItem, DyeingJob, ProcessStage, GoodsReceiptNote, SubscriptionPlan, Machine, Batch, ChemicalItem, StockTransaction, Recipe, RecipeIngredient, LabDip, LabDipSample, QcInspection, Payment, BatchCost, ProcessCategory, Process, ProcessParameter],
        synchronize: false,
      }),
    }),

    AuthModule,
    ProductModule,
    InvoiceModule,
    DyeingJobModule,
    CompanyModule,
    SubscriptionModule,
    SuperAdminModule,
    ProductionModule,
    InventoryModule,
    LabDipModule,
    QualityControlModule,
    PaymentModule,
    CostingModule,
    ProcessMasterModule,

  ],
})
export class AppModule {}
