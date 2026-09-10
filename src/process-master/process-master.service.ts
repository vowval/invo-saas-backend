import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessCategory } from './entities/process-category.entity';
import { Process } from './entities/process.entity';
import { ProcessParameterService } from './process-parameter.service';
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

interface UserContext {
  userId: string;
  factoryId?: string | null;
  role: 'super-admin' | 'factory-admin' | 'factory-user';
}

@Injectable()
export class ProcessMasterService {
  constructor(
    @InjectRepository(ProcessCategory)
    private categoryRepository: Repository<ProcessCategory>,
    @InjectRepository(Process)
    private processRepository: Repository<Process>,
    private parameterService: ProcessParameterService,
  ) {}

  // ============= PROCESS CATEGORIES =============

  async getAllCategories() {
    return this.categoryRepository.find({
      relations: ['processes'],
      order: { display_order: 'ASC', name: 'ASC' },
    });
  }

  async getCategoryWithProcesses(categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['processes'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Sort processes by display_order
    category.processes.sort((a, b) => a.display_order - b.display_order);
    return category;
  }

  async createCategory(dto: CreateProcessCategoryDto) {
    // Check if code already exists
    const existing = await this.categoryRepository.findOne({
      where: { code: dto.code },
    });

    if (existing) {
      throw new BadRequestException(`Category code "${dto.code}" already exists`);
    }

    const category = this.categoryRepository.create({
      ...dto,
      display_order: dto.display_order ?? 999,
    });

    return this.categoryRepository.save(category);
  }

  async updateCategory(categoryId: string, dto: UpdateProcessCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    if (dto.name) {
      category.name = dto.name;
    }
    if (dto.description !== undefined) {
      category.description = dto.description;
    }
    if (dto.is_active !== undefined) {
      category.is_active = dto.is_active;
    }
    if (dto.display_order !== undefined) {
      category.display_order = dto.display_order;
    }

    return this.categoryRepository.save(category);
  }

  async reorderCategories(dto: ReorderCategoriesDto) {
    await Promise.all(
      dto.categories.map((cat) =>
        this.categoryRepository.update(cat.id, { display_order: cat.display_order }),
      ),
    );

    return this.getAllCategories();
  }

  async toggleCategoryActive(categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    category.is_active = !category.is_active;
    return this.categoryRepository.save(category);
  }

  // ============= PROCESSES =============

  async getAllProcesses(categoryId?: string, includeInactive: boolean = false) {
    const query = this.processRepository.createQueryBuilder('process')
      .leftJoinAndSelect('process.category', 'category');

    if (categoryId) {
      query.where('process.category_id = :categoryId', { categoryId });
    }

    if (!includeInactive) {
      query.andWhere('process.is_active = :isActive', { isActive: true });
    }

    query.orderBy('process.display_order', 'ASC');
    query.addOrderBy('process.name', 'ASC');

    return query.getMany();
  }

  async getProcessesByCategory(categoryId: string, includeInactive: boolean = false) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const query = this.processRepository.createQueryBuilder('process')
      .where('process.category_id = :categoryId', { categoryId });

    if (!includeInactive) {
      query.andWhere('process.is_active = :isActive', { isActive: true });
    }

    query.orderBy('process.display_order', 'ASC');
    query.addOrderBy('process.name', 'ASC');

    return query.getMany();
  }

  async createProcess(dto: CreateProcessDto) {
    // Verify category exists
    const category = await this.categoryRepository.findOne({
      where: { id: dto.category_id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${dto.category_id} not found`);
    }

    // Check if process_code already exists
    const existing = await this.processRepository.findOne({
      where: { process_code: dto.process_code },
    });

    if (existing) {
      throw new BadRequestException(`Process code "${dto.process_code}" already exists`);
    }

    const process = this.processRepository.create({
      ...dto,
      display_order: dto.display_order ?? 999,
    });

    return this.processRepository.save(process);
  }

  async updateProcess(processId: string, dto: UpdateProcessDto) {
    const process = await this.processRepository.findOne({
      where: { id: processId },
      relations: ['category'],
    });

    if (!process) {
      throw new NotFoundException(`Process with ID ${processId} not found`);
    }

    // Cannot deactivate if it has executions
    if (dto.is_active === false && process.has_executions) {
      throw new BadRequestException(
        'Cannot deactivate a process that has already been used in production. Use soft deletion (deactivation) instead.',
      );
    }

    if (dto.name) {
      process.name = dto.name;
    }
    if (dto.description !== undefined) {
      process.description = dto.description;
    }
    if (dto.process_family) {
      process.process_family = dto.process_family;
    }
    if (dto.process_type) {
      process.process_type = dto.process_type;
    }
    if (dto.is_active !== undefined) {
      process.is_active = dto.is_active;
    }
    if (dto.display_order !== undefined) {
      process.display_order = dto.display_order;
    }

    return this.processRepository.save(process);
  }

  async toggleProcessActive(processId: string) {
    const process = await this.processRepository.findOne({
      where: { id: processId },
    });

    if (!process) {
      throw new NotFoundException(`Process with ID ${processId} not found`);
    }

    // Cannot deactivate if it has executions
    if (!process.is_active === false && process.has_executions) {
      throw new BadRequestException(
        'Cannot deactivate a process that has already been used in production.',
      );
    }

    process.is_active = !process.is_active;
    return this.processRepository.save(process);
  }

  async duplicateProcess(processId: string, dto: DuplicateProcessDto) {
    const originalProcess = await this.processRepository.findOne({
      where: { id: processId },
    });

    if (!originalProcess) {
      throw new NotFoundException(`Process with ID ${processId} not found`);
    }

    // Check if new code already exists
    const existing = await this.processRepository.findOne({
      where: { process_code: dto.new_process_code },
    });

    if (existing) {
      throw new BadRequestException(`Process code "${dto.new_process_code}" already exists`);
    }

    const newProcess = this.processRepository.create({
      category_id: originalProcess.category_id,
      name: dto.new_name,
      process_code: dto.new_process_code,
      description: originalProcess.description,
      process_family: originalProcess.process_family,
      process_type: originalProcess.process_type,
      is_active: true,
      is_system_default: false,
      has_executions: false,
      display_order: 999,
    });

    return this.processRepository.save(newProcess);
  }

  async reorderProcesses(dto: ReorderProcessesDto) {
    await Promise.all(
      dto.processes.map((proc) =>
        this.processRepository.update(proc.id, { display_order: proc.display_order }),
      ),
    );

    return this.getAllProcesses(undefined, true);
  }

  async markProcessAsUsed(processId: string) {
    const process = await this.processRepository.findOne({
      where: { id: processId },
    });

    if (!process) {
      throw new NotFoundException(`Process with ID ${processId} not found`);
    }

    process.has_executions = true;
    return this.processRepository.save(process);
  }

  // ============= SEARCH & FILTER =============

  async searchProcesses(query: string, categoryId?: string, activeOnly: boolean = true) {
    const qb = this.processRepository.createQueryBuilder('process')
      .leftJoinAndSelect('process.category', 'category');

    if (query) {
      qb.where(
        '(process.name ILIKE :query OR process.process_code ILIKE :query OR process.description ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    if (categoryId) {
      qb.andWhere('process.category_id = :categoryId', { categoryId });
    }

    if (activeOnly) {
      qb.andWhere('process.is_active = :isActive', { isActive: true });
    }

    qb.orderBy('process.display_order', 'ASC');
    qb.addOrderBy('process.name', 'ASC');

    return qb.getMany();
  }

  // ============= PROCESS CLONING =============

  /**
   * Clone a global process for factory customization
   * 
   * When a factory wants to customize a process, they clone it.
   * The cloned process:
   * - Has factory_id set to the factory's ID
   * - Has cloned_from_process_id pointing to the global process
   * - Auto-inherits all global process parameters
   * - Can then customize/override parameters
   */
  async cloneProcessForFactory(
    globalProcessId: string,
    factoryId: string,
    user: UserContext,
  ) {
    // Only factory admins can clone processes for their factory
    if (user.role !== 'factory-admin') {
      throw new ForbiddenException('Only factory admins can clone processes');
    }

    if (!user.factoryId || user.factoryId !== factoryId) {
      throw new ForbiddenException('You can only clone processes for your own factory');
    }

    // Get the global process
    const globalProcess = await this.processRepository.findOne({
      where: { id: globalProcessId, factory_id: null },
    });

    if (!globalProcess) {
      throw new NotFoundException(`Global process with ID ${globalProcessId} not found`);
    }

    // Check if factory already has a clone of this process
    const existingClone = await this.processRepository.findOne({
      where: {
        cloned_from_process_id: globalProcessId,
        factory_id: factoryId,
      },
    });

    if (existingClone) {
      throw new BadRequestException(
        `Your factory already has a clone of this process (${existingClone.process_code})`,
      );
    }

    // Create a new factory-specific process
    const clonedProcess = this.processRepository.create({
      category_id: globalProcess.category_id,
      name: `${globalProcess.name} (${factoryId.substring(0, 8)})`,
      process_code: `${globalProcess.process_code}-${Date.now().toString().slice(-4)}`,
      description: `Customized clone of ${globalProcess.name}`,
      process_family: globalProcess.process_family,
      process_type: globalProcess.process_type,
      is_active: true,
      is_system_default: false,
      display_order: globalProcess.display_order,
      factory_id: factoryId,
      cloned_from_process_id: globalProcessId,
    });

    const savedProcess = await this.processRepository.save(clonedProcess);

    // Auto-clone all parameters from the global process
    await this.parameterService.cloneParametersForFactory(
      globalProcessId,
      savedProcess.id,
      factoryId,
    );

    return {
      process: savedProcess,
      message: `Process cloned successfully. You can now customize the parameters.`,
    };
  }
}
