import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPayment1788977000000 implements MigrationInterface {
    name = 'AddPayment1788977000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payment_mode_enum" AS ENUM('CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customerName" character varying NOT NULL, "amount" numeric(12,2) NOT NULL, "paymentDate" date NOT NULL, "mode" "public"."payment_mode_enum" NOT NULL DEFAULT 'BANK_TRANSFER', "referenceNo" character varying, "remarks" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "companyId" uuid, CONSTRAINT "PK_payment_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_payment_company_customer" ON "payment" ("companyId", "customerName")`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_payment_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_payment_company"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_payment_company_customer"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TYPE "public"."payment_mode_enum"`);
    }

}
