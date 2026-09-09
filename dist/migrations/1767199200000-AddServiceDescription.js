"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddServiceDescription1767199200000 = void 0;
class AddServiceDescription1767199200000 {
    constructor() {
        this.name = 'AddServiceDescription1767199200000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product" ADD "description" text`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "description"`);
    }
}
exports.AddServiceDescription1767199200000 = AddServiceDescription1767199200000;
//# sourceMappingURL=1767199200000-AddServiceDescription.js.map