import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReprocessCycle } from './reprocess-cycle.entity';
import { ProcessRouteStep } from '../process-route/process-route-step.entity';

export enum ReprocessStepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity('reprocess_step_history')
export class ReprocessStepHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ReprocessCycle, (cycle) => cycle.stepHistory, {
    onDelete: 'CASCADE',
  })
  cycle: ReprocessCycle;

  @ManyToOne(() => ProcessRouteStep, { onDelete: 'SET NULL', nullable: true })
  originalRouteStep: ProcessRouteStep | null;

  @ManyToOne(() => ProcessRouteStep, { onDelete: 'SET NULL', nullable: true })
  reprocessRouteStep: ProcessRouteStep | null;

  @Column()
  processType: string; // e.g., "Reactive Dyeing", "Washing", etc.

  @Column()
  stepOrder: number;

  @Column({
    type: 'enum', enumName: 'placeholder',
    enum: ReprocessStepStatus,
    default: ReprocessStepStatus.PENDING,
  })
  status: ReprocessStepStatus;

  @Column('jsonb', { nullable: true })
  executionData: Record<string, any> | null; // Link to execution batch if recorded

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isCompleted(): boolean {
    return this.status === ReprocessStepStatus.COMPLETED;
  }

  isInProgress(): boolean {
    return this.status === ReprocessStepStatus.IN_PROGRESS;
  }

  isPending(): boolean {
    return this.status === ReprocessStepStatus.PENDING;
  }

  canStart(): boolean {
    return this.status === ReprocessStepStatus.PENDING;
  }

  canComplete(): boolean {
    return this.status === ReprocessStepStatus.IN_PROGRESS;
  }

  constructor(partial: Partial<ReprocessStepHistory> = {}) {
    Object.assign(this, partial);
  }
}
