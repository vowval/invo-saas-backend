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
exports.AuthService = void 0;
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const company_entity_1 = require("../companies/company.entity");
const bcrypt = require("bcrypt");
const input_1 = require("../common/input");
const subscription_service_1 = require("../subscriptions/subscription.service");
let AuthService = class AuthService {
    constructor(users, companies, jwtService, subscriptionService) {
        this.users = users;
        this.companies = companies;
        this.jwtService = jwtService;
        this.subscriptionService = subscriptionService;
    }
    async register(dto) {
        const companyName = (0, input_1.text)(dto.companyName, 'Company name', { required: true, max: 150 });
        const name = (0, input_1.text)(dto.name, 'Name', { required: true, max: 100 });
        const userEmail = (0, input_1.email)(dto.email);
        if (typeof dto.password !== 'string' || dto.password.length < 8 || dto.password.length > 128) {
            throw new common_1.UnauthorizedException('Password must be between 8 and 128 characters');
        }
        const existingUser = await this.users.findOne({ where: { email: userEmail } });
        if (existingUser) {
            throw new common_1.ConflictException('An account with this email already exists');
        }
        const plan = await this.subscriptionService.getPlan(dto.planId || 'FREE');
        const now = new Date();
        const expiresAt = plan.durationMonths
            ? new Date(now.getTime())
            : null;
        if (expiresAt && plan.durationMonths) {
            expiresAt.setMonth(expiresAt.getMonth() + plan.durationMonths);
        }
        const company = this.companies.create({
            name: companyName,
            subscriptionPlan: plan.id,
            billingCycle: plan.billingCycle,
            subscriptionStatus: plan.requiresPayment ? 'PENDING_PAYMENT' : 'ACTIVE',
            maxUsers: plan.maxUsers,
            invoiceLimit: plan.invoiceLimit,
            invoicesUsed: 0,
            subscriptionStartedAt: now,
            subscriptionExpiresAt: expiresAt,
            lifetimeSubscription: plan.billingCycle === 'LIFETIME',
        });
        await this.companies.save(company);
        const user = this.users.create({
            name,
            email: userEmail,
            password: await bcrypt.hash(dto.password, 10),
            role: 'ADMIN',
            company
        });
        await this.users.save(user);
        return {
            message: plan.requiresPayment
                ? 'Registered. Your paid plan is awaiting payment confirmation.'
                : 'Registered',
            plan: plan.id,
            subscriptionStatus: company.subscriptionStatus,
        };
    }
    async login(dto) {
        const userEmail = (0, input_1.email)(dto.email);
        if (typeof dto.password !== 'string' || dto.password.length === 0) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const user = await this.users.findOne({
            where: { email: userEmail },
            relations: ['company'],
        });
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.company &&
            !user.company.lifetimeSubscription &&
            user.company.subscriptionStatus !== 'ACTIVE') {
            throw new common_1.ForbiddenException('Your account is awaiting administrator payment confirmation or activation');
        }
        const payload = {
            userId: user.id,
            userName: user.name,
            role: user.role,
            email: user.email,
            companyId: user.company ? user.company.id : null,
            companyName: user.company ? user.company.name : null,
            subscriptionPlan: user.company ? user.company.subscriptionPlan : null,
            subscriptionStatus: user.company ? user.company.subscriptionStatus : null,
            invoiceLimit: user.company ? user.company.invoiceLimit : null,
            invoicesUsed: user.company ? user.company.invoicesUsed : null,
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        subscription_service_1.SubscriptionService])
], AuthService);
//# sourceMappingURL=auth.service.js.map