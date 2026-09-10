import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
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
import { FabricReceivingModule } from './fabric-receiving/fabric-receiving.module';
import { FabricReceipt } from './fabric-receiving/fabric-receipt.entity';
import { ReceiptLot } from './fabric-receiving/receipt-lot.entity';
import { ReceiptRoll } from './fabric-receiving/receipt-roll.entity';
import { FabricInspection } from './fabric-receiving/fabric-inspection.entity';
import { InspectionCheckpoint } from './fabric-receiving/inspection-checkpoint.entity';
import { ProcessRouteModule } from './process-route/process-route.module';
import { ProcessRoute } from './process-route/process-route.entity';
import { ProcessRouteStep } from './process-route/process-route-step.entity';
import { WashingExecutionModule } from './washing-execution/washing-execution.module';
import { WashingBatch } from './washing-execution/washing-batch.entity';
import { WashingBatchAudit } from './washing-execution/washing-batch-audit.entity';
import { DyeingExecutionModule } from './dyeing-execution/dyeing-execution.module';
import { DyeingBatch } from './dyeing-execution/dyeing-batch.entity';
import { DyeingBatchAudit } from './dyeing-execution/dyeing-batch-audit.entity';
import { DyeingProcessEvent, DyeingChemicalConsumption, DyeingDyeConsumption, DyeingQCResult } from './dyeing-execution/dyeing-process-event.entity';
import { DryingExecutionModule } from './drying-execution/drying-execution.module';
import { DryingBatch } from './drying-execution/drying-batch.entity';
import { DryingBatchAudit } from './drying-execution/drying-batch-audit.entity';
import { FinishingExecutionModule } from './finishing-execution/finishing-execution.module';
import { FinishingBatch } from './finishing-execution/finishing-batch.entity';
import { FinishingBatchAudit } from './finishing-execution/finishing-batch-audit.entity';
import { QcCheckTemplate } from './quality-control/qc-check-template.entity';
import { QcExecution } from './quality-control/qc-execution.entity';
import { QcResult } from './quality-control/qc-result.entity';
import { QcAudit } from './quality-control/qc-audit.entity';
import { ReprocessingModule } from './reprocessing/reprocessing.module';
import { PackingModule } from './packing/packing.module';
import { DeliveryModule } from './delivery/delivery.module';
import { ReprocessRequest } from './reprocessing/reprocess-request.entity';
import { ReprocessCycle } from './reprocessing/reprocess-cycle.entity';
import { ReprocessStepHistory } from './reprocessing/reprocess-step-history.entity';
import { ReprocessAudit } from './reprocessing/reprocess-audit.entity';
import { Packing } from './packing/packing.entity';
import { PackingRoll } from './packing/packing-roll.entity';
import { PackingAudit } from './packing/packing-audit.entity';
import { Delivery } from './delivery/delivery.entity';
import { DeliveryPackage } from './delivery/delivery-package.entity';
import { DeliveryAudit } from './delivery/delivery-audit.entity';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get('DATABASE_URL');
        // When using DATABASE_URL (Neon), don't specify individual credentials
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
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
              FabricReceipt,
              ReceiptLot,
              ReceiptRoll,
              FabricInspection,
              InspectionCheckpoint,
              ProcessRoute,
              ProcessRouteStep,
              WashingBatch,
              WashingBatchAudit,
              DyeingBatch,
              DyeingBatchAudit,
              DyeingProcessEvent,
              DyeingChemicalConsumption,
              DyeingDyeConsumption,
              DyeingQCResult,
              DryingBatch,
              DryingBatchAudit,
              FinishingBatch,
              FinishingBatchAudit,
              QcCheckTemplate,
              QcExecution,
              QcResult,
              QcAudit,
              ReprocessRequest,
              ReprocessCycle,
              ReprocessStepHistory,
              ReprocessAudit,
              Packing,
              PackingRoll,
              PackingAudit,
              Delivery,
              DeliveryPackage,
              DeliveryAudit,
            ],
            migrations: ['dist/migrations/*.js'],
            migrationsRun: true,
            synchronize: true,  // Temporarily enabled to sync missing columns
          };
        }
        // Fallback for traditional individual credentials
        return {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: Number(config.get('DB_PORT', 5432)),
          username: config.get('DB_USER'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_NAME'),
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
            FabricReceipt,
            ReceiptLot,
            ReceiptRoll,
            FabricInspection,
            InspectionCheckpoint,
            ProcessRoute,
            ProcessRouteStep,
            WashingBatch,
            WashingBatchAudit,
            DyeingBatch,
            DyeingBatchAudit,
            DyeingProcessEvent,
            DyeingChemicalConsumption,
            DyeingDyeConsumption,
            DyeingQCResult,
            DryingBatch,
            DryingBatchAudit,
            FinishingBatch,
            FinishingBatchAudit,
            QcCheckTemplate,
            QcExecution,
            QcResult,
            QcAudit,
            ReprocessRequest,
            ReprocessCycle,
            ReprocessStepHistory,
            ReprocessAudit,
            Packing,
            PackingRoll,
            PackingAudit,
            Delivery,
            DeliveryPackage,
            DeliveryAudit,
          ],
          migrations: ['dist/migrations/*.js'],
          migrationsRun: true,
          synchronize: true,  // Temporarily enabled to sync missing columns
        };
      },
    }),

    AuthModule,
    UsersModule,
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
    FabricReceivingModule,
    ProcessRouteModule,
    WashingExecutionModule,
    DyeingExecutionModule,
    DryingExecutionModule,
    FinishingExecutionModule,
    ReprocessingModule,
    PackingModule,
    DeliveryModule,
    DashboardModule,
    HealthModule,
  ],
})
export class AppModule {}
