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
import { ProcessRouteStep } from '../process-route/process-route-step.entity';
import { QcResult } from './qc-result.entity';
import { QcAudit } from './qc-audit.entity';
import { User } from '../users/user.entity';

export enum QcExecutionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
}

export enum QcOverallResult {
  PASS = 'PASS',
  FAIL = 'FAIL',
  HOLD = 'HOLD',
}

@Entity('qc_executions')
export class QcExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @ManyToOne(() => DyeingJob, (job) => job.id, { onDelete: 'CASCADE' })
  job: DyeingJob;

  @ManyToOne(() => ProcessRouteStep, { onDelete: 'SET NULL', nullable: true })
  processRouteStep: ProcessRouteStep | null;

  @Column({
    type: 'enum',
    enum: QcExecutionStatus,
    enumName: 'qc_execution_status',
    default: QcExecutionStatus.PENDING,
  })
  qcStatus: QcExecutionStatus;

  @Column({
    type: 'enum',
    enum: QcOverallResult,
    enumName: 'qc_overall_result',
    nullable: true,
  })
  overallResult: QcOverallResult | null;

  @Column('text', { nullable: true })
  notes: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  inspector: User | null;

  @Column({ nullable: true })
  inspectedAt: Date | null;

  @Column({ nullable: true })
  startedAt: Date | null;

  @Column({ nullable: true })
  completedAt: Date | null;

  @Column('text', { nullable: true })
  holdReason: string | null;

  @Column({ nullable: true })
  heldAt: Date | null;

  @Column({ nullable: true })
  releasedAt: Date | null;

  @OneToMany(() => QcResult, (result) => result.qcExecution, { cascade: true })
  results: QcResult[];

  @OneToMany(() => QcAudit, (audit) => audit.qcExecution, { cascade: true })
  auditTrail: QcAudit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isCompleted(): boolean {
    return this.qcStatus === QcExecutionStatus.COMPLETED;
  }

  isInProgress(): boolean {
    return this.qcStatus === QcExecutionStatus.IN_PROGRESS;
  }

  isOnHold(): boolean {
    return this.qcStatus === QcExecutionStatus.ON_HOLD;
  }

  isPending(): boolean {
    return this.qcStatus === QcExecutionStatus.PENDING;
  }

  canStart(): boolean {
    return this.qcStatus === QcExecutionStatus.PENDING;
  }

  canHold(): boolean {
    return this.qcStatus === QcExecutionStatus.IN_PROGRESS;
  }

  canResume(): boolean {
    return this.qcStatus === QcExecutionStatus.ON_HOLD;
  }

  canComplete(): boolean {
    return (
      this.qcStatus === QcExecutionStatus.IN_PROGRESS &&
      this.results &&
      this.results.length > 0
    );
  }

  constructor(partial: Partial<QcExecution> = {}) {
    Object.assign(this, partial);
  }
}
