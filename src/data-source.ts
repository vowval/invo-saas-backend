import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { User } from './users/user.entity';
import { Company } from './companies/company.entity';
import { Product } from './products/product.entity';
import { Invoice } from './invoices/invoice.entity';
import { InvoiceItem } from './invoices/invoice-item.entity';
import { DyeingJob } from './dyeing-jobs/dyeing-job.entity';
import { ProcessStage } from './dyeing-jobs/process-stage.entity';
import { GoodsReceiptNote } from './dyeing-jobs/grn.entity';
import { Machine } from './production/machine.entity';
import { Batch } from './production/batch.entity';
import { SubscriptionPlan } from './subscriptions/subscription-plan.entity';
import { ChemicalItem } from './inventory/chemical-item.entity';
import { StockTransaction } from './inventory/stock-transaction.entity';
import { Recipe } from './inventory/recipe.entity';
import { RecipeIngredient } from './inventory/recipe-ingredient.entity';
import { LabDip } from './lab-dip/lab-dip.entity';
import { LabDipSample } from './lab-dip/lab-dip-sample.entity';
import { QcInspection } from './quality-control/qc-inspection.entity';
import { Payment } from './payments/payment.entity';
import { BatchCost } from './costing/batch-cost.entity';
import { ProcessCategory } from './process-master/entities/process-category.entity';
import { Process } from './process-master/entities/process.entity';
import { ProcessParameter } from './process-master/entities/process-parameter.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // 👈 now guaranteed string
  database: process.env.DB_NAME,

  entities: [User, Company, Product, Invoice, InvoiceItem, DyeingJob, ProcessStage, GoodsReceiptNote, SubscriptionPlan, Machine, Batch, ChemicalItem, StockTransaction, Recipe, RecipeIngredient, LabDip, LabDipSample, QcInspection, Payment, BatchCost, ProcessCategory, Process, ProcessParameter],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
