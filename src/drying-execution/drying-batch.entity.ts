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

export enum DryingProcessType {
  HYDRO_EXTRACTION = 'HYDRO_EXTRACTION',
  TUMBLE_DRY = 'TUMBLE_DRY',
  NATURAL_DRY = 'NATURAL_DRY',
}

export enum DryingBatchStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  REJECTED = 'REJECTED',
}

@Entity('drying_batches')
@Index(['companyId', 'batchNumber'], { unique: true })
@Index(['companyId', 'jobId'])
@Index(['companyId', 'status'])
@Index(['companyId', 'processType'])
@Index(['createdAt'])
export class DryingBatch {
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
    enum: DryingProcessType,
    default: DryingProcessType.HYDRO_EXTRACTION,
  })
  processType: DryingProcessType;

  @Column({
    type: 'enum',
    enum: DryingBatchStatus,
    default: DryingBatchStatus.PENDING,
  })
  status: DryingBatchStatus;

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
  // Hydro: { cycle: 3, speed: 1200, residualMoisture: 45 }
  // Tumble: { targetTemp: 80, actualTemp: 79, program: 'STANDARD', moisture: 15 }
  // Natural: { duration: 240, condition: 'SUNNY', moisture: 8 }
  @Column('jsonb', { nullable: true })
  actualParameters: Record<string, any>;

  @Column('jsonb', { nullable: true })
  targetParameters: Record<string, any>;

  // Quality and results
  @Column({ nullable: true })
  remarks: string;

  @Column({ nullable: true })
  qualityNotes: string;

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
    return this.status === DryingBatchStatus.COMPLETED;
  }

  isPaused(): boolean {
    return this.status === DryingBatchStatus.PAUSED;
  }

  isInProgress(): boolean {
    return this.status === DryingBatchStatus.IN_PROGRESS;
  }

  canStart(): boolean {
    return this.status === DryingBatchStatus.PENDING;
  }

  canComplete(): boolean {
    return (
      this.status === DryingBatchStatus.IN_PROGRESS ||
      this.status === DryingBatchStatus.PAUSED
    );
  }

  canPause(): boolean {
    return this.status === DryingBatchStatus.IN_PROGRESS;
  }

  canResume(): boolean {
    return this.status === DryingBatchStatus.PAUSED;
  }

  calculateLoss(): void {
    if (this.inputQuantity && this.outputQuantity) {
      this.lossQuantity = this.inputQuantity - this.outputQuantity;
      this.lossPercentage =
        (this.lossQuantity / this.inputQuantity) * 100;
    }
  }
}
