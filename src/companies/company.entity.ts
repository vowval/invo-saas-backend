import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { Invoice } from '../invoices/invoice.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic identity
  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  // GST & MSME
  @Column({ nullable: true })
  gstin: string;

  @Column({ nullable: true })
  msmeUdyam: string;

  // Bank details (for invoice)
  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  branchName: string;

  @Column({ nullable: true })
  accountNo: string;

  @Column({ nullable: true })
  ifsc: string;

  @Column({ default: false })
  allowServiceArchive: boolean;

  @Column({ default: 'FREE' })
  subscriptionPlan: string;

  @Column({ default: 'FREE' })
  billingCycle: string;

  @Column({ default: 'ACTIVE' })
  subscriptionStatus: string;

  @Column({ type: 'integer', default: 1 })
  maxUsers: number;

  @Column({ type: 'integer', nullable: true })
  invoiceLimit: number | null;

  @Column({ type: 'integer', default: 0 })
  invoicesUsed: number;

  @Column({ type: 'timestamptz', nullable: true })
  subscriptionStartedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  subscriptionExpiresAt: Date | null;

  @Column({ default: false })
  lifetimeSubscription: boolean;

  @Column({ default: 'INV' })
  invoicePrefix: string;

  @Column({ type: 'integer', default: 1 })
  invoiceNextNumber: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relations (UNCHANGED)
  @OneToMany(() => User, user => user.company)
  users: User[];

  @OneToMany(() => Product, product => product.company)
  products: Product[];

  @OneToMany(() => Invoice, invoice => invoice.company)
  invoices: Invoice[];
}
