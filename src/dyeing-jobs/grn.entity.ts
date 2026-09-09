import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { DyeingJob } from './dyeing-job.entity';

@Entity()
export class GoodsReceiptNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // GRN number, e.g. GRN-2026-0001
  @Column()
  grnNo: string;

  @ManyToOne(() => DyeingJob, { onDelete: 'CASCADE' })
  dyeingJob: DyeingJob;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @Column({ nullable: true })
  vehicleNo: string;

  @Column({ nullable: true })
  lotNumber: string;

  @Column({ nullable: true })
  colour: string;

  @Column('integer', { nullable: true })
  rollCount: number | null;

  @Column('decimal', { precision: 12, scale: 3, nullable: true })
  weight: number | null;

  @Column({ nullable: true })
  inspectionNotes: string;

  @Column({ type: 'date' })
  receivedDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}
