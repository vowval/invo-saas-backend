import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { Company } from '../companies/company.entity';
import { ReceiptLot } from './receipt-lot.entity';
import { FabricInspection } from './fabric-inspection.entity';

@Entity()
export class FabricReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DyeingJob, { onDelete: 'CASCADE' })
  job: DyeingJob;

  @Column()
  customerDcNumber: string;

  @Column({ nullable: true })
  customerReference: string;

  @Column('date')
  receiptDate: Date;

  @Column({ nullable: true })
  vehicleNumber: string;

  @Column({ nullable: true })
  transporter: string;

  @Column()
  fabricType: string;

  @Column({ nullable: true })
  fabricConstruction: string;

  @Column({ nullable: true })
  composition: string;

  @Column({ nullable: true })
  colour: string;

  @Column('decimal', { precision: 12, scale: 3 })
  grossWeight: number;

  @Column('decimal', { precision: 12, scale: 3, nullable: true })
  tareWeight: number;

  @Column('decimal', { precision: 12, scale: 3 })
  netWeight: number;

  @Column({ default: 'kg' })
  uom: string;

  @Column()
  receivedBy: string;

  @Column({ nullable: true })
  remarks: string;

  @Column({ type: 'simple-array', nullable: true })
  attachmentPaths: string[];

  @OneToMany(() => ReceiptLot, (lot) => lot.receipt, { cascade: true })
  lots: ReceiptLot[];

  @OneToMany(() => FabricInspection, (inspection) => inspection.receipt, { cascade: true })
  inspections: FabricInspection[];

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
