import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Packing } from './packing.entity';
import { User } from '../users/user.entity';

@Entity('packing_audit')
export class PackingAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Packing, (packing) => packing.auditTrail, {
    onDelete: 'CASCADE',
  })
  packing: Packing;

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

  constructor(partial: Partial<PackingAudit> = {}) {
    Object.assign(this, partial);
  }
}
