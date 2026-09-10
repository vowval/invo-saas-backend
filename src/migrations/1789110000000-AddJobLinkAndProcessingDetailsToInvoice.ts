import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddJobLinkAndProcessingDetailsToInvoice1789110000000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add job link
    await queryRunner.addColumn(
      'invoice',
      new TableColumn({
        name: 'job_id',
        type: 'uuid',
        isNullable: true,
        comment: 'Primary job this invoice is for',
      }),
    );

    // Add foreign key constraint
    await queryRunner.query(
      `ALTER TABLE invoice 
       ADD CONSTRAINT fk_invoice_job_id 
       FOREIGN KEY (job_id) REFERENCES dyeing_job(id) ON DELETE SET NULL`,
    );

    // Add customer reference
    await queryRunner.addColumn(
      'invoice',
      new TableColumn({
        name: 'customer_reference',
        type: 'varchar',
        isNullable: true,
        comment: 'Customer PO or reference number',
      }),
    );

    // Add processing description
    await queryRunner.addColumn(
      'invoice',
      new TableColumn({
        name: 'processing_description',
        type: 'text',
        isNullable: true,
        comment:
          'Description of processing done: e.g., "Reactive Dyeing (Navy) + Hot Wash + Softener + Drying"',
      }),
    );

    // Add delivery reference
    await queryRunner.addColumn(
      'invoice',
      new TableColumn({
        name: 'delivery_reference',
        type: 'varchar',
        isNullable: true,
        comment: 'Delivery challan or shipping reference number',
      }),
    );

    // Add delivery date
    await queryRunner.addColumn(
      'invoice',
      new TableColumn({
        name: 'delivery_date',
        type: 'date',
        isNullable: true,
        comment: 'Date goods were delivered',
      }),
    );

    // Create indexes for queries
    await queryRunner.query(
      `CREATE INDEX idx_invoice_job_id ON invoice(job_id)`,
    );

    await queryRunner.query(
      `CREATE INDEX idx_invoice_created_at ON invoice("createdAt" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_invoice_created_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_invoice_job_id`);

    // Drop foreign key
    await queryRunner.query(
      `ALTER TABLE invoice DROP CONSTRAINT IF EXISTS fk_invoice_job_id`,
    );

    // Drop columns
    await queryRunner.dropColumn('invoice', 'delivery_date');
    await queryRunner.dropColumn('invoice', 'delivery_reference');
    await queryRunner.dropColumn('invoice', 'processing_description');
    await queryRunner.dropColumn('invoice', 'customer_reference');
    await queryRunner.dropColumn('invoice', 'job_id');
  }
}
