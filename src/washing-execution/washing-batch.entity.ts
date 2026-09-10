import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { Company } from '../companies/company.entity';
import { ProcessRouteStep } from '../process-route/process-route-step.entity';
import { WashingBatchAudit } from './washing-batch-audit.entity';

export enum WashingBatchStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  REJECTED = 'REJECTED',
}

export enum WashingProcessType {
  NORMAL = 'NORMAL_WASH',
  RINSE = 'RINSE_WASH',
  HOT = 'HOT_WASH',
  COLD = 'COLD_WASH',
  ENZYME = 'ENZYME_WASH',
  BIO = 'BIO_WASH',
  STONE = 'STONE_WASH',
  STONE_ENZYME = 'STONE_ENZYME_WASH',
  ACID = 'ACID_WASH',
  BLEACH = 'BLEACH_WASH',
  PIGMENT = 'PIGMENT_WASH',
  DENIM = 'DENIM_WASH',
}

@Entity('washing_batches')
export class WashingBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  batchNo: string; // Format: WB-YYYY-XXXXX

  @ManyToOne(() => DyeingJob, { onDelete: 'CASCADE' })
  job: DyeingJob;

  @ManyToOne(() => ProcessRouteStep, { nullable: true, onDelete: 'SET NULL' })
  routeStep: ProcessRouteStep;

  @Column({
    type: 'enum',
    enum: WashingProcessType,
    enumName: 'washing_process_type',
  })
  processType: WashingProcessType;

  @Column({ nullable: true })
  machineId: string; // UUID of the machine

  @Column({ nullable: true })
  machineName: string; // Machine name for reference

  @Column({ nullable: true })
  operatorId: string; // UUID of operator

  @Column({ nullable: true })
  operatorName: string; // Operator name for reference

  @Column({ nullable: true })
  recipeId: string; // UUID of recipe if applicable

  @Column({ nullable: true })
  recipeName: string; // Recipe name for reference

  @Column({ type: 'enum', enum: WashingBatchStatus, enumName: 'washing_batch_status', default: WashingBatchStatus.PENDING })
  status: WashingBatchStatus;

  // Shift tracking
  @Column({ nullable: true })
  shift: string; // Morning, Afternoon, Night

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  // Quantity tracking (immutable)
  @Column('decimal', { precision: 12, scale: 3 })
  inputQuantity: number; // kg or MTR

  @Column('decimal', { precision: 12, scale: 3, nullable: true })
  outputQuantity: number; // kg or MTR

  @Column('decimal', { precision: 12, scale: 3, nullable: true, default: 0 })
  lossQuantity: number; // Calculated: input - output

  @Column('decimal', { precision: 5, scale: 2, nullable: true, default: 0 })
  lossPercentage: number; // (loss / input) * 100

  @Column({ nullable: true })
  supervisorOverrideReason: string; // If output > input, capture why
  
  @Column({ nullable: true })
  supervisorId: string; // Who approved override

  // Remarks & quality notes
  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'text', nullable: true })
  qualityNotes: string;

  // Parameters stored as JSONB for flexibility
  @Column({ type: 'jsonb', nullable: true })
  parameters: any; // Process-specific parameters

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @OneToMany(() => WashingBatchAudit, (audit) => audit.batch)
  auditTrail: WashingBatchAudit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Calculate loss automatically
  calculateLoss() {
    if (this.outputQuantity !== null && this.outputQuantity !== undefined) {
      this.lossQuantity = Number((this.inputQuantity - this.outputQuantity).toFixed(3));
      this.lossPercentage = this.inputQuantity > 0
        ? Number(((this.lossQuantity / this.inputQuantity) * 100).toFixed(2))
        : 0;
    }
  }

  isCompleted(): boolean {
    return this.status === WashingBatchStatus.COMPLETED;
  }
}
