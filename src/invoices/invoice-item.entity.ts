import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { Product } from '../products/product.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';

@Entity()
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, invoice => invoice.items, {
    onDelete: 'CASCADE',
  })
  invoice: Invoice;

  @ManyToOne(() => Product)
  product: Product;

  @ManyToOne(() => DyeingJob, { nullable: true, onDelete: 'SET NULL' })
  dyeingJob: DyeingJob;

  // -------- DC DETAILS --------

  @Column({ nullable: true })
  partyDcNo: string;

  @Column({ type: 'date', nullable: true })
  partyDcDate: Date;

  @Column({ nullable: true })
  deliveryDcNo: string;

  // -------- FABRIC DETAILS --------

  @Column({ nullable: true })
  colour: string;

  @Column({ nullable: true })
  fabricWidth: string; // e.g. 47"

  // -------- BILLING --------

  // Kgs (must allow decimals like 142.900)
  @Column('decimal', { precision: 10, scale: 3 })
  quantity: number;

  // Rate per KG
  @Column('decimal', { precision: 10, scale: 2 })
  rate: number;

  // quantity * rate
  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;
}
