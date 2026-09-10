import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateProcessRoute1789050000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ProcessRoute table
    await queryRunner.createTable(
      new Table({
        name: 'process_route',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'job_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'route_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'READY', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'REPROCESS', 'CANCELLED'],
            default: "'PENDING'",
          },
          {
            name: 'template_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'locked_at',
            type: 'timestamp',
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
        indices: [
          {
            name: 'IDX_ROUTE_JOB',
            columnNames: ['job_id'],
          },
          {
            name: 'IDX_ROUTE_COMPANY',
            columnNames: ['company_id'],
          },
          {
            name: 'IDX_ROUTE_STATUS',
            columnNames: ['status'],
          },
        ],
      }),
    );

    // Create ProcessRouteStep table
    await queryRunner.createTable(
      new Table({
        name: 'process_route_step',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'route_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'process_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'sequence',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'READY', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'SKIPPED', 'REPROCESS'],
            default: "'PENDING'",
          },
          {
            name: 'is_mandatory',
            type: 'boolean',
            default: true,
          },
          {
            name: 'requires_qc_before',
            type: 'boolean',
            default: false,
          },
          {
            name: 'recipe_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'machine_group_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'instructions',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'expected_quantity',
            type: 'decimal',
            precision: 12,
            scale: 3,
            isNullable: true,
          },
          {
            name: 'expected_completion_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'actual_start_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'actual_completion_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'actual_quantity',
            type: 'decimal',
            precision: 12,
            scale: 3,
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
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_STEP_ROUTE',
            columnNames: ['route_id'],
          },
          {
            name: 'IDX_STEP_PROCESS',
            columnNames: ['process_id'],
          },
          {
            name: 'IDX_STEP_STATUS',
            columnNames: ['status'],
          },
          {
            name: 'IDX_STEP_SEQUENCE',
            columnNames: ['route_id', 'sequence'],
          },
        ],
      }),
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'process_route',
      new TableForeignKey({
        columnNames: ['job_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'dyeing_job',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'process_route',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'company',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'process_route_step',
      new TableForeignKey({
        columnNames: ['route_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'process_route',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'process_route_step',
      new TableForeignKey({
        columnNames: ['process_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'processes',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('process_route_step', true, true, true);
    await queryRunner.dropTable('process_route', true, true, true);
  }
}
