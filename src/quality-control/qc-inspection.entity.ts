import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { Batch } from '../production/batch.entity';

export enum QcResult {
  PASS = 'PASS',
  FAIL = 'FAIL',
}

// A quality-control record taken after dyeing/finishing for a batch.
// `overall` is auto-derived from the individual pass/fail checks so it
// can't drift out of sync with them.
@Entity()
export class QcInspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Batch, { onDelete: 'CASCADE' })
  batch: Batch;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  gsm: number | null;

  @Column({ nullable: true })
  width: string;

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  shrinkagePercent: number | null;

  @Column({ type: 'enum', enum: QcResult, nullable: true })
  shadeResult: QcResult | null;

  @Column({ type: 'enum', enum: QcResult, nullable: true })
  colourFastnessResult: QcResult | null;

  @Column({ default: 0 })
  fabricDefects: number;

  @Column({ type: 'enum', enum: QcResult })
  overall: QcResult;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @CreateDateColumn()
  inspectedAt: Date;
}
