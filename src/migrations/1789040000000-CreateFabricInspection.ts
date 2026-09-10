import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateFabricInspection1789040000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create FabricInspection table
    await queryRunner.createTable(
      new Table({
        name: 'fabric_inspection',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'receipt_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'result',
            type: 'enum',
            enum: ['PASS', 'HOLD', 'REJECT'],
            isNullable: true,
          },
          {
            name: 'inspector_name',
            type: 'varchar',
            length: '150',
            isNullable: false,
          },
          {
            name: 'inspection_date_time',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'remarks',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'photo_paths',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'gsm',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'width',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'fabric_type_verified',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'composition_verified',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'weight_verified',
            type: 'decimal',
            precision: 12,
            scale: 3,
            isNullable: true,
          },
          {
            name: 'visible_defects',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'contamination',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'moisture_condition',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'lot_consistency',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'shade_consistency',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'roll_count_verified',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'actual_roll_count',
            type: 'int',
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
            name: 'IDX_INSPECTION_RECEIPT',
            columnNames: ['receipt_id'],
          },
          {
            name: 'IDX_INSPECTION_COMPANY',
            columnNames: ['company_id'],
          },
          {
            name: 'IDX_INSPECTION_RESULT',
            columnNames: ['result'],
          },
        ],
      }),
    );

    // Create InspectionCheckpoint table
    await queryRunner.createTable(
      new Table({
        name: 'inspection_checkpoint',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'inspection_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'check_type',
            type: 'enum',
            enum: [
              'ROLL_COUNT',
              'WEIGHT',
              'GSM',
              'WIDTH',
              'FABRIC_TYPE',
              'COMPOSITION',
              'SHADE_COLOUR',
              'VISIBLE_DEFECTS',
              'CONTAMINATION',
              'MOISTURE_CONDITION',
              'LOT_CONSISTENCY',
              'CUSTOMER_SPEC',
            ],
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PASS', 'FAIL', 'NA'],
            isNullable: false,
          },
          {
            name: 'specification',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'actual_value',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_optional',
            type: 'boolean',
            isNullable: true,
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_CHECKPOINT_INSPECTION',
            columnNames: ['inspection_id'],
          },
          {
            name: 'IDX_CHECKPOINT_TYPE',
            columnNames: ['check_type'],
          },
        ],
      }),
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'fabric_inspection',
      new TableForeignKey({
        columnNames: ['receipt_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'fabric_receipt',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'fabric_inspection',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'company',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'inspection_checkpoint',
      new TableForeignKey({
        columnNames: ['inspection_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'fabric_inspection',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('inspection_checkpoint', true, true, true);
    await queryRunner.dropTable('fabric_inspection', true, true, true);
  }
}
