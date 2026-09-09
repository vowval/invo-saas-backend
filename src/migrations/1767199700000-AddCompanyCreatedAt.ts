import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyCreatedAt1767199700000 implements MigrationInterface {
  name = 'AddCompanyCreatedAt1767199700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "company" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "createdAt"`);
  }
}
