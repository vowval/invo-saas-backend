import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddFactoryIdToProcessMaster1789014100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add factory_id to processes table
    await queryRunner.addColumn(
      'processes',
      new TableColumn({
        name: 'factory_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'processes',
      new TableColumn({
        name: 'cloned_from_process_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Create new indexes
    await queryRunner.createIndex(
      'processes',
      new TableIndex({
        name: 'IDX_processes_factory_category_order',
        columnNames: ['factory_id', 'category_id', 'display_order'],
      }),
    );

    await queryRunner.createIndex(
      'processes',
      new TableIndex({
        name: 'IDX_processes_factory_active',
        columnNames: ['factory_id', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'processes',
      new TableIndex({
        name: 'IDX_processes_factory_code',
        columnNames: ['factory_id', 'process_code'],
      }),
    );

    await queryRunner.createIndex(
      'processes',
      new TableIndex({
        name: 'IDX_processes_is_system_default',
        columnNames: ['is_system_default'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('processes', 'IDX_processes_is_system_default');
    await queryRunner.dropIndex('processes', 'IDX_processes_factory_code');
    await queryRunner.dropIndex('processes', 'IDX_processes_factory_active');
    await queryRunner.dropIndex('processes', 'IDX_processes_factory_category_order');

    // Drop columns
    await queryRunner.dropColumn('processes', 'cloned_from_process_id');
    await queryRunner.dropColumn('processes', 'factory_id');
  }
}
