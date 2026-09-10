import 'dotenv/config';
import { DataSource } from 'typeorm';
import { seedSubscriptionPlans } from './subscription-plans.seed';
import { seedSuperAdmin } from './super-admin.seed';
import { seedFactoryAdmin } from './factory-admin.seed';
import { seedProcessMaster } from './process-master.seed';
import { seedProcessParameters } from './process-parameters.seed';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
import { Product } from '../products/product.entity';
import { Invoice } from '../invoices/invoice.entity';
import { InvoiceItem } from '../invoices/invoice-item.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { ProcessStage } from '../dyeing-jobs/process-stage.entity';
import { GoodsReceiptNote } from '../dyeing-jobs/grn.entity';
import { Machine } from '../production/machine.entity';
import { Batch } from '../production/batch.entity';
import { SubscriptionPlan } from '../subscriptions/subscription-plan.entity';
import { ChemicalItem } from '../inventory/chemical-item.entity';
import { StockTransaction } from '../inventory/stock-transaction.entity';
import { Recipe } from '../inventory/recipe.entity';
import { RecipeIngredient } from '../inventory/recipe-ingredient.entity';
import { LabDip } from '../lab-dip/lab-dip.entity';
import { LabDipSample } from '../lab-dip/lab-dip-sample.entity';
import { QcInspection } from '../quality-control/qc-inspection.entity';
import { Payment } from '../payments/payment.entity';
import { BatchCost } from '../costing/batch-cost.entity';
import { ProcessCategory } from '../process-master/entities/process-category.entity';
import { Process } from '../process-master/entities/process.entity';
import { ProcessParameter } from '../process-master/entities/process-parameter.entity';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User,
    Company,
    Product,
    Invoice,
    InvoiceItem,
    DyeingJob,
    ProcessStage,
    GoodsReceiptNote,
    SubscriptionPlan,
    Machine,
    Batch,
    ChemicalItem,
    StockTransaction,
    Recipe,
    RecipeIngredient,
    LabDip,
    LabDipSample,
    QcInspection,
    Payment,
    BatchCost,
    ProcessCategory,
    Process,
    ProcessParameter,
  ],
  synchronize: false,
});

async function run() {
  try {
    await dataSource.initialize();
    console.log('Running seeds...\n');
    
    await seedSubscriptionPlans(dataSource);
    console.log('');
    
    await seedProcessMaster(dataSource);
    console.log('');
    
    await seedProcessParameters(dataSource);
    console.log('');
    
    await seedSuperAdmin(dataSource);
    console.log('');
    
    await seedFactoryAdmin(dataSource);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed', err);
    process.exit(1);
  }
}

run();
