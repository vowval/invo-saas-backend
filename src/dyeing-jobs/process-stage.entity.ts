import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DyeingJob } from './dyeing-job.entity';

export enum ProcessStageStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity()
export class ProcessStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DyeingJob, { onDelete: 'CASCADE' })
  dyeingJob: DyeingJob;

  // e.g. "Dye", "Wash", "Compact"
  @Column()
  stageName: string;

  // Order of this stage within the job's pipeline (1, 2, 3, ...)
  @Column('integer')
  sequence: number;

  // Quantity fed into this stage (kg/mtr/pcs, matches job's unit)
  @Column('decimal', { precision: 12, scale: 3, nullable: true })
  inputQty: number | null;

  // Quantity produced out of this stage once completed
  @Column('decimal', { precision: 12, scale: 3, nullable: true })
  outputQty: number | null;

  @Column({
    type: 'enum',
    enum: ProcessStageStatus,
    default: ProcessStageStatus.PENDING,
  })
  status: ProcessStageStatus;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
