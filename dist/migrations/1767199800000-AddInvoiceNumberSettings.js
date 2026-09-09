"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddInvoiceNumberSettings1767199800000 = void 0;
class AddInvoiceNumberSettings1767199800000 {
    constructor() {
        this.name = 'AddInvoiceNumberSettings1767199800000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "company" ADD "invoicePrefix" character varying NOT NULL DEFAULT 'INV'`);
        await queryRunner.query(`ALTER TABLE "company" ADD "invoiceNextNumber" integer NOT NULL DEFAULT 1`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "invoiceNextNumber"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "invoicePrefix"`);
    }
}
exports.AddInvoiceNumberSettings1767199800000 = AddInvoiceNumberSettings1767199800000;
//# sourceMappingURL=1767199800000-AddInvoiceNumberSettings.js.map