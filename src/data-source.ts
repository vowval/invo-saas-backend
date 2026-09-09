import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { User } from './users/user.entity';
import { Company } from './companies/company.entity';
import { Product } from './products/product.entity';
import { Invoice } from './invoices/invoice.entity';
import { InvoiceItem } from './invoices/invoice-item.entity';
import { DyeingJob } from './dyeing-jobs/dyeing-job.entity';
import { SubscriptionPlan } from './subscriptions/subscription-plan.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // 👈 now guaranteed string
  database: process.env.DB_NAME,

  entities: [User, Company, Product, Invoice, InvoiceItem, DyeingJob, SubscriptionPlan],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
