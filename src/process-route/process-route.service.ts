import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessRoute, ProcessRouteStatus } from './process-route.entity';
import { ProcessRouteStep, StepStatus } from './process-route-step.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { Process } from '../process-master/entities/process.entity';

interface CreateRouteStepDto {
  processId: string;
  sequence: number;
  isMandatory?: boolean;
  requiresQcBefore?: boolean;
  recipeId?: string;
  machineGroupId?: string;
  instructions?: string;
  expectedQuantity?: number;
  expectedCompletionDate?: Date;
}

interface CreateRouteDto {
  routeName: string;
  templateName?: string;
  steps: CreateRouteStepDto[];
}

@Injectable()
export class ProcessRouteService {
  constructor(
    @InjectRepository(ProcessRoute)
    private readonly routeRepo: Repository<ProcessRoute>,
    @InjectRepository(ProcessRouteStep)
    private readonly stepRepo: Repository<ProcessRouteStep>,
    @InjectRepository(DyeingJob)
    private readonly jobRepo: Repository<DyeingJob>,
    @InjectRepository(Process)
    private readonly processRepo: Repository<Process>,
  ) {}

  async createRoute(jobId: string, data: CreateRouteDto, companyId: string) {
    const job = await this.jobRepo.findOne({
      where: { id: jobId, company: { id: companyId } },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if route already exists for this job
    const existingRoute = await this.routeRepo.findOne({
      where: { job: { id: jobId } },
    });

    if (existingRoute && existingRoute.lockedAt) {
      throw new BadRequestException('Route is locked and cannot be modified');
    }

    const route = this.routeRepo.create({
      job,
      routeName: data.routeName,
      templateName: data.templateName,
      status: ProcessRouteStatus.PENDING,
      company: { id: companyId },
    });

    const savedRoute = await this.routeRepo.save(route);

    // Create steps
    for (const stepData of data.steps) {
      const process = await this.processRepo.findOne({
        where: { id: stepData.processId },
      });

      if (!process) {
        throw new NotFoundException(`Process ${stepData.processId} not found`);
      }

      const step = this.stepRepo.create({
        route: savedRoute,
        process,
        sequence: stepData.sequence,
        isMandatory: stepData.isMandatory ?? true,
        requiresQcBefore: stepData.requiresQcBefore ?? false,
        recipeId: stepData.recipeId,
        machineGroupId: stepData.machineGroupId,
        instructions: stepData.instructions,
        expectedQuantity: stepData.expectedQuantity,
        expectedCompletionDate: stepData.expectedCompletionDate,
        status: StepStatus.PENDING,
      });

      await this.stepRepo.save(step);
    }

    return this.getRouteById(savedRoute.id, companyId);
  }

  async getRouteById(routeId: string, companyId: string) {
    const route = await this.routeRepo.findOne({
      where: { id: routeId, company: { id: companyId } },
      relations: ['steps', 'steps.process', 'job'],
      order: { steps: { sequence: 'ASC' } },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async getJobRoute(jobId: string, companyId: string) {
    const route = await this.routeRepo.findOne({
      where: { job: { id: jobId }, company: { id: companyId } },
      relations: ['steps', 'steps.process'],
      order: { steps: { sequence: 'ASC' } },
    });

    return route;
  }

  async addStep(
    routeId: string,
    stepData: CreateRouteStepDto,
    companyId: string,
  ) {
    const route = await this.routeRepo.findOne({
      where: { id: routeId, company: { id: companyId } },
      relations: ['steps'],
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    if (route.lockedAt) {
      throw new BadRequestException('Route is locked and cannot be modified');
    }

    const process = await this.processRepo.findOne({
      where: { id: stepData.processId },
    });

    if (!process) {
      throw new NotFoundException('Process not found');
    }

    // Check if sequence already exists
    const existingStep = await this.stepRepo.findOne({
      where: { route: { id: routeId }, sequence: stepData.sequence },
    });

    if (existingStep) {
      throw new BadRequestException('Sequence already exists for this step');
    }

    const step = this.stepRepo.create({
      route,
      process,
      sequence: stepData.sequence,
      isMandatory: stepData.isMandatory ?? true,
      requiresQcBefore: stepData.requiresQcBefore ?? false,
      recipeId: stepData.recipeId,
      machineGroupId: stepData.machineGroupId,
      instructions: stepData.instructions,
      expectedQuantity: stepData.expectedQuantity,
      expectedCompletionDate: stepData.expectedCompletionDate,
      status: StepStatus.PENDING,
    });

    return this.stepRepo.save(step);
  }

  async removeStep(stepId: string, companyId: string) {
    const step = await this.stepRepo.findOne({
      where: { id: stepId },
      relations: ['route', 'route.company'],
    });

    if (!step) {
      throw new NotFoundException('Step not found');
    }

    if (step.route.company.id !== companyId) {
      throw new BadRequestException('Unauthorized');
    }

    if (step.route.lockedAt) {
      throw new BadRequestException('Route is locked');
    }

    await this.stepRepo.remove(step);

    return { success: true };
  }

  async reorderSteps(routeId: string, stepsOrder: { id: string; sequence: number }[], companyId: string) {
    const route = await this.routeRepo.findOne({
      where: { id: routeId, company: { id: companyId } },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    if (route.lockedAt) {
      throw new BadRequestException('Route is locked');
    }

    for (const order of stepsOrder) {
      await this.stepRepo.update(
        { id: order.id },
        { sequence: order.sequence },
      );
    }

    return this.getRouteById(routeId, companyId);
  }

  async updateStep(
    stepId: string,
    data: Partial<CreateRouteStepDto>,
    companyId: string,
  ) {
    const step = await this.stepRepo.findOne({
      where: { id: stepId },
      relations: ['route', 'route.company'],
    });

    if (!step) {
      throw new NotFoundException('Step not found');
    }

    if (step.route.company.id !== companyId) {
      throw new BadRequestException('Unauthorized');
    }

    if (step.route.lockedAt && step.status === StepStatus.PENDING) {
      throw new BadRequestException('Cannot modify steps in locked route');
    }

    // Only allow minor updates on locked routes
    if (step.route.lockedAt) {
      // Only allow status and actual data updates
      step.status = data as any; // This should be refined
      step.actualQuantity = data.expectedQuantity;
    } else {
      // Allow full updates on unlocked routes
      step.isMandatory = data.isMandatory ?? step.isMandatory;
      step.requiresQcBefore = data.requiresQcBefore ?? step.requiresQcBefore;
      step.recipeId = data.recipeId ?? step.recipeId;
      step.machineGroupId = data.machineGroupId ?? step.machineGroupId;
      step.instructions = data.instructions ?? step.instructions;
      step.expectedQuantity = data.expectedQuantity ?? step.expectedQuantity;
      step.expectedCompletionDate = data.expectedCompletionDate ?? step.expectedCompletionDate;
    }

    return this.stepRepo.save(step);
  }

  async lockRoute(routeId: string, companyId: string) {
    const route = await this.routeRepo.findOne({
      where: { id: routeId, company: { id: companyId } },
      relations: ['steps'],
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    if (route.steps.length === 0) {
      throw new BadRequestException('Route must have at least one step');
    }

    route.lockedAt = new Date();
    route.status = ProcessRouteStatus.READY;

    // Set first step to READY
    const firstStep = route.steps.find((s) => s.sequence === 1);
    if (firstStep) {
      firstStep.status = StepStatus.READY;
      await this.stepRepo.save(firstStep);
    }

    return this.routeRepo.save(route);
  }

  async completeStep(stepId: string, actualQuantity: number, companyId: string) {
    const step = await this.stepRepo.findOne({
      where: { id: stepId },
      relations: ['route', 'route.steps', 'route.company'],
    });

    if (!step) {
      throw new NotFoundException('Step not found');
    }

    if (step.route.company.id !== companyId) {
      throw new BadRequestException('Unauthorized');
    }

    if (step.status !== StepStatus.IN_PROGRESS && step.status !== StepStatus.READY) {
      throw new BadRequestException('Step is not in a valid state to complete');
    }

    step.status = StepStatus.COMPLETED;
    step.actualQuantity = actualQuantity;
    step.actualCompletionDate = new Date();

    await this.stepRepo.save(step);

    // Unlock next step
    const nextStep = step.route.steps.find((s) => s.sequence === step.sequence + 1);
    if (nextStep) {
      nextStep.status = StepStatus.READY;
      await this.stepRepo.save(nextStep);
    }

    return this.getRouteById(step.route.id, companyId);
  }

  async startStep(stepId: string, companyId: string) {
    const step = await this.stepRepo.findOne({
      where: { id: stepId },
      relations: ['route', 'route.company'],
    });

    if (!step) {
      throw new NotFoundException('Step not found');
    }

    if (step.route.company.id !== companyId) {
      throw new BadRequestException('Unauthorized');
    }

    if (step.status !== StepStatus.READY) {
      throw new BadRequestException('Step is not ready to start');
    }

    step.status = StepStatus.IN_PROGRESS;
    step.actualStartDate = new Date();

    if (step.route.status !== ProcessRouteStatus.IN_PROGRESS) {
      step.route.status = ProcessRouteStatus.IN_PROGRESS;
      await this.routeRepo.save(step.route);
    }

    return this.stepRepo.save(step);
  }

  async getRouteTimeline(routeId: string, companyId: string) {
    const route = await this.getRouteById(routeId, companyId);

    const timeline = route.steps.map((step) => ({
      id: step.id,
      sequence: step.sequence,
      processName: step.process.name,
      processCode: (step.process as any).process_code,
      status: step.status,
      isMandatory: step.isMandatory,
      expectedCompletionDate: step.expectedCompletionDate,
      actualStartDate: step.actualStartDate,
      actualCompletionDate: step.actualCompletionDate,
    }));

    return timeline;
  }
}
