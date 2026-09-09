import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';

export enum DyeingJobStatus {
  RECEIVED = 'RECEIVED',
  IN_PROCESS = 'IN_PROCESS',
  READY_FOR_DELIVERY = 'READY_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
}

@Entity()
export class DyeingJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jobNo: string;

  @Column()
  customerName: string;

  @Column({ nullable: true })
  customerContact: string;

  @Column()
  fabricType: string;

  @Column({ nullable: true })
  colour: string;

  @Column({ nullable: true })
  shadeNo: string;

  @Column()
  unit: string;

  @Column('decimal', { precision: 12, scale: 3 })
  quantityReceived: number;

  @Column('decimal', { precision: 12, scale: 3, default: 0 })
  quantityDelivered: number;

  @Column({ nullable: true })
  partyDcNo: string;

  @Column({ type: 'date' })
  receivedDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({
    type: 'enum',
    enum: DyeingJobStatus,
    default: DyeingJobStatus.RECEIVED,
  })
  status: DyeingJobStatus;

  @Column({ nullable: true })
  processNotes: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
