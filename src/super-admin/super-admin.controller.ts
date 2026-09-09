import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Company } from '../companies/company.entity';
import { User } from '../users/user.entity';
import { Invoice } from '../invoices/invoice.entity';
import { SubscriptionService } from '../subscriptions/subscription.service';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class SuperAdminController {
  constructor(
    @InjectRepository(Company) private readonly companies: Repository<Company>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Invoice) private readonly invoices: Repository<Invoice>,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Get('companies')
  async listCompanies(
    @Query('search') search = '',
    @Query('limit') limitValue = '10',
  ) {
    const limit = Math.min(Math.max(Number.parseInt(limitValue, 10) || 10, 1), 50);
    const term = search.trim();
    const query = this.companies
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.users', 'user')
      .orderBy('company.createdAt', 'DESC')
      .distinct(true);

    if (term) {
      query.where(
        'company.name ILIKE :term OR user.name ILIKE :term OR user.email ILIKE :term',
        { term: `%${term}%` },
      );
    }

    const total = await query.getCount();
    const companies = await query.take(limit).getMany();

    const results = await Promise.all(
      companies.map(async company => ({
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
      })),
    );
    return { results, total, limit, search: term };
  }

  @Get('plans')
  getPlans() {
    return this.subscriptionService.getAllPlans();
  }

  @Post('plans')
  createPlan(@Body() body: any) {
    return this.subscriptionService.createPlan(body);
  }

  @Patch('plans/:id')
  updatePlan(@Param('id') planId: string, @Body() body: any) {
    return this.subscriptionService.updatePlan(planId, body);
  }

  @Patch('companies/:id/subscription')
  async updateSubscription(
    @Param('id') companyId: string,
    @Body() body: { planId?: string; status?: string; lifetimeOverride?: boolean },
    @Req() req: any,
  ) {
    if (req.user.role !== Role.SUPER_ADMIN) {
      throw new BadRequestException('Super-admin access is required');
    }
    const company = await this.companies.findOne({ where: { id: companyId } });
    if (!company) {
      throw new BadRequestException('Company not found');
    }

    const lifetimeOverride = body.lifetimeOverride === true;
    const plan = lifetimeOverride
      ? await this.subscriptionService.getPlanStatus(body.planId || company.subscriptionPlan)
      : await this.subscriptionService.getPlan(body.planId || company.subscriptionPlan);
    if (!plan) {
      throw new BadRequestException('Subscription plan not found');
    }
    const allowedStatuses = ['ACTIVE', 'PENDING_PAYMENT', 'SUSPENDED', 'EXPIRED'];
    const status = body.status || 'ACTIVE';
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException('Invalid subscription status');
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
}
