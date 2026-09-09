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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const company_entity_1 = require("./company.entity");
const input_1 = require("../common/input");
let CompanyController = class CompanyController {
    constructor(companyRepo) {
        this.companyRepo = companyRepo;
    }
    getProfile(req) {
        return this.companyRepo.findOne({
            where: { id: req.user.companyId },
        });
    }
    async updateProfile(body, req) {
        const company = await this.companyRepo.findOne({
            where: { id: req.user.companyId },
        });
        if (!company) {
            throw new Error('Company profile not found');
        }
        Object.assign(company, {
            name: (0, input_1.text)(body.name, 'Factory name', { required: true, max: 150 }),
            address: (0, input_1.text)(body.address, 'Address', { max: 500 }),
            gstin: (0, input_1.text)(body.gstin, 'GSTIN', { max: 20 }).toUpperCase(),
            msmeUdyam: (0, input_1.text)(body.msmeUdyam, 'MSME Udyam number', { max: 30 }).toUpperCase(),
            bankName: (0, input_1.text)(body.bankName, 'Bank name', { max: 100 }),
            branchName: (0, input_1.text)(body.branchName, 'Branch name', { max: 100 }),
            accountNo: (0, input_1.text)(body.accountNo, 'Account number', { max: 30 }),
            ifsc: (0, input_1.text)(body.ifsc, 'IFSC code', { max: 20 }).toUpperCase(),
            allowServiceArchive: body.allowServiceArchive === true,
            invoicePrefix: (0, input_1.text)(body.invoicePrefix || 'INV', 'Invoice prefix', { required: true, max: 20 })
                .toUpperCase()
                .replace(/[^A-Z0-9-]/g, ''),
        });
        return this.companyRepo.save(company);
    }
};
exports.CompanyController = CompanyController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "updateProfile", null);
exports.CompanyController = CompanyController = __decorate([
    (0, common_1.Controller)('company'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CompanyController);
//# sourceMappingURL=company.controller.js.map