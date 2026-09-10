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
import { ProcessRouteStep } from './process-route-step.entity';

export enum ProcessRouteStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  REPROCESS = 'REPROCESS',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class ProcessRoute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DyeingJob, { onDelete: 'CASCADE' })
  job: DyeingJob;

  @Column()
  routeName: string;

  @Column({
    type: 'enum',
    enum: ProcessRouteStatus,
    default: ProcessRouteStatus.PENDING,
  })
  status: ProcessRouteStatus;

  @Column({ nullable: true })
  templateName: string; // If created from template

  @Column('timestamp', { nullable: true })
  lockedAt: Date; // Locked once production starts

  @OneToMany(() => ProcessRouteStep, (step) => step.route, { cascade: true })
  steps: ProcessRouteStep[];

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
