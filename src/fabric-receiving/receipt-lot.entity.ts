import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FabricReceipt } from './fabric-receipt.entity';
import { ReceiptRoll } from './receipt-roll.entity';

@Entity()
export class ReceiptLot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FabricReceipt, (receipt) => receipt.lots, { onDelete: 'CASCADE' })
  receipt: FabricReceipt;

  @Column()
  lotNumber: string;

  @Column()
  numberOfRolls: number;

  @Column('decimal', { precision: 12, scale: 3 })
  totalWeight: number;

  @Column({ default: 'kg' })
  uom: string;

  @OneToMany(() => ReceiptRoll, (roll) => roll.lot, { cascade: true })
  rolls: ReceiptRoll[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
