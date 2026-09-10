import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QcExecution, QcOverallResult } from './qc-execution.entity';
import { QcCheckTemplate } from './qc-check-template.entity';

@Entity('qc_results')
export class QcResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QcExecution, (exec) => exec.results, {
    onDelete: 'CASCADE',
  })
  qcExecution: QcExecution;

  @ManyToOne(() => QcCheckTemplate, { onDelete: 'RESTRICT' })
  qcCheckTemplate: QcCheckTemplate;

  @Column({ type: 'enum', enum: QcOverallResult, enumName: 'qc_overall_result' })
  result: QcOverallResult;

  @Column('text', { nullable: true })
  actualValue: string | null;

  @Column('text', { nullable: true })
  targetValue: string | null;

  @Column('text', { nullable: true })
  remarks: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<QcResult> = {}) {
    Object.assign(this, partial);
  }
}
