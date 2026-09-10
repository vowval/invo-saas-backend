import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ProcessParameterService } from './process-parameter.service';
import {
  CreateProcessParameterDto,
  UpdateProcessParameterDto,
  ReorderProcessParametersDto,
} from './dto/process-parameter.dto';

// TODO: Implement proper JWT guard
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface UserRequest {
  userId: string;
  factoryId?: string | null;
  role: 'super-admin' | 'factory-admin' | 'factory-user';
}

// Super Admin endpoint prefix: /api/admin/process-master/parameters
@Controller('api/admin/process-master/parameters')
export class ProcessParameterController {
  constructor(private readonly parameterService: ProcessParameterService) {}

  /**
   * Get all parameters for a process
   * Super admin: only global parameters
   * Factory admin: global + their factory's parameters
   */
  @Get('process/:processId')
  // @UseGuards(JwtAuthGuard)
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
  // @UseGuards(JwtAuthGuard)
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
  // @UseGuards(JwtAuthGuard)
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
  // @UseGuards(JwtAuthGuard)
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
  // @UseGuards(JwtAuthGuard)
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
  // @UseGuards(JwtAuthGuard)
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
  // @UseGuards(JwtAuthGuard)
  async bulkCreateParameters(
    @Param('processId') processId: string,
    @Body() body: { parameters: CreateProcessParameterDto[] },
    @Req() req: any,
  ) {
    const user = this.extractUserContext(req);
    return this.parameterService.bulkCreateParameters(processId, body.parameters, user);
  }

  /**
   * Helper to extract user context from request
   * TODO: Replace with actual JWT token parsing when authentication is implemented
   */
  private extractUserContext(req: any): UserRequest {
    // For now, return a mock super-admin context
    // In production, this should parse the JWT token and extract real user data
    return {
      userId: req.user?.id || 'mock-user-id',
      factoryId: req.user?.factoryId || null,
      role: req.user?.role || 'super-admin',
    };
  }
}
