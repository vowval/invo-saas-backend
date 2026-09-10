import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDyeingJobTables1789200000003 implements MigrationInterface {
    name = 'CreateDyeingJobTables1789200000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "dyeing_job" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "jobNo" character varying NOT NULL, "customerName" character varying NOT NULL, "customerContact" character varying, "fabricType" character varying NOT NULL, "colour" character varying, "shadeNo" character varying, "unit" character varying NOT NULL, "quantityReceived" numeric(12,3), "quantityDelivered" numeric(12,3) NOT NULL DEFAULT '0', "partyDcNo" character varying, "receivedDate" date, "expectedDeliveryDate" date, "status" "public"."dyeing_job_status_enum" NOT NULL DEFAULT 'RECEIVED', "trackingStatus" "public"."dyeing_job_trackingstatus_enum" NOT NULL DEFAULT 'FABRIC_RECEIVED', "processNotes" character varying, "readyForInvoiceAt" TIMESTAMP, "invoicedAt" TIMESTAMP, "invoiceId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "companyId" uuid, CONSTRAINT "PK_f21367c47e7783a219a978c99ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "process_stage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stageName" character varying NOT NULL, "sequence" integer NOT NULL, "inputQty" numeric(12,3), "outputQty" numeric(12,3), "status" "public"."process_stage_status_enum" NOT NULL DEFAULT 'PENDING', "startedAt" TIMESTAMP WITH TIME ZONE, "completedAt" TIMESTAMP WITH TIME ZONE, "notes" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "dyeingJobId" uuid, CONSTRAINT "PK_94d46eeaabeb4f24a0ed7c57823" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "goods_receipt_note" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "grnNo" character varying NOT NULL, "vehicleNo" character varying, "lotNumber" character varying, "colour" character varying, "rollCount" integer, "weight" numeric(12,3), "inspectionNotes" character varying, "receivedDate" date NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "dyeingJobId" uuid, "companyId" uuid, CONSTRAINT "PK_24d9e073c8b4db83ef8df9c251f" PRIMARY KEY ("id"))`);
        
        // Add constraints for dyeing job tables
        await queryRunner.query(`ALTER TABLE "dyeing_job" ADD CONSTRAINT "FK_dyeing_job_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dyeing_job" ADD CONSTRAINT "FK_dyeing_job_invoice" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD CONSTRAINT "FK_invoice_item_dyeing_job" FOREIGN KEY ("dyeingJobId") REFERENCES "dyeing_job"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_invoice_dyeing_job" FOREIGN KEY ("jobId") REFERENCES "dyeing_job"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "process_stage" ADD CONSTRAINT "FK_process_stage_dyeing_job" FOREIGN KEY ("dyeingJobId") REFERENCES "dyeing_job"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "goods_receipt_note" ADD CONSTRAINT "FK_grn_dyeing_job" FOREIGN KEY ("dyeingJobId") REFERENCES "dyeing_job"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "goods_receipt_note" ADD CONSTRAINT "FK_grn_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "goods_receipt_note" DROP CONSTRAINT "FK_grn_company"`);
        await queryRunner.query(`ALTER TABLE "goods_receipt_note" DROP CONSTRAINT "FK_grn_dyeing_job"`);
        await queryRunner.query(`ALTER TABLE "process_stage" DROP CONSTRAINT "FK_process_stage_dyeing_job"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_invoice_dyeing_job"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP CONSTRAINT "FK_invoice_item_dyeing_job"`);
        await queryRunner.query(`ALTER TABLE "dyeing_job" DROP CONSTRAINT "FK_dyeing_job_invoice"`);
        await queryRunner.query(`ALTER TABLE "dyeing_job" DROP CONSTRAINT "FK_dyeing_job_company"`);
        await queryRunner.query(`DROP TABLE "goods_receipt_note"`);
        await queryRunner.query(`DROP TABLE "process_stage"`);
        await queryRunner.query(`DROP TABLE "dyeing_job"`);
    }
}
