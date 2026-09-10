import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateProcessParameters1789013500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create process_parameters table
    await queryRunner.createTable(
      new Table({
        name: 'process_parameters',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'process_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'parameter_code',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'parameter_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'data_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'unit',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'is_required',
            type: 'boolean',
            default: false,
          },
          {
            name: 'display_order',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'default_value',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'min_value',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'max_value',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'allowed_values',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'help_text',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'factory_id',
            type: 'uuid',
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
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['process_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'processes',
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // Create composite indexes for efficient querying
    await queryRunner.createIndex(
      'process_parameters',
      new TableIndex({
        name: 'idx_process_parameters_process_id',
        columnNames: ['process_id'],
      }),
    );

    await queryRunner.createIndex(
      'process_parameters',
      new TableIndex({
        name: 'idx_process_parameters_factory_id',
        columnNames: ['factory_id'],
      }),
    );

    await queryRunner.createIndex(
      'process_parameters',
      new TableIndex({
        name: 'idx_process_parameters_process_factory',
        columnNames: ['process_id', 'factory_id'],
      }),
    );

    await queryRunner.createIndex(
      'process_parameters',
      new TableIndex({
        name: 'idx_process_parameters_code',
        columnNames: ['parameter_code', 'process_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex('process_parameters', 'idx_process_parameters_code');
    await queryRunner.dropIndex('process_parameters', 'idx_process_parameters_process_factory');
    await queryRunner.dropIndex('process_parameters', 'idx_process_parameters_factory_id');
    await queryRunner.dropIndex('process_parameters', 'idx_process_parameters_process_id');

    // Drop foreign keys and table
    const table = await queryRunner.getTable('process_parameters');
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('process_parameters', fk);
      }
    }
    await queryRunner.dropTable('process_parameters', true);
  }
}
