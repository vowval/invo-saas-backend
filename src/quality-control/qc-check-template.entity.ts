import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';

export enum QcCheckType {
  NUMERIC = 'NUMERIC',
  ENUM = 'ENUM',
  BOOLEAN = 'BOOLEAN',
  TEXT = 'TEXT',
}

@Entity('qc_check_templates')
export class QcCheckTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: QcCheckType })
  checkType: QcCheckType;

  @Column('decimal', { precision: 3, scale: 1, default: 1.0 })
  weight: number;

  @Column('jsonb', { nullable: true })
  configuration: Record<string, any>; // For enum values, numeric ranges, etc.

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSystemDefault: boolean;

  @Column({ default: 0 })
  displayOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<QcCheckTemplate> = {}) {
    Object.assign(this, partial);
  }
}
