import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateWashingExecution1789070000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(
      `CREATE TYPE "public"."washing_batch_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'REJECTED')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."washing_process_type_enum" AS ENUM(
        'NORMAL_WASH',
        'RINSE_WASH',
        'HOT_WASH',
        'COLD_WASH',
        'ENZYME_WASH',
        'BIO_WASH',
        'STONE_WASH',
        'STONE_ENZYME_WASH',
        'ACID_WASH',
        'BLEACH_WASH',
        'PIGMENT_WASH',
        'DENIM_WASH'
      )`,
    );

    // Create washing_batches table
    await queryRunner.createTable(
      new Table({
        name: 'washing_batches',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'batchNo',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'jobId',
            type: 'uuid',
          },
          {
            name: 'routeStepId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'processType',
            type: 'enum',
            enum: [
              'NORMAL_WASH',
              'RINSE_WASH',
              'HOT_WASH',
              'COLD_WASH',
              'ENZYME_WASH',
              'BIO_WASH',
              'STONE_WASH',
              'STONE_ENZYME_WASH',
              'ACID_WASH',
              'BLEACH_WASH',
              'PIGMENT_WASH',
              'DENIM_WASH',
            ],
            enumName: 'washing_process_type_enum',
          },
          {
            name: 'machineId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'machineName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'operatorId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'operatorName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'recipeId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'recipeName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'REJECTED'],
            enumName: 'washing_batch_status_enum',
            default: "'PENDING'",
          },
          {
            name: 'shift',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'startedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'inputQuantity',
            type: 'numeric',
            precision: 12,
            scale: 3,
          },
          {
            name: 'outputQuantity',
            type: 'numeric',
            precision: 12,
            scale: 3,
            isNullable: true,
          },
          {
            name: 'lossQuantity',
            type: 'numeric',
            precision: 12,
            scale: 3,
            default: 0,
          },
          {
            name: 'lossPercentage',
            type: 'numeric',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'supervisorOverrideReason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'supervisorId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'remarks',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'qualityNotes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'parameters',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'companyId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Add foreign keys for washing_batches
    await queryRunner.createForeignKey(
      'washing_batches',
      new TableForeignKey({
        columnNames: ['jobId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'dyeing_job',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'washing_batches',
      new TableForeignKey({
        columnNames: ['routeStepId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'process_route_step',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'washing_batches',
      new TableForeignKey({
        columnNames: ['companyId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'company',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'washing_batches',
      new TableIndex({
        name: 'IDX_BATCH_JOB',
        columnNames: ['jobId'],
      }),
    );

    await queryRunner.createIndex(
      'washing_batches',
      new TableIndex({
        name: 'IDX_BATCH_ROUTE_STEP',
        columnNames: ['routeStepId'],
      }),
    );

    await queryRunner.createIndex(
      'washing_batches',
      new TableIndex({
        name: 'IDX_BATCH_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'washing_batches',
      new TableIndex({
        name: 'IDX_BATCH_COMPANY',
        columnNames: ['companyId'],
      }),
    );

    // Create washing_batch_audit table
    await queryRunner.createTable(
      new Table({
        name: 'washing_batch_audit',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'batchId',
            type: 'uuid',
          },
          {
            name: 'action',
            type: 'varchar',
          },
          {
            name: 'previousValue',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'newValue',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'changedBy',
            type: 'uuid',
          },
          {
            name: 'changedByName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'reason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'approvedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Add foreign key for washing_batch_audit
    await queryRunner.createForeignKey(
      'washing_batch_audit',
      new TableForeignKey({
        columnNames: ['batchId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'washing_batches',
        onDelete: 'CASCADE',
      }),
    );

    // Create index on audit table
    await queryRunner.createIndex(
      'washing_batch_audit',
      new TableIndex({
        name: 'IDX_AUDIT_BATCH',
        columnNames: ['batchId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop audit table
    await queryRunner.dropTable('washing_batch_audit', true, true, true);

    // Drop batches table
    await queryRunner.dropTable('washing_batches', true, true, true);

    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."washing_process_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."washing_batch_status_enum"`);
  }
}
