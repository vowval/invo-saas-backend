import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';

export enum PaymentMode {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  UPI = 'UPI',
  CHEQUE = 'CHEQUE',
  OTHER = 'OTHER',
}

// A payment received from a customer against their outstanding balance.
// Not tied to one specific invoice — applied against the customer ledger
// as a whole (oldest-outstanding-first when needed), matching how factory
// owners actually collect payments in this industry.
@Entity()
@Index(['company', 'customerName'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerName: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ type: 'enum', enum: PaymentMode, default: PaymentMode.BANK_TRANSFER })
  mode: PaymentMode;

  @Column({ nullable: true })
  referenceNo: string;

  @Column({ nullable: true })
  remarks: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;
}
