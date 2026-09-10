import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateDeliveryTables1789108000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create delivery status enum
    await queryRunner.query(`
      CREATE TYPE delivery_status_enum AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');
    `);

    // Create deliveries table
    await queryRunner.createTable(
      new Table({
        name: 'deliveries',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'job_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'packing_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'delivery_id',
            type: 'varchar',
            isNullable: false,
            comment: 'Business-facing delivery ID (e.g., DEL-2026-001)',
          },
          {
            name: 'status',
            type: 'delivery_status_enum',
            default: "'PENDING'",
          },
          {
            name: 'delivery_quantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
            comment: 'Quantity being delivered (should not exceed packed quantity)',
          },
          {
            name: 'package_count',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'delivery_challan',
            type: 'varchar',
            isNullable: true,
            comment: 'Customer delivery challan number',
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
            name: 'driver',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'dispatch_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'destination',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'supervisor_override',
            type: 'boolean',
            default: false,
          },
          {
            name: 'supervisor_override_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'remarks',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'started_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'hold_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'hold_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'released_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
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
            onUpdate: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['job_id'],
            referencedTableName: 'dyeing_job',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['packing_id'],
            referencedTableName: 'packings',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['company_id'],
            referencedTableName: 'company',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['created_by'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    // Create index on job_id
    await queryRunner.createIndex(
      'deliveries',
      new TableIndex({
        name: 'idx_deliveries_job_id',
        columnNames: ['job_id'],
      }),
    );

    // Create index on packing_id
    await queryRunner.createIndex(
      'deliveries',
      new TableIndex({
        name: 'idx_deliveries_packing_id',
        columnNames: ['packing_id'],
      }),
    );

    // Create delivery_packages table
    await queryRunner.createTable(
      new Table({
        name: 'delivery_packages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'delivery_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'package_number',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'weight',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'rolls',
            type: 'text',
            isNullable: true,
            comment: 'JSON array of roll numbers or IDs',
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
        ],
        foreignKeys: [
          {
            columnNames: ['delivery_id'],
            referencedTableName: 'deliveries',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Create index on delivery_id
    await queryRunner.createIndex(
      'delivery_packages',
      new TableIndex({
        name: 'idx_delivery_packages_delivery_id',
        columnNames: ['delivery_id'],
      }),
    );

    // Create delivery_audit table
    await queryRunner.createTable(
      new Table({
        name: 'delivery_audit',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'delivery_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'action',
            type: 'varchar',
            isNullable: false,
            comment: 'CREATED, STARTED, HOLD, RELEASED, COMPLETED, AUTO_TRANSITION_TO_READY_FOR_INVOICE',
          },
          {
            name: 'previous_status',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'new_status',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'details',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['delivery_id'],
            referencedTableName: 'deliveries',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['user_id'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    // Create index on delivery_id
    await queryRunner.createIndex(
      'delivery_audit',
      new TableIndex({
        name: 'idx_delivery_audit_delivery_id',
        columnNames: ['delivery_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('delivery_audit');
    await queryRunner.dropTable('delivery_packages');
    await queryRunner.dropTable('deliveries');

    // Drop enum
    await queryRunner.query('DROP TYPE delivery_status_enum;');
  }
}
