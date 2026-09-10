import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WashingBatch } from './washing-batch.entity';

@Entity('washing_batch_audit')
export class WashingBatchAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WashingBatch, { onDelete: 'CASCADE' })
  batch: WashingBatch;

  @Column()
  action: string; // 'CREATED', 'STATUS_CHANGED', 'OUTPUT_ENTERED', 'COMPLETED', etc.

  @Column({ type: 'jsonb', nullable: true })
  previousValue: any; // Old value before change

  @Column({ type: 'jsonb', nullable: true })
  newValue: any; // New value after change

  @Column()
  changedBy: string; // User ID

  @Column({ nullable: true })
  changedByName: string;

  @Column({ nullable: true })
  reason: string; // Why the change was made

  @Column({ nullable: true })
  approvedBy: string; // Supervisor ID for overrides

  @CreateDateColumn()
  createdAt: Date;
}
