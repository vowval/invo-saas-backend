import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReprocessCycle } from './reprocess-cycle.entity';
import { User } from '../users/user.entity';

@Entity('reprocess_audit')
export class ReprocessAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ReprocessCycle, (cycle) => cycle.auditTrail, {
    onDelete: 'CASCADE',
  })
  cycle: ReprocessCycle;

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

  constructor(partial: Partial<ReprocessAudit> = {}) {
    Object.assign(this, partial);
  }
}
