"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCompanyCreatedAt1767199700000 = void 0;
class AddCompanyCreatedAt1767199700000 {
    constructor() {
        this.name = 'AddCompanyCreatedAt1767199700000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "company" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "createdAt"`);
    }
}
exports.AddCompanyCreatedAt1767199700000 = AddCompanyCreatedAt1767199700000;
//# sourceMappingURL=1767199700000-AddCompanyCreatedAt.js.map