import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { DyeingBatch } from './dyeing-batch.entity';

@Entity('dyeing_batch_audit')
export class DyeingBatchAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Reference to batch
  @ManyToOne(() => DyeingBatch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batch_id' })
  batch: DyeingBatch;

  // Action type
  @Column()
  action: string;

  // Previous and new values for change tracking
  @Column('jsonb', { nullable: true })
  previousValue: Record<string, any> | null;

  @Column('jsonb', { nullable: true })
  newValue: Record<string, any> | null;

  // Who made the change
  @Column({ nullable: true })
  changedBy: string;

  // Reason for the change (optional)
  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
