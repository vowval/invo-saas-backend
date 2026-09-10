import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePackingTables1789107000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create packing status enum
    await queryRunner.query(`
      CREATE TYPE packing_status_enum AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');
    `);

    // Create packings table
    await queryRunner.createTable(
      new Table({
        name: 'packings',
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
            type: 'varchar',
            isNullable: false,
            comment: 'Business-facing packing ID (e.g., PKG-2026-001)',
          },
          {
            name: 'status',
            type: 'packing_status_enum',
            default: "'PENDING'",
          },
          {
            name: 'finished_quantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
            comment: 'Final output quantity in kg',
          },
          {
            name: 'roll_count',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'package_count',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'packing_type',
            type: 'varchar',
            isNullable: true,
            comment: 'e.g., Carton, Bag, Crate',
          },
          {
            name: 'labels',
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
      'packings',
      new TableIndex({
        name: 'idx_packings_job_id',
        columnNames: ['job_id'],
      }),
    );

    // Create packing_rolls table
    await queryRunner.createTable(
      new Table({
        name: 'packing_rolls',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'packing_id',
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
            type: 'decimal',
            precision: 10,
            scale: 2,
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
        ],
        foreignKeys: [
          {
            columnNames: ['packing_id'],
            referencedTableName: 'packings',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Create index on packing_id
    await queryRunner.createIndex(
      'packing_rolls',
      new TableIndex({
        name: 'idx_packing_rolls_packing_id',
        columnNames: ['packing_id'],
      }),
    );

    // Create packing_audit table
    await queryRunner.createTable(
      new Table({
        name: 'packing_audit',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'packing_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'action',
            type: 'varchar',
            isNullable: false,
            comment: 'CREATED, STARTED, HOLD, RELEASED, COMPLETED',
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
            columnNames: ['packing_id'],
            referencedTableName: 'packings',
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

    // Create index on packing_id
    await queryRunner.createIndex(
      'packing_audit',
      new TableIndex({
        name: 'idx_packing_audit_packing_id',
        columnNames: ['packing_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('packing_audit');
    await queryRunner.dropTable('packing_rolls');
    await queryRunner.dropTable('packings');

    // Drop enum
    await queryRunner.query('DROP TYPE packing_status_enum;');
  }
}
