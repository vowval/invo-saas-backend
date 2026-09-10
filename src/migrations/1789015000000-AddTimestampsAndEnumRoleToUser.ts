import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTimestampsAndEnumRoleToUser1789015000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add createdAt column
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'created_at',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        isNullable: false,
      }),
    );

    // Add updatedAt column
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
        isNullable: false,
      }),
    );

    // Change role column type to enum
    // First, drop the not-null constraint if any
    await queryRunner.changeColumn(
      'user',
      'role',
      new TableColumn({
        name: 'role',
        type: 'enum',
        enum: ['SUPER_ADMIN', 'ADMIN', 'STAFF'],
        default: "'STAFF'",
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove updatedAt column
    await queryRunner.dropColumn('user', 'updated_at');

    // Remove createdAt column
    await queryRunner.dropColumn('user', 'created_at');

    // Change role column type back to string
    await queryRunner.changeColumn(
      'user',
      'role',
      new TableColumn({
        name: 'role',
        type: 'varchar',
        isNullable: false,
      }),
    );
  }
}
