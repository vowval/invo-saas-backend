import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateFabricReceiving1789030000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create fabric_receipt table
    await queryRunner.createTable(
      new Table({
        name: 'fabric_receipt',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'job_id', type: 'uuid', isNullable: false },
          { name: 'customer_dc_number', type: 'varchar', isNullable: false },
          { name: 'customer_reference', type: 'varchar', isNullable: true },
          { name: 'receipt_date', type: 'date', isNullable: false },
          { name: 'vehicle_number', type: 'varchar', isNullable: true },
          { name: 'transporter', type: 'varchar', isNullable: true },
          { name: 'fabric_type', type: 'varchar', isNullable: false },
          { name: 'fabric_construction', type: 'varchar', isNullable: true },
          { name: 'composition', type: 'varchar', isNullable: true },
          { name: 'colour', type: 'varchar', isNullable: true },
          { name: 'gross_weight', type: 'numeric', precision: 12, scale: 3, isNullable: false },
          { name: 'tare_weight', type: 'numeric', precision: 12, scale: 3, isNullable: true },
          { name: 'net_weight', type: 'numeric', precision: 12, scale: 3, isNullable: false },
          { name: 'uom', type: 'varchar', default: "'kg'", isNullable: false },
          { name: 'received_by', type: 'varchar', isNullable: false },
          { name: 'remarks', type: 'text', isNullable: true },
          { name: 'attachment_paths', type: 'text', isNullable: true },
          { name: 'company_id', type: 'uuid', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
      }),
    );

    // Create receipt_lot table
    await queryRunner.createTable(
      new Table({
        name: 'receipt_lot',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'receipt_id', type: 'uuid', isNullable: false },
          { name: 'lot_number', type: 'varchar', isNullable: false },
          { name: 'number_of_rolls', type: 'integer', isNullable: false },
          { name: 'total_weight', type: 'numeric', precision: 12, scale: 3, isNullable: false },
          { name: 'uom', type: 'varchar', default: "'kg'", isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
      }),
    );

    // Create receipt_roll table
    await queryRunner.createTable(
      new Table({
        name: 'receipt_roll',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'lot_id', type: 'uuid', isNullable: false },
          { name: 'roll_number', type: 'varchar', isNullable: false },
          { name: 'weight', type: 'numeric', precision: 12, scale: 3, isNullable: false },
          { name: 'uom', type: 'varchar', default: "'kg'", isNullable: false },
          { name: 'is_active', type: 'boolean', default: true, isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
      }),
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'fabric_receipt',
      new TableForeignKey({
        columnNames: ['job_id'],
        referencedTableName: 'dyeing_job',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'fabric_receipt',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedTableName: 'company',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'receipt_lot',
      new TableForeignKey({
        columnNames: ['receipt_id'],
        referencedTableName: 'fabric_receipt',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'receipt_roll',
      new TableForeignKey({
        columnNames: ['lot_id'],
        referencedTableName: 'receipt_lot',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('receipt_roll');
    await queryRunner.dropTable('receipt_lot');
    await queryRunner.dropTable('fabric_receipt');
  }
}
