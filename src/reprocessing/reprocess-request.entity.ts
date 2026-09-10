import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { QcExecution } from '../quality-control/qc-execution.entity';
import { User } from '../users/user.entity';

export enum ReprocessRequestStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('reprocess_requests')
export class ReprocessRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @ManyToOne(() => DyeingJob, { onDelete: 'CASCADE' })
  job: DyeingJob;

  @ManyToOne(() => QcExecution, { onDelete: 'CASCADE' })
  qcExecution: QcExecution;

  @Column('text')
  failureReason: string;

  @Column()
  proposedAction: string; // e.g., "Reactive Dyeing", "Washing", etc.

  @Column({
    type: 'enum',
    enum: ReprocessRequestStatus,
    default: ReprocessRequestStatus.PENDING,
  })
  status: ReprocessRequestStatus;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  requestedBy: User | null;

  @Column()
  requestedAt: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  authorizedBy: User | null;

  @Column({ nullable: true })
  authorizedAt: Date | null;

  @Column('text', { nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isPending(): boolean {
    return this.status === ReprocessRequestStatus.PENDING;
  }

  isAuthorized(): boolean {
    return this.status === ReprocessRequestStatus.AUTHORIZED;
  }

  isRejected(): boolean {
    return this.status === ReprocessRequestStatus.REJECTED;
  }

  canAuthorize(): boolean {
    return this.status === ReprocessRequestStatus.PENDING;
  }

  canReject(): boolean {
    return this.status === ReprocessRequestStatus.PENDING;
  }

  constructor(partial: Partial<ReprocessRequest> = {}) {
    Object.assign(this, partial);
  }
}
