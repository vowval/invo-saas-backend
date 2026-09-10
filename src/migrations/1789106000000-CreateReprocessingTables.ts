import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateReprocessingTables1789106000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create reprocess request status enum
    await queryRunner.query(`
      CREATE TYPE reprocess_request_status_enum AS ENUM ('PENDING', 'AUTHORIZED', 'REJECTED', 'CANCELLED');
    `);

    // Create reprocess cycle status enum
    await queryRunner.query(`
      CREATE TYPE reprocess_cycle_status_enum AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');
    `);

    // Create reprocess step status enum
    await queryRunner.query(`
      CREATE TYPE reprocess_step_status_enum AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');
    `);

    // Create reprocess_requests table
    await queryRunner.createTable(
      new Table({
        name: 'reprocess_requests',
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
            name: 'qc_execution_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'failure_reason',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'proposed_action',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'reprocess_request_status_enum',
            default: "'PENDING'",
          },
          {
            name: 'requested_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'requested_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'authorized_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'authorized_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'rejection_reason',
            type: 'text',
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
            columnNames: ['qc_execution_id'],
            referencedTableName: 'qc_executions',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['requested_by_id'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['authorized_by_id'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
    );

    // Create reprocess_cycles table
    await queryRunner.createTable(
      new Table({
        name: 'reprocess_cycles',
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
            name: 'cycle_number',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'reprocess_request_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'start_process',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'cycle_status',
            type: 'reprocess_cycle_status_enum',
            default: "'PENDING'",
          },
          {
            name: 'original_input',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'original_output',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'original_loss',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'reprocess_input',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'reprocess_output',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'reprocess_loss',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'additional_loss',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'estimated_additional_cost',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'actual_additional_cost',
            type: 'decimal',
            precision: 12,
            scale: 2,
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
            name: 'remarks',
            type: 'text',
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
            columnNames: ['reprocess_request_id'],
            referencedTableName: 'reprocess_requests',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );

    // Create reprocess_step_history table
    await queryRunner.createTable(
      new Table({
        name: 'reprocess_step_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'cycle_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'original_route_step_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reprocess_route_step_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'process_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'step_order',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'reprocess_step_status_enum',
            default: "'PENDING'",
          },
          {
            name: 'execution_data',
            type: 'jsonb',
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
            columnNames: ['cycle_id'],
            referencedTableName: 'reprocess_cycles',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['original_route_step_id'],
            referencedTableName: 'process_route_step',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['reprocess_route_step_id'],
            referencedTableName: 'process_route_step',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
    );

    // Create reprocess_audit table
    await queryRunner.createTable(
      new Table({
        name: 'reprocess_audit',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'cycle_id',
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
            columnNames: ['cycle_id'],
            referencedTableName: 'reprocess_cycles',
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
      'reprocess_requests',
      new TableIndex({
        columnNames: ['company_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'reprocess_cycles',
      new TableIndex({
        columnNames: ['company_id', 'job_id'],
      }),
    );

    await queryRunner.createIndex(
      'reprocess_cycles',
      new TableIndex({
        columnNames: ['cycle_status'],
      }),
    );

    await queryRunner.createIndex(
      'reprocess_audit',
      new TableIndex({
        columnNames: ['cycle_id', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables
    await queryRunner.dropTable('reprocess_audit');
    await queryRunner.dropTable('reprocess_step_history');
    await queryRunner.dropTable('reprocess_cycles');
    await queryRunner.dropTable('reprocess_requests');

    // Drop enums
    await queryRunner.query(`DROP TYPE reprocess_step_status_enum;`);
    await queryRunner.query(`DROP TYPE reprocess_cycle_status_enum;`);
    await queryRunner.query(`DROP TYPE reprocess_request_status_enum;`);
  }
}
