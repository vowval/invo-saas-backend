import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProcessRoute } from './process-route.entity';
import { Process } from '../process-master/entities/process.entity';

export enum StepStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  SKIPPED = 'SKIPPED',
  REPROCESS = 'REPROCESS',
}

@Entity()
export class ProcessRouteStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProcessRoute, (route) => route.steps, { onDelete: 'CASCADE' })
  route: ProcessRoute;

  @ManyToOne(() => Process, { onDelete: 'RESTRICT' })
  process: Process;

  @Column('int')
  sequence: number; // 1, 2, 3, ... enforces order

  @Column({
    type: 'enum', enumName: 'placeholder',
    enum: StepStatus,
    default: StepStatus.PENDING,
  })
  status: StepStatus;

  @Column({ default: true })
  isMandatory: boolean;

  @Column({ default: true })
  requiresQcBefore: boolean;

  @Column({ nullable: true })
  recipeId: string; // Link to Recipe if applicable

  @Column({ nullable: true })
  machineGroupId: string; // Link to MachineGroup if applicable

  @Column({ nullable: true })
  instructions: string; // Step-specific instructions

  @Column('decimal', { precision: 12, scale: 3, nullable: true })
  expectedQuantity: number; // Expected output quantity

  @Column({ type: 'timestamp', nullable: true })
  expectedCompletionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualCompletionDate: Date;

  @Column('decimal', { precision: 12, scale: 3, nullable: true })
  actualQuantity: number; // Actual output quantity

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
