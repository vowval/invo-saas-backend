import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscriptions1767199400000 implements MigrationInterface {
  name = 'AddSubscriptions1767199400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "company" ADD "subscriptionPlan" character varying NOT NULL DEFAULT 'FREE'`);
    await queryRunner.query(`ALTER TABLE "company" ADD "billingCycle" character varying NOT NULL DEFAULT 'FREE'`);
    await queryRunner.query(`ALTER TABLE "company" ADD "subscriptionStatus" character varying NOT NULL DEFAULT 'ACTIVE'`);
    await queryRunner.query(`ALTER TABLE "company" ADD "maxUsers" integer NOT NULL DEFAULT 1`);
    await queryRunner.query(`ALTER TABLE "company" ADD "invoiceLimit" integer`);
    await queryRunner.query(`ALTER TABLE "company" ADD "invoicesUsed" integer NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "company" ADD "subscriptionStartedAt" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "company" ADD "subscriptionExpiresAt" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "company" ADD "lifetimeSubscription" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`UPDATE "company" SET "invoiceLimit" = 100 WHERE "subscriptionPlan" = 'FREE' AND "invoiceLimit" IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "lifetimeSubscription"`);
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "subscriptionExpiresAt"`);
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "subscriptionStartedAt"`);
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "invoicesUsed"`);
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "invoiceLimit"`);
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "maxUsers"`);
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "subscriptionStatus"`);
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "billingCycle"`);
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "subscriptionPlan"`);
  }
}
