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
        entities: [User, Company, Product, Invoice, InvoiceItem, DyeingJob, ProcessStage, GoodsReceiptNote, SubscriptionPlan, Machine, Batch, ChemicalItem, StockTransaction, Recipe, RecipeIngredient],
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

  ],
})
export class AppModule {}
