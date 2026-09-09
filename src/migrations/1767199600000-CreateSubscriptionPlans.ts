import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubscriptionPlans1767199600000 implements MigrationInterface {
  name = 'CreateSubscriptionPlans1767199600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "subscription_plan" (
        "id" character varying NOT NULL,
        "name" character varying NOT NULL,
        "description" text NOT NULL,
        "maxUsers" integer NOT NULL,
        "invoiceLimit" integer,
        "billingCycle" character varying NOT NULL,
        "priceInr" numeric(12,2) NOT NULL DEFAULT 0,
        "durationMonths" integer,
        "requiresPayment" boolean NOT NULL DEFAULT false,
        "active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_subscription_plan" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      INSERT INTO "subscription_plan"
        ("id", "name", "description", "maxUsers", "invoiceLimit", "billingCycle", "priceInr", "durationMonths", "requiresPayment")
      VALUES
        ('FREE', 'Free starter', 'Try DyeFlow with your first 100 invoices.', 1, 100, 'FREE', 0, NULL, false),
        ('TEAM_MONTHLY', 'Team monthly', 'For a growing dyeing factory team.', 5, NULL, 'MONTHLY', 999, 1, true),
        ('TEAM_YEARLY', 'Team yearly', 'Save with annual billing for up to five users.', 5, NULL, 'YEARLY', 9990, 12, true),
        ('LIFETIME', 'Lifetime', 'One-time payment for a ten-user workspace.', 10, NULL, 'LIFETIME', 29999, NULL, true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "subscription_plan"`);
  }
}
