import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';
import { getSubscriptionPlan, SubscriptionPlan as PlanDefinition } from './plan.constants';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
  ) {}

  async getPlans() {
    const plans = await this.planRepo.find({ where: { active: true }, order: { priceInr: 'ASC' } });
    if (plans.length) return plans;
    return this.ensureDefaultPlans();
  }

  async getPlan(id: string) {
    const normalizedId = typeof id === 'string' ? id.trim().toUpperCase() : '';
    const plan = await this.planRepo.findOne({ where: { id: normalizedId, active: true } });
    if (plan) return plan;

    const seededPlans = await this.ensureDefaultPlans();
    const fallbackPlan = seededPlans.find(item => item.id === normalizedId && item.active);
    if (!fallbackPlan) throw new BadRequestException('Invalid subscription plan');
    return fallbackPlan;
  }

  async getAllPlans() {
    return this.planRepo.find({ order: { active: 'DESC', priceInr: 'ASC' } });
  }

  async getPlanStatus(id: string) {
    return this.planRepo.findOne({ where: { id } });
  }

  async createPlan(body: Partial<PlanDefinition>) {
    const id = typeof body.id === 'string'
      ? body.id.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_')
      : '';
    if (!id || id.length > 40) {
      throw new BadRequestException('Plan ID must contain up to 40 letters, numbers, or underscores');
    }
    const existing = await this.planRepo.findOne({ where: { id } });
    if (existing) throw new BadRequestException('A plan with this ID already exists');
    if (!body.name || !body.description || !body.billingCycle) {
      throw new BadRequestException('Plan name, description, and billing cycle are required');
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

  async updatePlan(id: string, body: Partial<PlanDefinition>) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new BadRequestException('Subscription plan not found');
    if (typeof body.name === 'string' && body.name.trim()) plan.name = body.name.trim();
    if (typeof body.description === 'string') plan.description = body.description.trim();
    if (body.maxUsers !== undefined) plan.maxUsers = this.positiveInteger(body.maxUsers, 'Maximum users');
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
    if (body.requiresPayment !== undefined) plan.requiresPayment = Boolean(body.requiresPayment);
    if (body.active !== undefined) plan.active = body.active === true;
    return this.planRepo.save(plan);
  }

  private async ensureDefaultPlans() {
    const existingPlans = await this.planRepo.find();
    if (existingPlans.length) return existingPlans;

    const defaults = getSubscriptionPlanDefinitions().map(plan => this.planRepo.create(plan));
    return this.planRepo.save(defaults);
  }

  private price(value: unknown) {
    const price = Number(value);
    if (!Number.isFinite(price) || price < 0) {
      throw new BadRequestException('Price must be a valid non-negative number');
    }
    return Number(price.toFixed(2));
  }

  private positiveInteger(value: unknown, label: string) {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 1 || number > 1000000) {
      throw new BadRequestException(`${label} must be a positive whole number`);
    }
    return number;
  }
}

function getSubscriptionPlanDefinitions() {
  return [
    'FREE',
    'TEAM_MONTHLY',
    'TEAM_YEARLY',
    'LIFETIME',
  ].map(id => getSubscriptionPlan(id));
}
