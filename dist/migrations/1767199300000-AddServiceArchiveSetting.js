"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddServiceArchiveSetting1767199300000 = void 0;
class AddServiceArchiveSetting1767199300000 {
    constructor() {
        this.name = 'AddServiceArchiveSetting1767199300000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "company" ADD "allowServiceArchive" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "product" ADD "active" boolean NOT NULL DEFAULT true`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "allowServiceArchive"`);
    }
}
exports.AddServiceArchiveSetting1767199300000 = AddServiceArchiveSetting1767199300000;
//# sourceMappingURL=1767199300000-AddServiceArchiveSetting.js.map