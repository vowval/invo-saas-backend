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
exports.SuperAdminController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const role_enum_1 = require("../auth/role.enum");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const company_entity_1 = require("../companies/company.entity");
const user_entity_1 = require("../users/user.entity");
const invoice_entity_1 = require("../invoices/invoice.entity");
const subscription_service_1 = require("../subscriptions/subscription.service");
let SuperAdminController = class SuperAdminController {
    constructor(companies, users, invoices, subscriptionService) {
        this.companies = companies;
        this.users = users;
        this.invoices = invoices;
        this.subscriptionService = subscriptionService;
    }
    async listCompanies(search = '', limitValue = '10') {
        const limit = Math.min(Math.max(Number.parseInt(limitValue, 10) || 10, 1), 50);
        const term = search.trim();
        const query = this.companies
            .createQueryBuilder('company')
            .leftJoinAndSelect('company.users', 'user')
            .orderBy('company.createdAt', 'DESC')
            .distinct(true);
        if (term) {
            query.where('company.name ILIKE :term OR user.name ILIKE :term OR user.email ILIKE :term', { term: `%${term}%` });
        }
        const total = await query.getCount();
        const companies = await query.take(limit).getMany();
        const results = await Promise.all(companies.map(async (company) => ({
            id: company.id,
            name: company.name,
            subscriptionPlan: company.subscriptionPlan,
            billingCycle: company.billingCycle,
            subscriptionStatus: company.subscriptionStatus,
            maxUsers: company.maxUsers,
            invoiceLimit: company.invoiceLimit,
            invoicesUsed: await this.invoices.count({
                where: { company: { id: company.id } },
            }),
            subscriptionStartedAt: company.subscriptionStartedAt,
            subscriptionExpiresAt: company.subscriptionExpiresAt,
            lifetimeSubscription: company.lifetimeSubscription,
            users: (company.users || []).map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            })),
        })));
        return { results, total, limit, search: term };
    }
    getPlans() {
        return this.subscriptionService.getAllPlans();
    }
    createPlan(body) {
        return this.subscriptionService.createPlan(body);
    }
    updatePlan(planId, body) {
        return this.subscriptionService.updatePlan(planId, body);
    }
    async updateSubscription(companyId, body, req) {
        if (req.user.role !== role_enum_1.Role.SUPER_ADMIN) {
            throw new common_1.BadRequestException('Super-admin access is required');
        }
        const company = await this.companies.findOne({ where: { id: companyId } });
        if (!company) {
            throw new common_1.BadRequestException('Company not found');
        }
        const lifetimeOverride = body.lifetimeOverride === true;
        const plan = lifetimeOverride
            ? await this.subscriptionService.getPlanStatus(body.planId || company.subscriptionPlan)
            : await this.subscriptionService.getPlan(body.planId || company.subscriptionPlan);
        if (!plan) {
            throw new common_1.BadRequestException('Subscription plan not found');
        }
        const allowedStatuses = ['ACTIVE', 'PENDING_PAYMENT', 'SUSPENDED', 'EXPIRED'];
        const status = body.status || 'ACTIVE';
        if (!allowedStatuses.includes(status)) {
            throw new common_1.BadRequestException('Invalid subscription status');
        }
        const now = new Date();
        const expiresAt = plan.durationMonths
            ? new Date(now.getFullYear(), now.getMonth() + plan.durationMonths, now.getDate())
            : null;
        Object.assign(company, {
            subscriptionPlan: plan.id,
            billingCycle: plan.billingCycle,
            subscriptionStatus: status,
            maxUsers: lifetimeOverride ? 1000000 : plan.maxUsers,
            invoiceLimit: lifetimeOverride ? null : plan.invoiceLimit,
            subscriptionStartedAt: now,
            subscriptionExpiresAt: lifetimeOverride ? null : expiresAt,
            lifetimeSubscription: lifetimeOverride || plan.billingCycle === 'LIFETIME',
        });
        return this.companies.save(company);
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Get)('companies'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "listCompanies", null);
__decorate([
    (0, common_1.Get)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Post)('plans'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Patch)('plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Patch)('companies/:id/subscription'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "updateSubscription", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, common_1.Controller)('super-admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SUPER_ADMIN),
    __param(0, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        subscription_service_1.SubscriptionService])
], SuperAdminController);
//# sourceMappingURL=super-admin.controller.js.map