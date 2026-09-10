import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { Process } from '../process-master/entities/process.entity';
import { ProcessRouteStep } from '../process-route/process-route-step.entity';

export enum FinishingProcessType {
  SOFTENER = 'SOFTENER',
  SILICON_SOFTENER = 'SILICON_SOFTENER',
  STENTER = 'STENTER',
  COMPACTING = 'COMPACTING',
  SANFORIZING = 'SANFORIZING',
  CALENDARING = 'CALENDARING',
  BRUSHING = 'BRUSHING',
  ANTI_PILLING = 'ANTI_PILLING',
}

export enum FinishingBatchStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  REJECTED = 'REJECTED',
}

@Entity('finishing_batches')
@Index(['companyId', 'batchNumber'], { unique: true })
@Index(['companyId', 'jobId'])
@Index(['companyId', 'status'])
@Index(['companyId', 'processType'])
@Index(['createdAt'])
export class FinishingBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  jobId: string;

  @ManyToOne(() => DyeingJob)
  @JoinColumn({ name: 'jobId' })
  job: DyeingJob;

  @Column()
  processId: string;

  @ManyToOne(() => Process)
  @JoinColumn({ name: 'processId' })
  process: Process;

  @Column({ nullable: true })
  routeStepId: string;

  @ManyToOne(() => ProcessRouteStep, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'routeStepId' })
  routeStep: ProcessRouteStep;

  @Column()
  batchNumber: string;

  @Column('enum', {
    enum: FinishingProcessType,
    default: FinishingProcessType.SOFTENER,
  })
  processType: FinishingProcessType;

  @Column({
    type: 'enum',
    enum: FinishingBatchStatus,
    default: FinishingBatchStatus.PENDING,
  })
  status: FinishingBatchStatus;

  // Machine and operational setup
  @Column({ nullable: true })
  machineId: string;

  @Column({ nullable: true })
  machineCode: string;

  @Column({ nullable: true })
  recipeId: string;

  @Column({ nullable: true })
  recipeName: string;

  @Column({ nullable: true })
  recipeVersion: string;

  @Column({ nullable: true })
  operatorId: string;

  @Column({ nullable: true })
  operatorName: string;

  @Column({ nullable: true })
  shift: string;

  // Quantity tracking (immutable input)
  @Column('numeric', { precision: 12, scale: 3, nullable: false })
  inputQuantity: number;

  @Column('numeric', { precision: 12, scale: 3, nullable: true })
  outputQuantity: number;

  @Column('numeric', { precision: 12, scale: 3, nullable: true })
  lossQuantity: number;

  @Column('numeric', { precision: 5, scale: 2, nullable: true })
  lossPercentage: number;

  @Column({ nullable: true })
  uom: string;

  // Timing
  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  pausedAt: Date;

  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  durationMinutes: number;

  // Process-specific parameters stored as JSONB
  // Examples:
  // Softener: { dosage: 5, liquorRatio: 10, temperature: 60, time: 45 }
  // Silicon: { siliconeType: 'REACTIVE', dosage: 3, liquorRatio: 12, temperature: 55, time: 30, pH: 7.5 }
  // Stenter: { width: 150, temperature: 180, speed: 25, overfeed: 15 }
  // Compacting: { width: 150, temperature: 150, speed: 30, shrinkageTarget: 2 }
  // Sanforizing: { shrinkageTarget: 1.5, width: 150 }
  @Column('jsonb', { nullable: true })
  actualParameters: Record<string, any>;

  @Column('jsonb', { nullable: true })
  targetParameters: Record<string, any>;

  // Quality and results
  @Column({ nullable: true })
  remarks: string;

  @Column({ nullable: true })
  qualityNotes: string;

  @Column({ nullable: true })
  finalWidth: number;

  @Column('numeric', { precision: 5, scale: 2, nullable: true })
  finalShrinkage: number;

  @Column({ default: false })
  supervisorOverride: boolean;

  @Column({ nullable: true })
  supervisorId: string;

  @Column({ nullable: true })
  supervisorOverrideReason: string;

  @Column({ type: 'timestamp', nullable: true })
  supervisorOverrideAt: Date;

  // Audit
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  // Helper methods
  isCompleted(): boolean {
    return this.status === FinishingBatchStatus.COMPLETED;
  }

  isPaused(): boolean {
    return this.status === FinishingBatchStatus.PAUSED;
  }

  isInProgress(): boolean {
    return this.status === FinishingBatchStatus.IN_PROGRESS;
  }

  canStart(): boolean {
    return this.status === FinishingBatchStatus.PENDING;
  }

  canComplete(): boolean {
    return (
      this.status === FinishingBatchStatus.IN_PROGRESS ||
      this.status === FinishingBatchStatus.PAUSED
    );
  }

  canPause(): boolean {
    return this.status === FinishingBatchStatus.IN_PROGRESS;
  }

  canResume(): boolean {
    return this.status === FinishingBatchStatus.PAUSED;
  }

  calculateLoss(): void {
    if (this.inputQuantity && this.outputQuantity) {
      this.lossQuantity = this.inputQuantity - this.outputQuantity;
      this.lossPercentage =
        (this.lossQuantity / this.inputQuantity) * 100;
    }
  }
}
