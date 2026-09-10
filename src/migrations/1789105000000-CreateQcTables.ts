import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateQcTables1789105000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create QC check type enum
    await queryRunner.query(`
      CREATE TYPE qc_check_type_enum AS ENUM ('NUMERIC', 'ENUM', 'BOOLEAN', 'TEXT');
    `);

    // Create QC execution status enum
    await queryRunner.query(`
      CREATE TYPE qc_execution_status_enum AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');
    `);

    // Create QC overall result enum
    await queryRunner.query(`
      CREATE TYPE qc_overall_result_enum AS ENUM ('PASS', 'FAIL', 'HOLD');
    `);

    // Create qc_check_templates table
    await queryRunner.createTable(
      new Table({
        name: 'qc_check_templates',
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
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'check_type',
            type: 'qc_check_type_enum',
            isNullable: false,
          },
          {
            name: 'weight',
            type: 'numeric',
            precision: 3,
            scale: 1,
            default: 1.0,
          },
          {
            name: 'configuration',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_system_default',
            type: 'boolean',
            default: false,
          },
          {
            name: 'display_order',
            type: 'int',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['company_id'],
            referencedTableName: 'company',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );

    // Create qc_executions table
    await queryRunner.createTable(
      new Table({
        name: 'qc_executions',
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
            name: 'process_route_step_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'qc_status',
            type: 'qc_execution_status_enum',
            default: "'PENDING'",
          },
          {
            name: 'overall_result',
            type: 'qc_overall_result_enum',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'inspector_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'inspected_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['company_id'],
            referencedTableName: 'company',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['job_id'],
            referencedTableName: 'dyeing_job',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['process_route_step_id'],
            referencedTableName: 'process_route_step',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['inspector_id'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
    );

    // Create qc_results table
    await queryRunner.createTable(
      new Table({
        name: 'qc_results',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'qc_execution_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'check_template_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'result',
            type: 'qc_overall_result_enum',
            isNullable: false,
          },
          {
            name: 'actual_value',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'target_value',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'remarks',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['qc_execution_id'],
            referencedTableName: 'qc_executions',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['check_template_id'],
            referencedTableName: 'qc_check_templates',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          },
        ],
      }),
    );

    // Create qc_audit table
    await queryRunner.createTable(
      new Table({
        name: 'qc_audit',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'qc_execution_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'action',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'previous_values',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'new_values',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'user_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['qc_execution_id'],
            referencedTableName: 'qc_executions',
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
    );

    // Create indexes
    await queryRunner.createIndex(
      'qc_executions',
      new TableIndex({
        columnNames: ['company_id', 'job_id'],
      }),
    );

    await queryRunner.createIndex(
      'qc_executions',
      new TableIndex({
        columnNames: ['qc_status'],
      }),
    );

    await queryRunner.createIndex(
      'qc_check_templates',
      new TableIndex({
        columnNames: ['company_id', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'qc_audit',
      new TableIndex({
        columnNames: ['qc_execution_id', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables
    await queryRunner.dropTable('qc_audit');
    await queryRunner.dropTable('qc_results');
    await queryRunner.dropTable('qc_executions');
    await queryRunner.dropTable('qc_check_templates');

    // Drop enums
    await queryRunner.query(`DROP TYPE qc_overall_result_enum;`);
    await queryRunner.query(`DROP TYPE qc_execution_status_enum;`);
    await queryRunner.query(`DROP TYPE qc_check_type_enum;`);
  }
}
