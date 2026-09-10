import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Delivery } from './delivery.entity';
import { User } from '../users/user.entity';

@Entity('delivery_audit')
export class DeliveryAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Delivery, (delivery) => delivery.auditTrail, {
    onDelete: 'CASCADE',
  })
  delivery: Delivery;

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

  constructor(partial: Partial<DeliveryAudit> = {}) {
    Object.assign(this, partial);
  }
}
