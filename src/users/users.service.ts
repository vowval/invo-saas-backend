import { Injectable, ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { Company } from '../companies/company.entity';
import * as bcrypt from 'bcrypt';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'STAFF';
  companyId: string;
}

export interface UpdateUserDto {
  name?: string;
  role?: 'ADMIN' | 'STAFF';
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Company) private companiesRepository: Repository<Company>,
  ) {}

  /**
   * Get all users for a company
   */
  async getUsersByCompanyId(companyId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { company: { id: companyId } },
      relations: ['company'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a single user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['company'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Create a new user with maxUsers enforcement
   * 
   * IMPORTANT: This is where we enforce subscription plan limits
   */
  async createUser(
    dto: CreateUserDto,
    requestingUserId: string,
    requestingUserRole: UserRole,
  ): Promise<User> {
    // Authorization check: Only ADMIN or SUPER_ADMIN can create users
    if (requestingUserRole !== UserRole.ADMIN && requestingUserRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only admins can create users');
    }

    // Get company
    const company = await this.companiesRepository.findOne({
      where: { id: dto.companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Authorization check: ADMIN can only create users for their own company
    if (requestingUserRole === UserRole.ADMIN) {
      const requestingUser = await this.usersRepository.findOne({
        where: { id: requestingUserId },
        relations: ['company'],
      });

      if (requestingUser?.company?.id !== dto.companyId) {
        throw new ForbiddenException(
          'Admins can only create users for their own company',
        );
      }
    }

    // ✅ CRITICAL: Check user limit from subscription plan
    const existingUserCount = await this.usersRepository.count({
      where: { company: { id: company.id } },
    });

    if (existingUserCount >= company.maxUsers) {
      throw new ForbiddenException(
        `User limit reached for this company's plan. Current: ${existingUserCount}, Limit: ${company.maxUsers}. Please upgrade your subscription plan to add more users.`,
      );
    }

    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Create user
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: (dto.role === 'ADMIN' ? UserRole.ADMIN : UserRole.STAFF) as UserRole,
      company,
    });

    await this.usersRepository.save(user);

    // Return without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * Update a user
   */
  async updateUser(
    userId: string,
    dto: UpdateUserDto,
    requestingUserRole: UserRole,
  ): Promise<User> {
    // Authorization check
    if (requestingUserRole !== UserRole.ADMIN && requestingUserRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only admins can update users');
    }

    const user = await this.getUserById(userId);

    // Cannot edit self to remove ADMIN role
    if (dto.role && dto.role !== 'ADMIN' && userId === userId) {
      throw new ForbiddenException('Cannot remove admin role from yourself');
    }

    Object.assign(user, dto);
    await this.usersRepository.save(user);

    return user;
  }

  /**
   * Delete a user
   */
  async deleteUser(
    userId: string,
    requestingUserId: string,
    requestingUserRole: UserRole,
  ): Promise<void> {
    // Authorization check
    if (requestingUserRole !== UserRole.ADMIN && requestingUserRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only admins can delete users');
    }

    // Cannot delete self
    if (userId === requestingUserId) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    const user = await this.getUserById(userId);

    // Cannot delete ADMIN user
    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot delete admin users');
    }

    await this.usersRepository.remove(user);
  }

  /**
   * Get company user limit status
   */
  async getCompanyUserStatus(companyId: string) {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const userCount = await this.usersRepository.count({
      where: { company: { id: companyId } },
    });

    return {
      companyId,
      companyName: company.name,
      maxUsers: company.maxUsers,
      currentUsers: userCount,
      availableSlots: Math.max(0, company.maxUsers - userCount),
      canAddMore: userCount < company.maxUsers,
    };
  }
}
