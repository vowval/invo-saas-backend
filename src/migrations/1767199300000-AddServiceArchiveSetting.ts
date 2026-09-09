import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceArchiveSetting1767199300000 implements MigrationInterface {
  name = 'AddServiceArchiveSetting1767199300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "company" ADD "allowServiceArchive" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "product" ADD "active" boolean NOT NULL DEFAULT true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "active"`);
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "allowServiceArchive"`);
  }
}
