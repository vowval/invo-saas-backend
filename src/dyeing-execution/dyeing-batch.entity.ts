import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { ProcessRouteStep } from '../process-route/process-route-step.entity';
import { Company } from '../companies/company.entity';
import { Recipe } from '../inventory/recipe.entity';

export enum DyeingProcessType {
  REACTIVE_DYEING = 'REACTIVE_DYEING',
  DISPERSE_DYEING = 'DISPERSE_DYEING',
  PIGMENT_DYEING = 'PIGMENT_DYEING',
  DIRECT_DYEING = 'DIRECT_DYEING',
  VAT_DYEING = 'VAT_DYEING',
  SULPHUR_DYEING = 'SULPHUR_DYEING',
  OTHER_DYEING = 'OTHER_DYEING',
}

export enum DyeingBatchStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  REJECTED = 'REJECTED',
}

export enum LabDipApprovalStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('dyeing_batches')
export class DyeingBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Unique batch identifier: DB-YYYY-XXXXX
  @Column({ unique: true })
  batchNo: string;

  // Job reference
  @ManyToOne(() => DyeingJob, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'job_id' })
  job: DyeingJob;

  // Process route step (for auto-completion)
  @ManyToOne(() => ProcessRouteStep, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'route_step_id' })
  routeStep: ProcessRouteStep | null;

  // Dyeing type
  @Column({
    type: 'enum',
    enum: DyeingProcessType,
  })
  processType: DyeingProcessType;

  // Recipe reference (recipe-driven)
  @ManyToOne(() => Recipe, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe | null;

  // Recipe version/name for record keeping
  @Column({ nullable: true })
  recipeCode: string;

  // Colour information
  @Column({ nullable: true })
  colour: string;

  @Column({ nullable: true })
  shadeCode: string;

  // Lab dip approval
  @Column({
    type: 'enum',
    enum: LabDipApprovalStatus,
    default: LabDipApprovalStatus.NOT_REQUIRED,
  })
  labDipApprovalStatus: LabDipApprovalStatus;

  @Column({ nullable: true })
  labDipReference: string;

  @Column({ nullable: true })
  customerApproved: boolean;

  @Column({ nullable: true })
  customerApprovedAt: Date;

  // INPUT QUANTITY - IMMUTABLE
  @Column('numeric', { precision: 12, scale: 3 })
  inputQuantity: number;

  // OUTPUT QUANTITY
  @Column('numeric', { precision: 12, scale: 3, nullable: true })
  outputQuantity: number | null;

  // LOSS CALCULATION
  @Column('numeric', { precision: 12, scale: 3, nullable: true })
  lossQuantity: number | null;

  @Column('numeric', { precision: 5, scale: 2, nullable: true })
  lossPercentage: number | null;

  // BATCH STATUS
  @Column({
    type: 'enum',
    enum: DyeingBatchStatus,
    default: DyeingBatchStatus.PENDING,
  })
  status: DyeingBatchStatus;

  // MACHINE & OPERATOR
  @Column({ nullable: true })
  machineId: string;

  @Column({ nullable: true })
  machineName: string;

  @Column({ nullable: true })
  operatorId: string;

  @Column({ nullable: true })
  operatorName: string;

  // SHIFT
  @Column({ nullable: true })
  shift: string;

  // RECIPE PARAMETERS - Target vs Actual
  @Column('jsonb', { nullable: true })
  targetParameters: Record<string, any> | null;

  @Column('jsonb', { nullable: true })
  actualParameters: Record<string, any> | null;

  // EXECUTION TIMELINE
  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  // REMARKS
  @Column('text', { nullable: true })
  remarks: string;

  // SUPERVISOR OVERRIDE (if output > input)
  @Column({ nullable: true })
  supervisorOverrideReason: string;

  @Column({ nullable: true })
  supervisorId: string;

  // Company for multi-tenant isolation
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Calculate loss after setting output quantity
   * Called explicitly before saving
   */
  calculateLoss(): void {
    if (this.outputQuantity !== null && this.outputQuantity !== undefined) {
      this.lossQuantity = this.inputQuantity - this.outputQuantity;
      this.lossPercentage = (this.lossQuantity / this.inputQuantity) * 100;
    }
  }

  /**
   * Check if batch is in terminal state
   */
  isCompleted(): boolean {
    return this.status === DyeingBatchStatus.COMPLETED || this.status === DyeingBatchStatus.REJECTED;
  }

  /**
   * Check if lab dip approval is required and obtained
   */
  isLabDipApprovalObtained(): boolean {
    return (
      this.labDipApprovalStatus === LabDipApprovalStatus.NOT_REQUIRED ||
      this.labDipApprovalStatus === LabDipApprovalStatus.APPROVED
    );
  }
}
