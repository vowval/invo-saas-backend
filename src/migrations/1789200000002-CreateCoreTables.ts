import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCoreTables1789200000002 implements MigrationInterface {
    name = 'CreateCoreTables1789200000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "hsnCode" character varying, "unit" character varying NOT NULL, "rate" numeric(10,2) NOT NULL, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "companyId" uuid, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "company" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "address" character varying, "gstin" character varying, "msmeUdyam" character varying, "bankName" character varying, "branchName" character varying, "accountNo" character varying, "ifsc" character varying, "allowServiceArchive" boolean NOT NULL DEFAULT false, "subscriptionPlan" character varying NOT NULL DEFAULT 'FREE', "billingCycle" character varying NOT NULL DEFAULT 'FREE', "subscriptionStatus" character varying NOT NULL DEFAULT 'ACTIVE', "maxUsers" integer NOT NULL DEFAULT '1', "invoiceLimit" integer, "invoicesUsed" integer NOT NULL DEFAULT '0', "subscriptionStartedAt" TIMESTAMP WITH TIME ZONE, "subscriptionExpiresAt" TIMESTAMP WITH TIME ZONE, "lifetimeSubscription" boolean NOT NULL DEFAULT false, "invoicePrefix" character varying NOT NULL DEFAULT 'INV', "invoiceNextNumber" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role" NOT NULL DEFAULT 'STAFF', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "companyId" uuid, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invoice_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "partyDcNo" character varying, "partyDcDate" date, "deliveryDcNo" character varying, "colour" character varying, "fabricWidth" character varying, "quantity" numeric(10,3) NOT NULL, "rate" numeric(10,2) NOT NULL, "amount" numeric(12,2) NOT NULL, "invoiceId" uuid, "productId" uuid, "dyeingJobId" uuid, CONSTRAINT "PK_621317346abdf61295516f3cb76" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invoice" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoiceNo" character varying NOT NULL, "buyerName" character varying NOT NULL, "buyerAddress" text NOT NULL, "buyerGstin" character varying, "invoiceDate" date NOT NULL, "orderNo" character varying, "customerReference" character varying, "processingDescription" text, "deliveryReference" character varying, "deliveryDate" date, "totalAmount" numeric(12,2) NOT NULL, "gstRate" numeric(5,2) NOT NULL DEFAULT '5', "supplyType" character varying NOT NULL DEFAULT 'INTRA_STATE', "placeOfSupply" character varying, "cgstAmount" numeric(12,2) NOT NULL DEFAULT '0', "sgstAmount" numeric(12,2) NOT NULL DEFAULT '0', "igstAmount" numeric(12,2) NOT NULL DEFAULT '0', "grandTotal" numeric(12,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "jobId" uuid, "companyId" uuid, CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subscription_plan" ("id" character varying NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "maxUsers" integer NOT NULL DEFAULT 1, "invoiceLimit" integer, "billingCycle" character varying NOT NULL DEFAULT 'FREE', "priceInr" numeric(12,2) NOT NULL DEFAULT '0', "durationMonths" integer, "requiresPayment" boolean NOT NULL DEFAULT false, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4f90575d2d7a31df76f2d4667aa" PRIMARY KEY ("id"))`);
        
        // Add basic constraints for core tables
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_9e9fb3d9e0b9e3e9e0b9e3d9e0b" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_9e9fb3d9e0b9e3e9e0b9e3d9e0c" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD CONSTRAINT "FK_9e9fb3d9e0b9e3e9e0b9e3d9e0d" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD CONSTRAINT "FK_9e9fb3d9e0b9e3e9e0b9e3d9e0e" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_9e9fb3d9e0b9e3e9e0b9e3d9e0f" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_9e9fb3d9e0b9e3e9e0b9e3d9e0f"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP CONSTRAINT "FK_9e9fb3d9e0b9e3e9e0b9e3d9e0e"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP CONSTRAINT "FK_9e9fb3d9e0b9e3e9e0b9e3d9e0d"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_9e9fb3d9e0b9e3e9e0b9e3d9e0c"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_9e9fb3d9e0b9e3e9e0b9e3d9e0b"`);
        await queryRunner.query(`DROP TABLE "subscription_plan"`);
        await queryRunner.query(`DROP TABLE "invoice"`);
        await queryRunner.query(`DROP TABLE "invoice_item"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "company"`);
        await queryRunner.query(`DROP TABLE "product"`);
    }
}
