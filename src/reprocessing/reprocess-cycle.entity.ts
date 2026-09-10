import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { ReprocessRequest } from './reprocess-request.entity';
import { ReprocessStepHistory } from './reprocess-step-history.entity';
import { ReprocessAudit } from './reprocess-audit.entity';

export enum ReprocessCycleStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

@Entity('reprocess_cycles')
export class ReprocessCycle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @ManyToOne(() => DyeingJob, { onDelete: 'CASCADE' })
  job: DyeingJob;

  @Column()
  cycleNumber: number;

  @ManyToOne(() => ReprocessRequest, { onDelete: 'CASCADE' })
  reprocessRequest: ReprocessRequest;

  @Column()
  startProcess: string; // e.g., "Reactive Dyeing"

  @Column({
    type: 'enum', enumName: 'placeholder',
    enum: ReprocessCycleStatus,
    default: ReprocessCycleStatus.PENDING,
  })
  cycleStatus: ReprocessCycleStatus;

  @Column('numeric', { precision: 10, scale: 2 })
  originalInput: number;

  @Column('numeric', { precision: 10, scale: 2 })
  originalOutput: number;

  @Column('numeric', { precision: 10, scale: 2 })
  originalLoss: number;

  @Column('numeric', { precision: 10, scale: 2 })
  reprocessInput: number;

  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  reprocessOutput: number | null;

  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  reprocessLoss: number | null;

  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  additionalLoss: number | null;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  estimatedAdditionalCost: number | null;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  actualAdditionalCost: number | null;

  @Column({ nullable: true })
  startedAt: Date | null;

  @Column({ nullable: true })
  completedAt: Date | null;

  @Column('text', { nullable: true })
  remarks: string | null;

  @OneToMany(() => ReprocessStepHistory, (step) => step.cycle, {
    cascade: true,
  })
  stepHistory: ReprocessStepHistory[];

  @OneToMany(() => ReprocessAudit, (audit) => audit.cycle, { cascade: true })
  auditTrail: ReprocessAudit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isCompleted(): boolean {
    return this.cycleStatus === ReprocessCycleStatus.COMPLETED;
  }

  isInProgress(): boolean {
    return this.cycleStatus === ReprocessCycleStatus.IN_PROGRESS;
  }

  isPending(): boolean {
    return this.cycleStatus === ReprocessCycleStatus.PENDING;
  }

  isRejected(): boolean {
    return this.cycleStatus === ReprocessCycleStatus.REJECTED;
  }

  canStart(): boolean {
    return this.cycleStatus === ReprocessCycleStatus.PENDING;
  }

  canComplete(): boolean {
    return this.cycleStatus === ReprocessCycleStatus.IN_PROGRESS;
  }

  canReject(): boolean {
    return this.cycleStatus === ReprocessCycleStatus.IN_PROGRESS;
  }

  calculateLoss(): void {
    if (this.reprocessOutput !== null) {
      this.reprocessLoss = this.reprocessInput - this.reprocessOutput;
      this.additionalLoss = this.reprocessLoss + this.originalLoss;
    }
  }

  constructor(partial: Partial<ReprocessCycle> = {}) {
    Object.assign(this, partial);
  }
}
