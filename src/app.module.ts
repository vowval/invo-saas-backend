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
import { CompanyModule } from './companies/company.module';
import { SubscriptionModule } from './subscriptions/subscription.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { SubscriptionPlan } from './subscriptions/subscription-plan.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 👈 makes env available everywhere
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_URL'),
        port: Number(config.get('DB_PORT')),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [User, Company, Product, Invoice, InvoiceItem, DyeingJob, SubscriptionPlan],
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

  ],
})
export class AppModule {}
