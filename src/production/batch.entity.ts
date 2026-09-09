import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { Machine } from './machine.entity';

export enum BatchStatus {
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
}

@Entity()
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // e.g. "B-2026-0912"
  @Column()
  batchNo: string;

  @ManyToOne(() => DyeingJob, { onDelete: 'SET NULL', nullable: true })
  dyeingJob: DyeingJob | null;

  @ManyToOne(() => Machine, { onDelete: 'SET NULL', nullable: true })
  machine: Machine | null;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  // e.g. "BLACK-04"
  @Column({ nullable: true })
  recipe: string;

  @Column('decimal', { precision: 12, scale: 3, nullable: true })
  inputQty: number | null;

  @Column({
    type: 'enum',
    enum: BatchStatus,
    default: BatchStatus.SCHEDULED,
  })
  status: BatchStatus;

  @Column({ type: 'timestamptz', nullable: true })
  startTime: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endTime: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
