import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { ChemicalItem } from './chemical-item.entity';
import { Batch } from '../production/batch.entity';

export enum StockTransactionType {
  OPENING = 'OPENING',
  PURCHASE = 'PURCHASE',
  CONSUMPTION = 'CONSUMPTION',
  WASTAGE = 'WASTAGE',
  ADJUSTMENT = 'ADJUSTMENT',
}

// One ledger entry against a chemical item. Positive quantity increases
// stock (OPENING/PURCHASE/positive ADJUSTMENT), negative decreases it
// (CONSUMPTION/WASTAGE/negative ADJUSTMENT). currentStock on ChemicalItem
// is the running total of these entries.
@Entity()
export class StockTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChemicalItem, { onDelete: 'CASCADE' })
  chemicalItem: ChemicalItem;

  @Column({
    type: 'enum', enumName: 'placeholder',
    enum: StockTransactionType,
  })
  type: StockTransactionType;

  // Signed quantity: positive = stock in, negative = stock out.
  @Column('decimal', { precision: 14, scale: 3 })
  quantity: number;

  @Column({ nullable: true })
  notes: string;

  // Set when this transaction was auto-generated from a batch's recipe
  // consumption, so it can be traced back to the batch that used it.
  @ManyToOne(() => Batch, { onDelete: 'SET NULL', nullable: true })
  batch: Batch | null;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;
}
