import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { Batch } from '../production/batch.entity';

// Cost breakdown recorded for a single batch. Chemical cost is
// auto-populated from inventory consumption; every other line is
// entered manually (or defaulted to 0) by the owner/accountant.
@Entity()
export class BatchCost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Batch, { onDelete: 'CASCADE' })
  @JoinColumn()
  batch: Batch;

  // Cost of the fabric/input itself, if the factory wants to cost it in
  // (e.g. for their own stock, not customer-supplied fabric).
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  fabricCost: number;

  // Auto-computed from StockTransaction CONSUMPTION entries linked to this
  // batch, valued at each chemical's unitCost. Can be manually overridden.
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  dyeChemicalCost: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  electricityCost: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  steamFuelCost: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  waterCost: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  labourCost: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  machineCost: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  otherCost: number;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
