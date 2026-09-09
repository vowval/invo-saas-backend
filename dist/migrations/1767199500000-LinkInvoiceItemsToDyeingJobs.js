"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkInvoiceItemsToDyeingJobs1767199500000 = void 0;
class LinkInvoiceItemsToDyeingJobs1767199500000 {
    constructor() {
        this.name = 'LinkInvoiceItemsToDyeingJobs1767199500000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD "dyeingJobId" uuid`);
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD CONSTRAINT "FK_invoice_item_dyeing_job" FOREIGN KEY ("dyeingJobId") REFERENCES "dyeing_job"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP CONSTRAINT "FK_invoice_item_dyeing_job"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP COLUMN "dyeingJobId"`);
    }
}
exports.LinkInvoiceItemsToDyeingJobs1767199500000 = LinkInvoiceItemsToDyeingJobs1767199500000;
//# sourceMappingURL=1767199500000-LinkInvoiceItemsToDyeingJobs.js.map