import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceNo: string;

  // Buyer details
  @Column()
  buyerName: string;

  @Column('text')
  buyerAddress: string;

  @Column({ nullable: true })
  buyerGstin: string;

  // Invoice meta
  @Column({ type: 'date' })
  invoiceDate: Date;

  // Job work specific
  @Column({ nullable: true })
  orderNo: string;

  // Amounts
  @Column('decimal', { precision: 12, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 5 })
  gstRate: number;

  @Column({ default: 'INTRA_STATE' })
  supplyType: 'INTRA_STATE' | 'INTER_STATE';

  @Column({ nullable: true })
  placeOfSupply: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  cgstAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  sgstAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  igstAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  grandTotal: number;

  // Relations
  @ManyToOne(() => Company, company => company.invoices, {
    onDelete: 'CASCADE',
  })
  company: Company;

  @OneToMany(() => InvoiceItem, item => item.invoice, {
    cascade: true,
  })
  items: InvoiceItem[];

  @CreateDateColumn()
  createdAt: Date;
}
