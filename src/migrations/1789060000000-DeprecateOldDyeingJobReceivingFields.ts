import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class DeprecateOldDyeingJobReceivingFields1789060000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make old receiving fields nullable (soft deprecation)
    // These fields are superseded by FabricReceipt and FabricInspection modules
    // Data is preserved but fields are no longer used in new code

    await queryRunner.changeColumn(
      'dyeing_job',
      'quantityReceived',
      new TableColumn({
        name: 'quantityReceived',
        type: 'numeric',
        precision: 12,
        scale: 3,
        isNullable: true,
        comment:
          'DEPRECATED: Use FabricReceipt.netWeight instead. Kept for historical data only.',
      }),
    );

    await queryRunner.changeColumn(
      'dyeing_job',
      'partyDcNo',
      new TableColumn({
        name: 'partyDcNo',
        type: 'varchar',
        isNullable: true,
        comment:
          'DEPRECATED: Use FabricReceipt.customerDcNumber instead. Kept for historical data only.',
      }),
    );

    await queryRunner.changeColumn(
      'dyeing_job',
      'receivedDate',
      new TableColumn({
        name: 'receivedDate',
        type: 'date',
        isNullable: true,
        comment:
          'DEPRECATED: Use FabricReceipt.receivedDate instead. Kept for historical data only.',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: restore fields to NOT NULL with reasonable defaults
    await queryRunner.changeColumn(
      'dyeing_job',
      'quantityReceived',
      new TableColumn({
        name: 'quantityReceived',
        type: 'numeric',
        precision: 12,
        scale: 3,
        isNullable: false,
        default: 0,
      }),
    );

    await queryRunner.changeColumn(
      'dyeing_job',
      'partyDcNo',
      new TableColumn({
        name: 'partyDcNo',
        type: 'varchar',
        isNullable: false,
        default: "'LEGACY'",
      }),
    );

    await queryRunner.changeColumn(
      'dyeing_job',
      'receivedDate',
      new TableColumn({
        name: 'receivedDate',
        type: 'date',
        isNullable: false,
        default: 'CURRENT_DATE',
      }),
    );
  }
}
