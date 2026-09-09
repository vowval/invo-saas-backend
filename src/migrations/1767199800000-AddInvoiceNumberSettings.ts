import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceNumberSettings1767199800000 implements MigrationInterface {
  name = 'AddInvoiceNumberSettings1767199800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "company" ADD "invoicePrefix" character varying NOT NULL DEFAULT 'INV'`);
    await queryRunner.query(`ALTER TABLE "company" ADD "invoiceNextNumber" integer NOT NULL DEFAULT 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "invoiceNextNumber"`);
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "invoicePrefix"`);
  }
}
