import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QcExecution } from './qc-execution.entity';
import { User } from '../users/user.entity';

@Entity('qc_audit')
export class QcAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QcExecution, (exec) => exec.auditTrail, {
    onDelete: 'CASCADE',
  })
  qcExecution: QcExecution;

  @Column()
  action: string;

  @Column('jsonb', { nullable: true })
  previousValues: Record<string, any> | null;

  @Column('jsonb', { nullable: true })
  newValues: Record<string, any> | null;

  @Column('text', { nullable: true })
  reason: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  user: User | null;

  @Column({ nullable: true })
  userName: string | null;

  @CreateDateColumn()
  createdAt: Date;

  constructor(partial: Partial<QcAudit> = {}) {
    Object.assign(this, partial);
  }
}
