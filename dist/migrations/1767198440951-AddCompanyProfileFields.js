"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCompanyProfileFields1767198440951 = void 0;
class AddCompanyProfileFields1767198440951 {
    constructor() {
        this.name = 'AddCompanyProfileFields1767198440951';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "price" TO "rate"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD "partyDcNo" character varying`);
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD "partyDcDate" date`);
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD "deliveryDcNo" character varying`);
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD "colour" character varying`);
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD "fabricWidth" character varying`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "buyerGstin" character varying`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "orderNo" character varying`);
        await queryRunner.query(`ALTER TABLE "company" ADD "address" character varying`);
        await queryRunner.query(`ALTER TABLE "company" ADD "gstin" character varying`);
        await queryRunner.query(`ALTER TABLE "company" ADD "msmeUdyam" character varying`);
        await queryRunner.query(`ALTER TABLE "company" ADD "bankName" character varying`);
        await queryRunner.query(`ALTER TABLE "company" ADD "branchName" character varying`);
        await queryRunner.query(`ALTER TABLE "company" ADD "accountNo" character varying`);
        await queryRunner.query(`ALTER TABLE "company" ADD "ifsc" character varying`);
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP COLUMN "quantity"`);
        await queryRunner.query(`
        ALTER TABLE "invoice_item"
        ADD "quantity" numeric(10,3)
        `);
        await queryRunner.query(`
        UPDATE "invoice_item"
        SET "quantity" = 0
        WHERE "quantity" IS NULL
        `);
        await queryRunner.query(`
        ALTER TABLE "invoice_item"
        ALTER COLUMN "quantity" SET NOT NULL
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD "quantity" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "ifsc"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "accountNo"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "branchName"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "bankName"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "msmeUdyam"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "gstin"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "orderNo"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "buyerGstin"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP COLUMN "fabricWidth"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP COLUMN "colour"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP COLUMN "deliveryDcNo"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP COLUMN "partyDcDate"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP COLUMN "partyDcNo"`);
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "rate" TO "price"`);
    }
}
exports.AddCompanyProfileFields1767198440951 = AddCompanyProfileFields1767198440951;
//# sourceMappingURL=1767198440951-AddCompanyProfileFields.js.map