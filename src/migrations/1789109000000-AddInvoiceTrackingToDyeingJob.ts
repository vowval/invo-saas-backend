import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddInvoiceTrackingToDyeingJob1789109000000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add invoice tracking columns to dyeing_jobs table
    await queryRunner.addColumn(
      'dyeing_job',
      new TableColumn({
        name: 'ready_for_invoice_at',
        type: 'timestamp',
        isNullable: true,
        comment: 'When job reaches READY_FOR_INVOICE status',
      }),
    );

    await queryRunner.addColumn(
      'dyeing_job',
      new TableColumn({
        name: 'invoiced_at',
        type: 'timestamp',
        isNullable: true,
        comment: 'When first invoice is created for this job',
      }),
    );

    await queryRunner.addColumn(
      'dyeing_job',
      new TableColumn({
        name: 'invoice_id',
        type: 'uuid',
        isNullable: true,
        comment: 'UUID of first invoice created for this job',
      }),
    );

    // Create index for reporting queries
    await queryRunner.query(
      `CREATE INDEX idx_dyeing_job_ready_for_invoice_at 
       ON dyeing_job(ready_for_invoice_at DESC)`,
    );

    await queryRunner.query(
      `CREATE INDEX idx_dyeing_job_invoiced_at 
       ON dyeing_job(invoiced_at DESC)`,
    );

    await queryRunner.query(
      `CREATE INDEX idx_dyeing_job_status_invoice 
       ON dyeing_job(status, invoiced_at)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_dyeing_job_status_invoice`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_dyeing_job_invoiced_at`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_dyeing_job_ready_for_invoice_at`,
    );

    // Drop columns
    await queryRunner.dropColumn('dyeing_job', 'invoice_id');
    await queryRunner.dropColumn('dyeing_job', 'invoiced_at');
    await queryRunner.dropColumn('dyeing_job', 'ready_for_invoice_at');
  }
}
