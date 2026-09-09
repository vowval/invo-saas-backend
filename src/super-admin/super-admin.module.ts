import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../companies/company.entity';
import { User } from '../users/user.entity';
import { Invoice } from '../invoices/invoice.entity';
import { SuperAdminController } from './super-admin.controller';
import { SubscriptionModule } from '../subscriptions/subscription.module';

@Module({
  imports: [TypeOrmModule.forFeature([Company, User, Invoice]), SubscriptionModule],
  controllers: [SuperAdminController],
})
export class SuperAdminModule {}
