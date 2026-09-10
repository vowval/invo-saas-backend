import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSubscriptionPlanTable1789200000006 implements MigrationInterface {
  name = 'FixSubscriptionPlanTable1789200000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_plan"`);

    await queryRunner.query(`CREATE TABLE "subscription_plan" (
      "id" character varying NOT NULL,
      "name" character varying NOT NULL,
      "description" text NOT NULL,
      "maxUsers" integer NOT NULL DEFAULT 1,
      "invoiceLimit" integer,
      "billingCycle" character varying NOT NULL DEFAULT 'FREE',
      "priceInr" numeric(12,2) NOT NULL DEFAULT '0',
      "durationMonths" integer,
      "requiresPayment" boolean NOT NULL DEFAULT false,
      "active" boolean NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_4f90575d2d7a31df76f2d4667aa" PRIMARY KEY ("id")
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_plan"`);
  }
}
