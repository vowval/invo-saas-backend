import { Controller, Get, Post, Put, Body, Param, Query, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { ProcessMasterService } from './process-master.service';
import {
  CreateProcessCategoryDto,
  UpdateProcessCategoryDto,
  ReorderCategoriesDto,
} from './dto/process-category.dto';
import {
  CreateProcessDto,
  UpdateProcessDto,
  DuplicateProcessDto,
  ReorderProcessesDto,
} from './dto/process.dto';

interface UserRequest {
  userId: string;
  factoryId?: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
}

// All endpoints require authentication. Read endpoints (GET) are open to any
// authenticated role so factory admins/staff can browse the process master to
// build production routes. Mutating endpoints that change the *global* master
// data are explicitly restricted to SUPER_ADMIN via method-level @Roles().
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/admin/process-master')
export class ProcessMasterController {
  constructor(private readonly processMasterService: ProcessMasterService) {}

  // ============= CATEGORIES =============

  @Get('categories')
  async getAllCategories() {
    return this.processMasterService.getAllCategories();
  }

  @Get('categories/:id')
  async getCategory(@Param('id') categoryId: string) {
    return this.processMasterService.getCategoryWithProcesses(categoryId);
  }

  @Post('categories')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() dto: CreateProcessCategoryDto) {
    return this.processMasterService.createCategory(dto);
  }

  @Put('categories/:id')
  @Roles(Role.SUPER_ADMIN)
  async updateCategory(
    @Param('id') categoryId: string,
    @Body() dto: UpdateProcessCategoryDto,
  ) {
    return this.processMasterService.updateCategory(categoryId, dto);
  }

  @Put('categories/toggle-active/:id')
  @Roles(Role.SUPER_ADMIN)
  async toggleCategoryActive(@Param('id') categoryId: string) {
    return this.processMasterService.toggleCategoryActive(categoryId);
  }

  @Post('categories/reorder')
  @Roles(Role.SUPER_ADMIN)
  async reorderCategories(@Body() dto: ReorderCategoriesDto) {
    return this.processMasterService.reorderCategories(dto);
  }

  // ============= PROCESSES =============

  @Get('processes')
  async getAllProcesses(
    @Query('categoryId') categoryId?: string,
    @Query('includeInactive') includeInactive?: string,
    @Req() req?: any,
  ) {
    return this.processMasterService.getAllProcesses(
      categoryId,
      includeInactive === 'true',
      this.extractUserContext(req),
    );
  }

  @Get('categories/:categoryId/processes')
  async getProcessesByCategory(
    @Param('categoryId') categoryId: string,
    @Query('includeInactive') includeInactive?: string,
    @Req() req?: any,
  ) {
    return this.processMasterService.getProcessesByCategory(
      categoryId,
      includeInactive === 'true',
      this.extractUserContext(req),
    );
  }

  @Post('processes')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createProcess(@Body() dto: CreateProcessDto) {
    return this.processMasterService.createProcess(dto);
  }

  @Put('processes/:id')
  @Roles(Role.SUPER_ADMIN)
  async updateProcess(@Param('id') processId: string, @Body() dto: UpdateProcessDto) {
    return this.processMasterService.updateProcess(processId, dto);
  }

  @Put('processes/toggle-active/:id')
  @Roles(Role.SUPER_ADMIN)
  async toggleProcessActive(@Param('id') processId: string) {
    return this.processMasterService.toggleProcessActive(processId);
  }

  @Post('processes/:id/duplicate')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async duplicateProcess(
    @Param('id') processId: string,
    @Body() dto: DuplicateProcessDto,
  ) {
    return this.processMasterService.duplicateProcess(processId, dto);
  }

  @Post('processes/reorder')
  @Roles(Role.SUPER_ADMIN)
  async reorderProcesses(@Body() dto: ReorderProcessesDto) {
    return this.processMasterService.reorderProcesses(dto);
  }

  // ============= SEARCH =============

  @Get('search')
  async searchProcesses(
    @Query('q') query: string,
    @Query('categoryId') categoryId?: string,
    @Query('activeOnly') activeOnly?: string,
    @Req() req?: any,
  ) {
    return this.processMasterService.searchProcesses(
      query,
      categoryId,
      activeOnly !== 'false',
      this.extractUserContext(req),
    );
  }

  // ============= FACTORY ADMIN ENDPOINTS =============

  /**
   * Clone a global process for factory customization
   * POST /api/admin/process-master/processes/:processId/clone?factoryId=<factory-id>
   * 
   * Only factory admins can use this endpoint
   */
  @Post('processes/:processId/clone')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async cloneProcessForFactory(
    @Param('processId') processId: string,
    @Query('factoryId') factoryId: string,
    @Req() req: any,
  ) {
    const user = this.extractUserContext(req);
    return this.processMasterService.cloneProcessForFactory(processId, factoryId, user);
  }

  /**
   * Helper to extract user context from request
   * Parses JWT token from authenticated request
   */
  private extractUserContext(req: any): UserRequest {
    // Extract from authenticated JWT payload
    return {
      userId: req.user?.id || req.user?.userId,
      factoryId: req.user?.companyId || req.user?.factoryId || null,
      role: req.user?.role || 'STAFF',
    };
  }
}
