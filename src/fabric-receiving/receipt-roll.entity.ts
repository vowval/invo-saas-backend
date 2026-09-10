import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReceiptLot } from './receipt-lot.entity';

@Entity()
export class ReceiptRoll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ReceiptLot, (lot) => lot.rolls, { onDelete: 'CASCADE' })
  lot: ReceiptLot;

  @Column()
  rollNumber: string;

  @Column('decimal', { precision: 12, scale: 3 })
  weight: number;

  @Column({ default: 'kg' })
  uom: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
