"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DyeingJob = exports.DyeingJobStatus = void 0;
const typeorm_1 = require("typeorm");
const company_entity_1 = require("../companies/company.entity");
var DyeingJobStatus;
(function (DyeingJobStatus) {
    DyeingJobStatus["RECEIVED"] = "RECEIVED";
    DyeingJobStatus["IN_PROCESS"] = "IN_PROCESS";
    DyeingJobStatus["READY_FOR_DELIVERY"] = "READY_FOR_DELIVERY";
    DyeingJobStatus["DELIVERED"] = "DELIVERED";
})(DyeingJobStatus || (exports.DyeingJobStatus = DyeingJobStatus = {}));
let DyeingJob = class DyeingJob {
};
exports.DyeingJob = DyeingJob;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DyeingJob.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DyeingJob.prototype, "jobNo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DyeingJob.prototype, "customerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DyeingJob.prototype, "customerContact", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DyeingJob.prototype, "fabricType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DyeingJob.prototype, "colour", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DyeingJob.prototype, "shadeNo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DyeingJob.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 3 }),
    __metadata("design:type", Number)
], DyeingJob.prototype, "quantityReceived", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], DyeingJob.prototype, "quantityDelivered", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DyeingJob.prototype, "partyDcNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], DyeingJob.prototype, "receivedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], DyeingJob.prototype, "expectedDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DyeingJobStatus,
        default: DyeingJobStatus.RECEIVED,
    }),
    __metadata("design:type", String)
], DyeingJob.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DyeingJob.prototype, "processNotes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, { onDelete: 'CASCADE' }),
    __metadata("design:type", company_entity_1.Company)
], DyeingJob.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DyeingJob.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DyeingJob.prototype, "updatedAt", void 0);
exports.DyeingJob = DyeingJob = __decorate([
    (0, typeorm_1.Entity)()
], DyeingJob);
//# sourceMappingURL=dyeing-job.entity.js.map