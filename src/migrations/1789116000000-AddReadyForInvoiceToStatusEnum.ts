import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReadyForInvoiceToStatusEnum1789116000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add READY_FOR_INVOICE to the enum type
    await queryRunner.query(
      `ALTER TYPE "public"."dyeing_job_status_enum" ADD VALUE 'READY_FOR_INVOICE' AFTER 'READY_FOR_DELIVERY'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL doesn't allow removing enum values, only adding them
    // So this down migration is informational only - manual intervention needed
    // to revert by dropping and recreating the enum type
  }
}
