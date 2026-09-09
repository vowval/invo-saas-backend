import { MigrationInterface, QueryRunner } from 'typeorm';

export class LinkInvoiceItemsToDyeingJobs1767199500000 implements MigrationInterface {
  name = 'LinkInvoiceItemsToDyeingJobs1767199500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice_item" ADD "dyeingJobId" uuid`);
    await queryRunner.query(`ALTER TABLE "invoice_item" ADD CONSTRAINT "FK_invoice_item_dyeing_job" FOREIGN KEY ("dyeingJobId") REFERENCES "dyeing_job"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice_item" DROP CONSTRAINT "FK_invoice_item_dyeing_job"`);
    await queryRunner.query(`ALTER TABLE "invoice_item" DROP COLUMN "dyeingJobId"`);
  }
}
