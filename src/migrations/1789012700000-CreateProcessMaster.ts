import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateProcessMaster1789012700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create process_categories table
    await queryRunner.createTable(
      new Table({
        name: 'process_categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
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
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            onUpdate: 'now()',
          },
        ],
      }),
      true,
    );

    // Add index on display_order
    await queryRunner.createIndex(
      'process_categories',
      new TableIndex({
        name: 'IDX_process_categories_display_order',
        columnNames: ['display_order'],
      }),
    );

    // Create processes table
    await queryRunner.createTable(
      new Table({
        name: 'processes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'category_id',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '150',
          },
          {
            name: 'process_code',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'process_family',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'process_type',
            type: 'varchar',
            length: '50',
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
            name: 'has_executions',
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
            name: 'FK_processes_category',
            columnNames: ['category_id'],
            referencedTableName: 'process_categories',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          },
        ],
      }),
      true,
    );

    // Add indexes on processes table
    await queryRunner.createIndex(
      'processes',
      new TableIndex({
        name: 'IDX_processes_category_display_order',
        columnNames: ['category_id', 'display_order'],
      }),
    );

    await queryRunner.createIndex(
      'processes',
      new TableIndex({
        name: 'IDX_processes_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'processes',
      new TableIndex({
        name: 'IDX_processes_process_code',
        columnNames: ['process_code'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys and tables in reverse order
    await queryRunner.dropTable('processes', true);
    await queryRunner.dropTable('process_categories', true);
  }
}
