import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Fabric processing service
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // GST SAC / HSN for job work
  @Column({ nullable: true })
  hsnCode: string;

  // Billing unit (KG)
  @Column()
  unit: string;

  // Rate per KG
  @Column('decimal', { precision: 10, scale: 2 })
  rate: number;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => Company, company => company.products, {
    onDelete: 'CASCADE',
  })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;
}
