import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('subscription_plan')
export class SubscriptionPlan {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('integer')
  maxUsers: number;

  @Column('integer', { nullable: true })
  invoiceLimit: number | null;

  @Column()
  billingCycle: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  priceInr: number;

  @Column('integer', { nullable: true })
  durationMonths: number | null;

  @Column({ default: false })
  requiresPayment: boolean;

  @Column({ default: true })
  active: boolean;
}
