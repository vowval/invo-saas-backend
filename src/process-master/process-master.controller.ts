import { Controller, Get, Post, Put, Body, Param, Query, HttpCode, HttpStatus, Req } from '@nestjs/common';
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

// TODO: Implement proper JWT guard
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface UserRequest {
  userId: string;
  factoryId?: string | null;
  role: 'super-admin' | 'factory-admin' | 'factory-user';
}

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
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() dto: CreateProcessCategoryDto) {
    return this.processMasterService.createCategory(dto);
  }

  @Put('categories/:id')
  async updateCategory(
    @Param('id') categoryId: string,
    @Body() dto: UpdateProcessCategoryDto,
  ) {
    return this.processMasterService.updateCategory(categoryId, dto);
  }

  @Put('categories/toggle-active/:id')
  async toggleCategoryActive(@Param('id') categoryId: string) {
    return this.processMasterService.toggleCategoryActive(categoryId);
  }

  @Post('categories/reorder')
  async reorderCategories(@Body() dto: ReorderCategoriesDto) {
    return this.processMasterService.reorderCategories(dto);
  }

  // ============= PROCESSES =============

  @Get('processes')
  async getAllProcesses(
    @Query('categoryId') categoryId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.processMasterService.getAllProcesses(
      categoryId,
      includeInactive === 'true',
    );
  }

  @Get('categories/:categoryId/processes')
  async getProcessesByCategory(
    @Param('categoryId') categoryId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.processMasterService.getProcessesByCategory(
      categoryId,
      includeInactive === 'true',
    );
  }

  @Post('processes')
  @HttpCode(HttpStatus.CREATED)
  async createProcess(@Body() dto: CreateProcessDto) {
    return this.processMasterService.createProcess(dto);
  }

  @Put('processes/:id')
  async updateProcess(@Param('id') processId: string, @Body() dto: UpdateProcessDto) {
    return this.processMasterService.updateProcess(processId, dto);
  }

  @Put('processes/toggle-active/:id')
  async toggleProcessActive(@Param('id') processId: string) {
    return this.processMasterService.toggleProcessActive(processId);
  }

  @Post('processes/:id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  async duplicateProcess(
    @Param('id') processId: string,
    @Body() dto: DuplicateProcessDto,
  ) {
    return this.processMasterService.duplicateProcess(processId, dto);
  }

  @Post('processes/reorder')
  async reorderProcesses(@Body() dto: ReorderProcessesDto) {
    return this.processMasterService.reorderProcesses(dto);
  }

  // ============= SEARCH =============

  @Get('search')
  async searchProcesses(
    @Query('q') query: string,
    @Query('categoryId') categoryId?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.processMasterService.searchProcesses(
      query,
      categoryId,
      activeOnly !== 'false',
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
  @HttpCode(HttpStatus.CREATED)
  // @UseGuards(JwtAuthGuard)
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
