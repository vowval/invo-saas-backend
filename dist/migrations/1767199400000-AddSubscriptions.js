"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSubscriptions1767199400000 = void 0;
class AddSubscriptions1767199400000 {
    constructor() {
        this.name = 'AddSubscriptions1767199400000';
    }
    async up(queryRunner) {
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
    async down(queryRunner) {
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
exports.AddSubscriptions1767199400000 = AddSubscriptions1767199400000;
//# sourceMappingURL=1767199400000-AddSubscriptions.js.map