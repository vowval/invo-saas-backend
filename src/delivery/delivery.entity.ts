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
import { User } from '../users/user.entity';
import { DeliveryPackage } from './delivery-package.entity';
import { DeliveryAudit } from './delivery-audit.entity';

export enum DeliveryStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DyeingJob, { onDelete: 'CASCADE' })
  job: DyeingJob;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  @Column('numeric', { precision: 10, scale: 2 })
  deliveryQuantity: number;

  @Column()
  packageCount: number;

  @Column({ nullable: true })
  deliveryChallan: string | null; // Delivery challan number

  @Column({ nullable: true })
  vehicleNumber: string | null;

  @Column({ nullable: true })
  transporter: string | null;

  @Column({ nullable: true })
  driverName: string | null;

  @Column({ nullable: true })
  driverContact: string | null;

  @Column({ nullable: true })
  dispatchDate: Date | null;

  @Column({ nullable: true })
  destination: string | null;

  @Column('text', { nullable: true })
  remarks: string | null;

  @Column('text', { nullable: true })
  supervisorOverrideReason: string | null; // For delivery qty > packed qty

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  dispatchedBy: User | null;

  @Column({ nullable: true })
  dispatchedAt: Date | null;

  @OneToMany(() => DeliveryPackage, (pkg) => pkg.delivery, { cascade: true })
  packages: DeliveryPackage[];

  @OneToMany(() => DeliveryAudit, (audit) => audit.delivery, { cascade: true })
  auditTrail: DeliveryAudit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isPending(): boolean {
    return this.status === DeliveryStatus.PENDING;
  }

  isInProgress(): boolean {
    return this.status === DeliveryStatus.IN_PROGRESS;
  }

  isCompleted(): boolean {
    return this.status === DeliveryStatus.COMPLETED;
  }

  canStart(): boolean {
    return this.status === DeliveryStatus.PENDING;
  }

  canComplete(): boolean {
    return this.status === DeliveryStatus.IN_PROGRESS;
  }

  constructor(partial: Partial<Delivery> = {}) {
    Object.assign(this, partial);
  }
}
