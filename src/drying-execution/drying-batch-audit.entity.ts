import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { DryingBatch } from './drying-batch.entity';

@Entity('drying_batch_audit')
@Index(['companyId', 'batchId'])
@Index(['companyId', 'createdAt'])
export class DryingBatchAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  batchId: string;

  @ManyToOne(() => DryingBatch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batchId' })
  batch: DryingBatch;

  @Column()
  action: string; // create, start, pause, resume, complete, override, reject

  @Column({ nullable: true })
  previousValues: string; // JSON stringified

  @Column({ nullable: true })
  newValues: string; // JSON stringified

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  userName: string;

  @CreateDateColumn()
  createdAt: Date;
}
