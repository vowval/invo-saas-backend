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
import { User } from '../users/user.entity';
import { PackingRoll } from './packing-roll.entity';
import { PackingAudit } from './packing-audit.entity';

export enum PackingStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
}

@Entity('packings')
export class Packing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DyeingJob, { onDelete: 'CASCADE' })
  job: DyeingJob;

  @Column({
    type: 'enum', enumName: 'placeholder',
    enum: PackingStatus,
    default: PackingStatus.PENDING,
  })
  status: PackingStatus;

  @Column('numeric', { precision: 10, scale: 2 })
  finishedQuantity: number;

  @Column()
  rollCount: number;

  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  totalRollWeight: number | null;

  @Column()
  packageCount: number;

  @Column({ nullable: true })
  packingType: string; // e.g., "Polybag", "Carton"

  @Column('text', { nullable: true })
  labels: string | null;

  @Column('text', { nullable: true })
  remarks: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  packedBy: User | null;

  @Column({ nullable: true })
  packedAt: Date | null;

  @OneToMany(() => PackingRoll, (roll) => roll.packing, { cascade: true })
  rolls: PackingRoll[];

  @OneToMany(() => PackingAudit, (audit) => audit.packing, { cascade: true })
  auditTrail: PackingAudit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isPending(): boolean {
    return this.status === PackingStatus.PENDING;
  }

  isInProgress(): boolean {
    return this.status === PackingStatus.IN_PROGRESS;
  }

  isCompleted(): boolean {
    return this.status === PackingStatus.COMPLETED;
  }

  canStart(): boolean {
    return this.status === PackingStatus.PENDING;
  }

  canComplete(): boolean {
    return this.status === PackingStatus.IN_PROGRESS;
  }

  canHold(): boolean {
    return this.status === PackingStatus.IN_PROGRESS;
  }

  constructor(partial: Partial<Packing> = {}) {
    Object.assign(this, partial);
  }
}
