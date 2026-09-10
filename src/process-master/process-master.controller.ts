import { Controller, Get, Post, Put, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
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
}
