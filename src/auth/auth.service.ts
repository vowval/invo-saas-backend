
import { JwtService } from '@nestjs/jwt';
import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
import * as bcrypt from 'bcrypt';
import { email, text } from '../common/input';
import { SubscriptionService } from '../subscriptions/subscription.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Company) private companies: Repository<Company>,
    private jwtService: JwtService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async register(dto: any) {
    const companyName = text(dto.companyName, 'Company name', { required: true, max: 150 });
    const name = text(dto.name, 'Name', { required: true, max: 100 });
    const userEmail = email(dto.email);
    if (typeof dto.password !== 'string' || dto.password.length < 8 || dto.password.length > 128) {
      throw new UnauthorizedException('Password must be between 8 and 128 characters');
    }
    const existingUser = await this.users.findOne({ where: { email: userEmail } });
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
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

  // async login(dto: any) {
  //   const user = await this.users.findOne({ where: { email: dto.email }, relations: ['company'] });
  //   if (!user || !(await bcrypt.compare(dto.password, user.password))) {
  //     throw new UnauthorizedException();
  //   }

  //   const token = jwt.sign(
  //     { userId: user.id, companyId: user.company.id },
  //     'JWT_SECRET'
  //   );

  //   return { access_token: token };
  // }
  // async login(dto: any) {
  //   const user = await this.users.findOne({
  //     where: { email: dto.email },
  //     relations: ['company'],
  //   });

  //   if (!user || !(await bcrypt.compare(dto.password, user.password))) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }

  //   const payload = {
  //     userId: user.id,
  //     companyId: user.company.id,
  //     role: user.role,
  //   };

  //   return {
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }

  async login(dto: any) {
    const userEmail = email(dto.email);
    if (typeof dto.password !== 'string' || dto.password.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const user = await this.users.findOne({
      where: { email: userEmail },
      relations: ['company'],
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (
      user.company &&
      !user.company.lifetimeSubscription &&
      user.company.subscriptionStatus !== 'ACTIVE'
    ) {
      throw new ForbiddenException(
        'Your account is awaiting administrator payment confirmation or activation',
      );
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


}
