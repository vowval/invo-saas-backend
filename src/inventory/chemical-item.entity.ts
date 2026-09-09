import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';

export enum ChemicalCategory {
  DYE = 'DYE',
  CHEMICAL = 'CHEMICAL',
  OTHER = 'OTHER',
}

// A single stock-keeping item, e.g. "Reactive Blue", "Caustic", "Salt".
@Entity()
export class ChemicalItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ChemicalCategory,
    default: ChemicalCategory.CHEMICAL,
  })
  category: ChemicalCategory;

  // e.g. "kg", "litre"
  @Column({ default: 'kg' })
  unit: string;

  // Running stock balance, kept in sync by StockTransaction entries.
  @Column('decimal', { precision: 14, scale: 3, default: 0 })
  currentStock: number;

  // Alert when currentStock falls at/below this level.
  @Column('decimal', { precision: 14, scale: 3, default: 0 })
  minStockLevel: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;
}
