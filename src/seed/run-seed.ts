import 'dotenv/config';
import { DataSource } from 'typeorm';
import { seedSuperAdmin } from './super-admin.seed';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
import { Product } from '../products/product.entity';
import { Invoice } from '../invoices/invoice.entity';
import { InvoiceItem } from '../invoices/invoice-item.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
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
  ],
  synchronize: false,
});

async function run() {
  try {
    await dataSource.initialize();
    await seedSuperAdmin(dataSource);
    await dataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed', err);
    process.exit(1);
  }
}

run();
