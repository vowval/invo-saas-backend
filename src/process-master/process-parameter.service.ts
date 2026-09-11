import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessParameter } from './entities/process-parameter.entity';
import { Process } from './entities/process.entity';
import {
  CreateProcessParameterDto,
  UpdateProcessParameterDto,
  ReorderProcessParametersDto,
} from './dto/process-parameter.dto';

interface UserContext {
  userId: string;
  factoryId?: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
}

@Injectable()
export class ProcessParameterService {
  constructor(
    @InjectRepository(ProcessParameter)
    private parameterRepository: Repository<ProcessParameter>,
    @InjectRepository(Process)
    private processRepository: Repository<Process>,
  ) {}

  /**
   * Check if user has access to a parameter
   * Super-admin can access factory_id=null (global)
   * Factory-admin can access their factory_id or factory_id=null (inherited from global)
   */
  private canAccessParameter(parameter: ProcessParameter, user: UserContext): boolean {
    if (user.role === 'SUPER_ADMIN') {
      // Super admin can only access global parameters (factory_id = null)
      return parameter.factory_id === null;
    }

    // Factory admin/user can access their own factory's parameters or global parameters
    if (user.factoryId) {
      return parameter.factory_id === null || parameter.factory_id === user.factoryId;
    }

    return false;
  }

  /**
   * Check if user can modify a parameter
   * Only the owner factory can modify (not global parameters)
   */
  private canModifyParameter(parameter: ProcessParameter, user: UserContext): boolean {
    if (user.role === 'SUPER_ADMIN') {
      // Super admin can only modify global parameters
      return parameter.factory_id === null;
    }

    // Factory admin can only modify their own factory's custom parameters
    if (user.factoryId) {
      return parameter.factory_id === user.factoryId;
    }

    return false;
  }

  async getParametersForProcess(processId: string, user?: UserContext) {
    const process = await this.processRepository.findOne({ where: { id: processId } });

    if (!process) {
      throw new NotFoundException(`Process with ID ${processId} not found`);
    }

    // Build where clause based on user access
    let whereClause: any = { process_id: processId };

    if (user) {
      if (user.role === 'SUPER_ADMIN') {
        // Super admin sees only global parameters
        whereClause.factory_id = null;
      } else if (user.factoryId) {
        // Factory admin/user sees global parameters + their factory's parameters
        whereClause = [
          { process_id: processId, factory_id: null },
          { process_id: processId, factory_id: user.factoryId },
        ];
      }
    }

    return this.parameterRepository.find({
      where: whereClause,
      order: { display_order: 'ASC', parameter_name: 'ASC' },
    });
  }

  async createParameter(dto: CreateProcessParameterDto, user: UserContext) {
    // Verify process exists
    const process = await this.processRepository.findOne({
      where: { id: dto.process_id },
    });

    if (!process) {
      throw new NotFoundException(`Process with ID ${dto.process_id} not found`);
    }

    // Determine factory_id based on user role
    let factoryId = null;
    if (user.role === 'ADMIN' || user.role === 'STAFF') {
      if (!user.factoryId) {
        throw new ForbiddenException('Factory ID required for factory admin');
      }
      factoryId = user.factoryId;
    } else if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Insufficient permissions to create parameters');
    }

    // Check if parameter code already exists for this process + factory combination
    const existing = await this.parameterRepository.findOne({
      where: {
        process_id: dto.process_id,
        parameter_code: dto.parameter_code,
        factory_id: factoryId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Parameter code "${dto.parameter_code}" already exists for this process`,
      );
    }

    const parameter = this.parameterRepository.create({
      ...dto,
      factory_id: factoryId,
      display_order: dto.display_order ?? 999,
    });

    return this.parameterRepository.save(parameter);
  }

  async updateParameter(parameterId: string, dto: UpdateProcessParameterDto, user: UserContext) {
    const parameter = await this.parameterRepository.findOne({
      where: { id: parameterId },
    });

    if (!parameter) {
      throw new NotFoundException(`Parameter with ID ${parameterId} not found`);
    }

    // Check access
    if (!this.canModifyParameter(parameter, user)) {
      throw new ForbiddenException('You cannot modify this parameter');
    }

    if (dto.parameter_name) {
      parameter.parameter_name = dto.parameter_name;
    }
    if (dto.data_type) {
      parameter.data_type = dto.data_type;
    }
    if (dto.unit !== undefined) {
      parameter.unit = dto.unit;
    }
    if (dto.is_required !== undefined) {
      parameter.is_required = dto.is_required;
    }
    if (dto.display_order !== undefined) {
      parameter.display_order = dto.display_order;
    }
    if (dto.default_value !== undefined) {
      parameter.default_value = dto.default_value;
    }
    if (dto.min_value !== undefined) {
      parameter.min_value = dto.min_value;
    }
    if (dto.max_value !== undefined) {
      parameter.max_value = dto.max_value;
    }
    if (dto.allowed_values !== undefined) {
      parameter.allowed_values = dto.allowed_values;
    }
    if (dto.help_text !== undefined) {
      parameter.help_text = dto.help_text;
    }

    return this.parameterRepository.save(parameter);
  }

  async deleteParameter(parameterId: string, user: UserContext) {
    const parameter = await this.parameterRepository.findOne({
      where: { id: parameterId },
    });

    if (!parameter) {
      throw new NotFoundException(`Parameter with ID ${parameterId} not found`);
    }

    // Check access
    if (!this.canModifyParameter(parameter, user)) {
      throw new ForbiddenException('You cannot delete this parameter');
    }

    await this.parameterRepository.remove(parameter);
    return { success: true, id: parameterId };
  }

  async reorderParameters(dto: ReorderProcessParametersDto, user: UserContext) {
    // Verify user can modify all parameters
    for (const param of dto.parameters) {
      const parameter = await this.parameterRepository.findOne({ where: { id: param.id } });
      if (parameter && !this.canModifyParameter(parameter, user)) {
        throw new ForbiddenException('You cannot modify one or more parameters');
      }
    }

    await Promise.all(
      dto.parameters.map((param) =>
        this.parameterRepository.update(param.id, { display_order: param.display_order }),
      ),
    );

    // Return updated parameters (need to get process_id from one of them)
    if (dto.parameters.length > 0) {
      const firstParam = await this.parameterRepository.findOne({
        where: { id: dto.parameters[0].id },
      });
      if (firstParam) {
        return this.getParametersForProcess(firstParam.process_id, user);
      }
    }

    return [];
  }

  async getParameter(parameterId: string, user?: UserContext) {
    const parameter = await this.parameterRepository.findOne({
      where: { id: parameterId },
      relations: ['process'],
    });

    if (!parameter) {
      throw new NotFoundException(`Parameter with ID ${parameterId} not found`);
    }

    // Check access if user context provided
    if (user && !this.canAccessParameter(parameter, user)) {
      throw new ForbiddenException('You cannot access this parameter');
    }

    return parameter;
  }

  async bulkCreateParameters(processId: string, parameters: CreateProcessParameterDto[], user: UserContext) {
    // Verify process exists
    const process = await this.processRepository.findOne({
      where: { id: processId },
    });

    if (!process) {
      throw new NotFoundException(`Process with ID ${processId} not found`);
    }

    // Determine factory_id based on user role
    let factoryId = null;
    if (user.role === 'ADMIN' || user.role === 'STAFF') {
      if (!user.factoryId) {
        throw new ForbiddenException('Factory ID required for factory admin');
      }
      factoryId = user.factoryId;
    } else if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Insufficient permissions to create parameters');
    }

    // Create all parameters
    const createdParams = [];
    for (const param of parameters) {
      const newParam = this.parameterRepository.create({
        ...param,
        process_id: processId,
        factory_id: factoryId,
        display_order: param.display_order ?? createdParams.length,
      });
      createdParams.push(await this.parameterRepository.save(newParam));
    }

    return createdParams;
  }

  /**
   * Clone parameters from a global process to a factory-specific process
   * Used when factory clones a process for customization
   */
  async cloneParametersForFactory(globalProcessId: string, newProcessId: string, factoryId: string) {
    const globalParameters = await this.parameterRepository.find({
      where: { process_id: globalProcessId, factory_id: null },
    });

    const clonedParams = [];
    for (const param of globalParameters) {
      const cloned = this.parameterRepository.create({
        ...param,
        id: undefined, // TypeORM will generate new ID
        process_id: newProcessId,
        factory_id: factoryId,
      });
      clonedParams.push(await this.parameterRepository.save(cloned));
    }

    return clonedParams;
  }
}
