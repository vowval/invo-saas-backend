import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService, CreateUserDto, UpdateUserDto } from './users.service';
import { User, UserRole } from './user.entity';

interface AuthRequest extends Request {
  user: {
    id: string;
    role: UserRole;
    companyId: string;
  };
}

/**
 * Users Controller
 * Handles user CRUD operations with role-based access control
 * 
 * IMPORTANT: User creation enforces maxUsers limit from company's subscription plan
 */
@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * GET /api/users/company/:companyId
   * Get all users for a company
   * 
   * Access Control:
   * - SUPER_ADMIN: Can get users for any company
   * - ADMIN: Can only get users for their own company
   * - STAFF: Forbidden
   */
  @Get('company/:companyId')
  async getUsersByCompanyId(
    @Param('companyId') companyId: string,
    @Request() req: AuthRequest,
  ) {
    // Authorization check
    if (req.user.role === UserRole.STAFF) {
      throw new ForbiddenException('Staff cannot view user list');
    }

    if (req.user.role === UserRole.ADMIN && req.user.companyId !== companyId) {
      throw new ForbiddenException('Admins can only view users in their own company');
    }

    return this.usersService.getUsersByCompanyId(companyId);
  }

  /**
   * GET /api/users
   * Get all users for the current user's company
   * 
   * Access Control:
   * - SUPER_ADMIN: Returns all users across all companies
   * - ADMIN: Returns users for their company only
   * - STAFF: Forbidden
   */
  @Get()
  async getAllUsers(@Request() req: AuthRequest) {
    if (req.user.role === UserRole.STAFF) {
      throw new ForbiddenException('Staff cannot view user list');
    }

    return this.usersService.getUsersByCompanyId(req.user.companyId);
  }

  /**
   * GET /api/users/:id
   * Get a single user by ID
   */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  /**
   * POST /api/users
   * Create a new user
   * 
   * IMPORTANT: Enforces maxUsers limit from subscription plan
   * 
   * Request body:
   * {
   *   "name": "John Doe",
   *   "email": "john@factory.com",
   *   "password": "SecurePass123",
   *   "role": "STAFF",
   *   "companyId": "company-uuid"
   * }
   * 
   * Access Control:
   * - SUPER_ADMIN: Can create users for any company
   * - ADMIN: Can only create users for their own company (up to maxUsers limit)
   * - STAFF: Forbidden
   * 
   * Error Responses:
   * - 403 Forbidden: User limit reached (maxUsers enforcement)
   * - 409 Conflict: Email already in use
   * - 400 Bad Request: Invalid input
   */
  @Post()
  async createUser(
    @Body() dto: CreateUserDto,
    @Request() req: AuthRequest,
  ) {
    try {
      return await this.usersService.createUser(
        dto,
        req.user.id,
        req.user.role,
      );
    } catch (error) {
      if (error instanceof ForbiddenException) {
        // Re-throw ForbiddenException with proper user message
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: error.message,
            error: 'USER_LIMIT_REACHED',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      throw error;
    }
  }

  /**
   * PUT /api/users/:id
   * Update a user
   * 
   * Access Control:
   * - SUPER_ADMIN: Can update any user
   * - ADMIN: Can only update users in their own company
   * - STAFF: Forbidden
   */
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Request() req: AuthRequest,
  ) {
    return this.usersService.updateUser(
      id,
      dto,
      req.user.role,
    );
  }

  /**
   * DELETE /api/users/:id
   * Delete a user
   * 
   * Access Control:
   * - SUPER_ADMIN: Can delete any user
   * - ADMIN: Can only delete users in their own company
   * - STAFF: Forbidden
   * 
   * Restrictions:
   * - Cannot delete yourself
   * - Cannot delete ADMIN users (only other ADMINs can do that)
   */
  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ) {
    await this.usersService.deleteUser(
      id,
      req.user.id,
      req.user.role,
    );
    return { message: 'User deleted successfully' };
  }

  /**
   * GET /api/users/status/company/:companyId
   * Get company user limit status
   * 
   * Response:
   * {
   *   "companyId": "uuid",
   *   "companyName": "Sample Factory",
   *   "maxUsers": 5,
   *   "currentUsers": 2,
   *   "availableSlots": 3,
   *   "canAddMore": true
   * }
   */
  @Get('status/company/:companyId')
  async getCompanyUserStatus(
    @Param('companyId') companyId: string,
    @Request() req: AuthRequest,
  ) {
    // Authorization check
    if (req.user.role === UserRole.ADMIN && req.user.companyId !== companyId) {
      throw new ForbiddenException(
        'Admins can only view status for their own company',
      );
    }

    return this.usersService.getCompanyUserStatus(companyId);
  }
}
