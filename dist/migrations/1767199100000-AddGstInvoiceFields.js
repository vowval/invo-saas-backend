"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddGstInvoiceFields1767199100000 = void 0;
class AddGstInvoiceFields1767199100000 {
    constructor() {
        this.name = 'AddGstInvoiceFields1767199100000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "invoice" ADD "gstRate" numeric(5,2) NOT NULL DEFAULT 5`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "supplyType" character varying NOT NULL DEFAULT 'INTRA_STATE'`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "placeOfSupply" character varying`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "cgstAmount" numeric(12,2) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "sgstAmount" numeric(12,2) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "igstAmount" numeric(12,2) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "grandTotal" numeric(12,2) NOT NULL DEFAULT 0`);
        await queryRunner.query(`UPDATE "invoice" SET "grandTotal" = "totalAmount"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "grandTotal"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "igstAmount"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "sgstAmount"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "cgstAmount"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "placeOfSupply"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "supplyType"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "gstRate"`);
    }
}
exports.AddGstInvoiceFields1767199100000 = AddGstInvoiceFields1767199100000;
//# sourceMappingURL=1767199100000-AddGstInvoiceFields.js.map