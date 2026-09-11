import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProcessParameterService } from './process-parameter.service';
import {
  CreateProcessParameterDto,
  UpdateProcessParameterDto,
  ReorderProcessParametersDto,
} from './dto/process-parameter.dto';

interface UserRequest {
  userId: string;
  factoryId?: string | null;
  role: 'super-admin' | 'factory-admin' | 'factory-user';
}

// Super Admin endpoint prefix: /api/admin/process-master/parameters
@Controller('api/admin/process-master/parameters')
@UseGuards(JwtAuthGuard)
export class ProcessParameterController {
  constructor(private readonly parameterService: ProcessParameterService) {}

  /**
   * Get all parameters for a process
   * Super admin: only global parameters
   * Factory admin: global + their factory's parameters
   */
  @Get('process/:processId')
  async getParametersForProcess(
    @Param('processId') processId: string,
    @Req() req: any,
  ) {
    const user = this.extractUserContext(req);
    return this.parameterService.getParametersForProcess(processId, user);
  }

  /**
   * Get a single parameter by ID
   */
  @Get(':id')
  async getParameter(
    @Param('id') parameterId: string,
    @Req() req: any,
  ) {
    const user = this.extractUserContext(req);
    return this.parameterService.getParameter(parameterId, user);
  }

  /**
   * Create a new parameter for a process
   * Super admin creates global parameters (factory_id = null)
   * Factory admin creates factory-specific parameters (factory_id = their factory)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createParameter(
    @Body() dto: CreateProcessParameterDto,
    @Req() req: any,
  ) {
    const user = this.extractUserContext(req);
    return this.parameterService.createParameter(dto, user);
  }

  /**
   * Update a parameter
   * Can only modify parameters owned by the user's role
   */
  @Put(':id')
  async updateParameter(
    @Param('id') parameterId: string,
    @Body() dto: UpdateProcessParameterDto,
    @Req() req: any,
  ) {
    const user = this.extractUserContext(req);
    return this.parameterService.updateParameter(parameterId, dto, user);
  }

  /**
   * Delete a parameter
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteParameter(
    @Param('id') parameterId: string,
    @Req() req: any,
  ) {
    const user = this.extractUserContext(req);
    return this.parameterService.deleteParameter(parameterId, user);
  }

  /**
   * Reorder parameters for a process
   */
  @Post('reorder')
  async reorderParameters(
    @Body() dto: ReorderProcessParametersDto,
    @Req() req: any,
  ) {
    const user = this.extractUserContext(req);
    return this.parameterService.reorderParameters(dto, user);
  }

  /**
   * Bulk create parameters for a process
   */
  @Post('process/:processId/bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreateParameters(
    @Param('processId') processId: string,
    @Body() body: { parameters: CreateProcessParameterDto[] },
    @Req() req: any,
  ) {
    const user = this.extractUserContext(req);
    return this.parameterService.bulkCreateParameters(processId, body.parameters, user);
  }

  /**
   * Extract user context from authenticated JWT token
   * Requires JwtAuthGuard to be applied
   */
  private extractUserContext(req: any): UserRequest {
    if (!req.user) {
      throw new ForbiddenException('User context not found in request');
    }

    return {
      userId: req.user.id || req.user.userId,
      factoryId: req.user.factoryId || req.user.companyId || null,
      role: req.user.role || 'factory-user',
    };
  }
}
