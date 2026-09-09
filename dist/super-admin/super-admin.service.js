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
exports.SuperAdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const company_entity_1 = require("../companies/company.entity");
const user_entity_1 = require("../users/user.entity");
const subscription_plan_entity_1 = require("./entities/subscription-plan.entity");
const company_subscription_entity_1 = require("./entities/company-subscription.entity");
let SuperAdminService = class SuperAdminService {
    constructor(companyRepo, userRepo, planRepo, subRepo) {
        this.companyRepo = companyRepo;
        this.userRepo = userRepo;
        this.planRepo = planRepo;
        this.subRepo = subRepo;
    }
    listCompanies() {
        return this.companyRepo.find();
    }
    getCompanyUsers(companyId) {
        return this.userRepo.find({
            where: { company: { id: companyId } },
        });
    }
    createPlan(data) {
        return this.planRepo.save(this.planRepo.create(data));
    }
    listPlans() {
        return this.planRepo.find();
    }
    assignPlan(companyId, planId, validTill) {
        return this.subRepo.save({
            company: { id: companyId },
            plan: { id: planId },
            validFrom: new Date(),
            validTill: validTill ?? null,
            isActive: true,
        });
    }
    suspendCompany(companyId) {
        return this.subRepo.update({ company: { id: companyId } }, { isActive: false });
    }
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlan)),
    __param(3, (0, typeorm_1.InjectRepository)(company_subscription_entity_1.CompanySubscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SuperAdminService);
//# sourceMappingURL=super-admin.service.js.map