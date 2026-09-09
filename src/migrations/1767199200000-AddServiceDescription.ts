import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceDescription1767199200000 implements MigrationInterface {
  name = 'AddServiceDescription1767199200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" ADD "description" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "description"`);
  }
}
