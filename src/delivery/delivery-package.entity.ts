import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Delivery } from './delivery.entity';

@Entity('delivery_packages')
export class DeliveryPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Delivery, (delivery) => delivery.packages, {
    onDelete: 'CASCADE',
  })
  delivery: Delivery;

  @Column()
  packageNumber: number; // 1, 2, 3...

  @Column('numeric', { precision: 10, scale: 2 })
  weight: number; // kg

  @Column({ nullable: true })
  rolls: string | null; // e.g., "R001, R002, R003"

  @Column({ nullable: true })
  remarks: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<DeliveryPackage> = {}) {
    Object.assign(this, partial);
  }
}
