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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_plan_entity_1 = require("./subscription-plan.entity");
const plan_constants_1 = require("./plan.constants");
let SubscriptionService = class SubscriptionService {
    constructor(planRepo) {
        this.planRepo = planRepo;
    }
    async getPlans() {
        const plans = await this.planRepo.find({ where: { active: true }, order: { priceInr: 'ASC' } });
        return plans.length ? plans : this.planRepo.create(getSubscriptionPlanDefinitions());
    }
    async getPlan(id) {
        const plan = await this.planRepo.findOne({ where: { id, active: true } });
        if (!plan)
            throw new common_1.BadRequestException('Invalid subscription plan');
        return plan;
    }
    async getAllPlans() {
        return this.planRepo.find({ order: { active: 'DESC', priceInr: 'ASC' } });
    }
    async getPlanStatus(id) {
        return this.planRepo.findOne({ where: { id } });
    }
    async createPlan(body) {
        const id = typeof body.id === 'string'
            ? body.id.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_')
            : '';
        if (!id || id.length > 40) {
            throw new common_1.BadRequestException('Plan ID must contain up to 40 letters, numbers, or underscores');
        }
        const existing = await this.planRepo.findOne({ where: { id } });
        if (existing)
            throw new common_1.BadRequestException('A plan with this ID already exists');
        if (!body.name || !body.description || !body.billingCycle) {
            throw new common_1.BadRequestException('Plan name, description, and billing cycle are required');
        }
        const plan = this.planRepo.create({
            id,
            name: body.name.trim(),
            description: body.description.trim(),
            billingCycle: body.billingCycle.trim().toUpperCase(),
            maxUsers: this.positiveInteger(body.maxUsers, 'Maximum users'),
            invoiceLimit: body.invoiceLimit === null || body.invoiceLimit === undefined
                ? null
                : this.positiveInteger(body.invoiceLimit, 'Invoice limit'),
            priceInr: this.price(body.priceInr),
            durationMonths: body.durationMonths === null || body.durationMonths === undefined
                ? null
                : this.positiveInteger(body.durationMonths, 'Duration'),
            requiresPayment: body.requiresPayment !== false,
            active: true,
        });
        return this.planRepo.save(plan);
    }
    async updatePlan(id, body) {
        const plan = await this.planRepo.findOne({ where: { id } });
        if (!plan)
            throw new common_1.BadRequestException('Subscription plan not found');
        if (typeof body.name === 'string' && body.name.trim())
            plan.name = body.name.trim();
        if (typeof body.description === 'string')
            plan.description = body.description.trim();
        if (body.maxUsers !== undefined)
            plan.maxUsers = this.positiveInteger(body.maxUsers, 'Maximum users');
        if (body.invoiceLimit !== undefined) {
            plan.invoiceLimit = body.invoiceLimit === null
                ? null
                : this.positiveInteger(body.invoiceLimit, 'Invoice limit');
        }
        if (body.priceInr !== undefined) {
            plan.priceInr = this.price(body.priceInr);
        }
        if (body.durationMonths !== undefined) {
            plan.durationMonths = body.durationMonths === null
                ? null
                : this.positiveInteger(body.durationMonths, 'Duration');
        }
        if (body.requiresPayment !== undefined)
            plan.requiresPayment = Boolean(body.requiresPayment);
        if (body.active !== undefined)
            plan.active = body.active === true;
        return this.planRepo.save(plan);
    }
    price(value) {
        const price = Number(value);
        if (!Number.isFinite(price) || price < 0) {
            throw new common_1.BadRequestException('Price must be a valid non-negative number');
        }
        return Number(price.toFixed(2));
    }
    positiveInteger(value, label) {
        const number = Number(value);
        if (!Number.isInteger(number) || number < 1 || number > 1000000) {
            throw new common_1.BadRequestException(`${label} must be a positive whole number`);
        }
        return number;
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlan)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SubscriptionService);
function getSubscriptionPlanDefinitions() {
    return [
        'FREE',
        'TEAM_MONTHLY',
        'TEAM_YEARLY',
        'LIFETIME',
    ].map(id => (0, plan_constants_1.getSubscriptionPlan)(id));
}
//# sourceMappingURL=subscription.service.js.map