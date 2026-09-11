import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateFabricReceivingTables1789200000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // FabricReceipt Table
    await queryRunner.createTable(
      new Table({
        name: 'fabric_receipt',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'job_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'customer_dc_number',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'customer_reference',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'receipt_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'vehicle_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'transporter',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'fabric_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'fabric_construction',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'composition',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'colour',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'gross_weight',
            type: 'numeric',
            precision: 12,
            scale: 3,
            isNullable: false,
          },
          {
            name: 'tare_weight',
            type: 'numeric',
            precision: 12,
            scale: 3,
            isNullable: true,
          },
          {
            name: 'net_weight',
            type: 'numeric',
            precision: 12,
            scale: 3,
            isNullable: false,
          },
          {
            name: 'uom',
            type: 'varchar',
            default: "'kg'",
            isNullable: false,
          },
          {
            name: 'received_by',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'remarks',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'attachment_paths',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // ReceiptLot Table
    await queryRunner.createTable(
      new Table({
        name: 'receipt_lot',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'receipt_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'lot_number',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'number_of_rolls',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'total_weight',
            type: 'numeric',
            precision: 12,
            scale: 3,
            isNullable: false,
          },
          {
            name: 'uom',
            type: 'varchar',
            default: "'kg'",
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // ReceiptRoll Table
    await queryRunner.createTable(
      new Table({
        name: 'receipt_roll',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'lot_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'roll_number',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'weight',
            type: 'numeric',
            precision: 12,
            scale: 3,
            isNullable: false,
          },
          {
            name: 'uom',
            type: 'varchar',
            default: "'kg'",
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // FabricInspection Table
    await queryRunner.createTable(
      new Table({
        name: 'fabric_inspection',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'receipt_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'inspection_status',
            type: 'varchar',
            default: "'PENDING'",
            isNullable: false,
          },
          {
            name: 'inspector_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'inspection_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // InspectionCheckpoint Table
    await queryRunner.createTable(
      new Table({
        name: 'inspection_checkpoint',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'inspection_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'lot_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'roll_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'checkpoint_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'PENDING'",
            isNullable: false,
          },
          {
            name: 'remarks',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Add Foreign Keys
    await queryRunner.createForeignKey(
      'fabric_receipt',
      new TableForeignKey({
        columnNames: ['job_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'dyeing_job',
        onDelete: 'CASCADE',
        name: 'fk_fabric_receipt_dyeing_job',
      }),
    );

    await queryRunner.createForeignKey(
      'fabric_receipt',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'company',
        onDelete: 'CASCADE',
        name: 'fk_fabric_receipt_company',
      }),
    );

    await queryRunner.createForeignKey(
      'receipt_lot',
      new TableForeignKey({
        columnNames: ['receipt_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'fabric_receipt',
        onDelete: 'CASCADE',
        name: 'fk_receipt_lot_fabric_receipt',
      }),
    );

    await queryRunner.createForeignKey(
      'receipt_roll',
      new TableForeignKey({
        columnNames: ['lot_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'receipt_lot',
        onDelete: 'CASCADE',
        name: 'fk_receipt_roll_receipt_lot',
      }),
    );

    await queryRunner.createForeignKey(
      'fabric_inspection',
      new TableForeignKey({
        columnNames: ['receipt_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'fabric_receipt',
        onDelete: 'CASCADE',
        name: 'fk_fabric_inspection_fabric_receipt',
      }),
    );

    await queryRunner.createForeignKey(
      'inspection_checkpoint',
      new TableForeignKey({
        columnNames: ['inspection_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'fabric_inspection',
        onDelete: 'CASCADE',
        name: 'fk_inspection_checkpoint_fabric_inspection',
      }),
    );

    await queryRunner.createForeignKey(
      'inspection_checkpoint',
      new TableForeignKey({
        columnNames: ['lot_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'receipt_lot',
        onDelete: 'SET NULL',
        name: 'fk_inspection_checkpoint_receipt_lot',
      }),
    );

    await queryRunner.createForeignKey(
      'inspection_checkpoint',
      new TableForeignKey({
        columnNames: ['roll_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'receipt_roll',
        onDelete: 'SET NULL',
        name: 'fk_inspection_checkpoint_receipt_roll',
      }),
    );

    // Add Indexes
    await queryRunner.createIndex(
      'fabric_receipt',
      new TableIndex({
        columnNames: ['job_id'],
        name: 'idx_fabric_receipt_job_id',
      }),
    );

    await queryRunner.createIndex(
      'fabric_receipt',
      new TableIndex({
        columnNames: ['company_id'],
        name: 'idx_fabric_receipt_company_id',
      }),
    );

    await queryRunner.createIndex(
      'receipt_lot',
      new TableIndex({
        columnNames: ['receipt_id'],
        name: 'idx_receipt_lot_receipt_id',
      }),
    );

    await queryRunner.createIndex(
      'receipt_roll',
      new TableIndex({
        columnNames: ['lot_id'],
        name: 'idx_receipt_roll_lot_id',
      }),
    );

    await queryRunner.createIndex(
      'fabric_inspection',
      new TableIndex({
        columnNames: ['receipt_id'],
        name: 'idx_fabric_inspection_receipt_id',
      }),
    );

    await queryRunner.createIndex(
      'inspection_checkpoint',
      new TableIndex({
        columnNames: ['inspection_id'],
        name: 'idx_inspection_checkpoint_inspection_id',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order of creation
    await queryRunner.dropTable('inspection_checkpoint', true);
    await queryRunner.dropTable('fabric_inspection', true);
    await queryRunner.dropTable('receipt_roll', true);
    await queryRunner.dropTable('receipt_lot', true);
    await queryRunner.dropTable('fabric_receipt', true);
  }
}
