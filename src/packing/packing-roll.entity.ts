import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Packing } from './packing.entity';

@Entity('packing_rolls')
export class PackingRoll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Packing, (packing) => packing.rolls, {
    onDelete: 'CASCADE',
  })
  packing: Packing;

  @Column()
  rollNumber: string; // e.g., R001, R002

  @Column('numeric', { precision: 10, scale: 2 })
  weight: number; // kg

  @Column({ nullable: true })
  remarks: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<PackingRoll> = {}) {
    Object.assign(this, partial);
  }
}
