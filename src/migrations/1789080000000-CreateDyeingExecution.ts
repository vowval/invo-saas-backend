import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateDyeingExecution1789080000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(`
      CREATE TYPE dyeing_process_type AS ENUM (
        'REACTIVE_DYEING',
        'DISPERSE_DYEING',
        'PIGMENT_DYEING',
        'DIRECT_DYEING',
        'VAT_DYEING',
        'SULPHUR_DYEING',
        'OTHER_DYEING'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE dyeing_batch_status AS ENUM (
        'PENDING',
        'IN_PROGRESS',
        'PAUSED',
        'COMPLETED',
        'ON_HOLD',
        'REJECTED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE lab_dip_approval_status AS ENUM (
        'NOT_REQUIRED',
        'PENDING',
        'APPROVED',
        'REJECTED'
      )
    `);

    // Create dyeing_batches table
    await queryRunner.createTable(
      new Table({
        name: 'dyeing_batches',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'batch_no',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'job_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'route_step_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'process_type',
            type: 'dyeing_process_type',
            isNullable: false,
          },
          {
            name: 'recipe_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'recipe_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'colour',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'shade_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'lab_dip_approval_status',
            type: 'lab_dip_approval_status',
            default: "'NOT_REQUIRED'",
          },
          {
            name: 'lab_dip_reference',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'customer_approved',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'customer_approved_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'input_quantity',
            type: 'numeric',
            precision: 12,
            scale: 3,
            isNullable: false,
          },
          {
            name: 'output_quantity',
            type: 'numeric',
            precision: 12,
            scale: 3,
            isNullable: true,
          },
          {
            name: 'loss_quantity',
            type: 'numeric',
            precision: 12,
            scale: 3,
            isNullable: true,
          },
          {
            name: 'loss_percentage',
            type: 'numeric',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'dyeing_batch_status',
            default: "'PENDING'",
          },
          {
            name: 'machine_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'machine_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'operator_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'operator_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'shift',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'target_parameters',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'actual_parameters',
            type: 'jsonb',
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
            name: 'supervisor_override_reason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'supervisor_id',
            type: 'uuid',
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
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Create indexes for dyeing_batches
    await queryRunner.createIndex(
      'dyeing_batches',
      new TableIndex({
        name: 'idx_dyeing_batch_job_id',
        columnNames: ['job_id'],
      }),
    );

    await queryRunner.createIndex(
      'dyeing_batches',
      new TableIndex({
        name: 'idx_dyeing_batch_route_step_id',
        columnNames: ['route_step_id'],
      }),
    );

    await queryRunner.createIndex(
      'dyeing_batches',
      new TableIndex({
        name: 'idx_dyeing_batch_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'dyeing_batches',
      new TableIndex({
        name: 'idx_dyeing_batch_company_id',
        columnNames: ['company_id'],
      }),
    );

    // Create foreign keys for dyeing_batches
    await queryRunner.createForeignKey(
      'dyeing_batches',
      new TableForeignKey({
        columnNames: ['job_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'dyeing_job',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'dyeing_batches',
      new TableForeignKey({
        columnNames: ['route_step_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'process_route_step',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'dyeing_batches',
      new TableForeignKey({
        columnNames: ['recipe_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'recipe',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'dyeing_batches',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'company',
        onDelete: 'CASCADE',
      }),
    );

    // Create dyeing_batch_audit table
    await queryRunner.createTable(
      new Table({
        name: 'dyeing_batch_audit',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'batch_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'action',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'previous_value',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'new_value',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'changed_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'dyeing_batch_audit',
      new TableForeignKey({
        columnNames: ['batch_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'dyeing_batches',
        onDelete: 'CASCADE',
      }),
    );

    // Create dyeing_process_events table
    await queryRunner.createTable(
      new Table({
        name: 'dyeing_process_events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'batch_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'sequence_number',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'event_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'actual_parameters',
            type: 'jsonb',
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
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'dyeing_process_events',
      new TableForeignKey({
        columnNames: ['batch_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'dyeing_batches',
        onDelete: 'CASCADE',
      }),
    );

    // Create dyeing_chemical_consumption table
    await queryRunner.createTable(
      new Table({
        name: 'dyeing_chemical_consumption',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'batch_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'chemical_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'chemical_item_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'chemical_lot',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'planned_quantity',
            type: 'numeric',
            precision: 12,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'actual_quantity',
            type: 'numeric',
            precision: 12,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'unit',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'dyeing_chemical_consumption',
      new TableForeignKey({
        columnNames: ['batch_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'dyeing_batches',
        onDelete: 'CASCADE',
      }),
    );

    // Create dyeing_dye_consumption table
    await queryRunner.createTable(
      new Table({
        name: 'dyeing_dye_consumption',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'batch_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'dye_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'dye_item_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'dye_lot',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'shade_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'planned_quantity',
            type: 'numeric',
            precision: 12,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'actual_quantity',
            type: 'numeric',
            precision: 12,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'unit',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'dyeing_dye_consumption',
      new TableForeignKey({
        columnNames: ['batch_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'dyeing_batches',
        onDelete: 'CASCADE',
      }),
    );

    // Create dyeing_qc_results table
    await queryRunner.createTable(
      new Table({
        name: 'dyeing_qc_results',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'batch_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'test_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'shade_result',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'colour_matching_result',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'wash_fastness_result',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'wash_fastness_standard',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'rubbing_fastness_result',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'rubbing_fastness_standard',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'other_test_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'other_test_result',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'remarks',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'qc_personnel',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'dyeing_qc_results',
      new TableForeignKey({
        columnNames: ['batch_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'dyeing_batches',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys and tables in reverse order
    await queryRunner.dropTable('dyeing_qc_results');
    await queryRunner.dropTable('dyeing_dye_consumption');
    await queryRunner.dropTable('dyeing_chemical_consumption');
    await queryRunner.dropTable('dyeing_process_events');
    await queryRunner.dropTable('dyeing_batch_audit');
    await queryRunner.dropTable('dyeing_batches');

    // Drop enums
    await queryRunner.query('DROP TYPE IF EXISTS lab_dip_approval_status');
    await queryRunner.query('DROP TYPE IF EXISTS dyeing_batch_status');
    await queryRunner.query('DROP TYPE IF EXISTS dyeing_process_type');
  }
}
