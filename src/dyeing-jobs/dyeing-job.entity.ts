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

// Ordered end-to-end workflow, shown on the production board.
// `status` remains a coarse value for legacy reporting and is derived from this.
export enum TrackingStatus {
  FABRIC_RECEIVED = 'FABRIC_RECEIVED',
  FABRIC_INSPECTION = 'FABRIC_INSPECTION',
  JOB_CARD_PRODUCTION_ORDER = 'JOB_CARD_PRODUCTION_ORDER',
  LAB_DIP_SHADE_APPROVAL = 'LAB_DIP_SHADE_APPROVAL',
  DYEING = 'DYEING',
  WASHING_AFTER_TREATMENT = 'WASHING_AFTER_TREATMENT',
  FINISHING = 'FINISHING',
  QUALITY_CHECK = 'QUALITY_CHECK',
  PACKING = 'PACKING',
  READY_FOR_DELIVERY = 'READY_FOR_DELIVERY',
  DELIVERY = 'DELIVERY',
  READY_FOR_INVOICE = 'READY_FOR_INVOICE',
  GST_INVOICE = 'GST_INVOICE',
  PAYMENT_CLOSED = 'PAYMENT_CLOSED',
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

  /**
   * @deprecated Use FabricReceipt.netWeight instead.
   * This field is kept for historical data only. All new receiving workflows
   * should use the FabricReceipt entity (fabric-receiving module).
   */
  @Column('decimal', { precision: 12, scale: 3, nullable: true })
  quantityReceived: number;

  @Column('decimal', { precision: 12, scale: 3, default: 0 })
  quantityDelivered: number;

  /**
   * @deprecated Use FabricReceipt.customerDcNumber instead.
   * This field is kept for historical data only. All new receiving workflows
   * should use the FabricReceipt entity (fabric-receiving module).
   */
  @Column({ nullable: true })
  partyDcNo: string;

  /**
   * @deprecated Use FabricReceipt.receivedDate instead.
   * This field is kept for historical data only. All new receiving workflows
   * should use the FabricReceipt entity (fabric-receiving module).
   */
  @Column({ type: 'date', nullable: true })
  receivedDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({
    type: 'enum',
    enum: DyeingJobStatus,
    default: DyeingJobStatus.RECEIVED,
  })
  status: DyeingJobStatus;

  @Column({
    type: 'enum',
    enum: TrackingStatus,
    default: TrackingStatus.FABRIC_RECEIVED,
  })
  trackingStatus: TrackingStatus;

  @Column({ nullable: true })
  processNotes: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
