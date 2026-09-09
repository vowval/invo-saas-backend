import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LabDip } from './lab-dip.entity';
import { Recipe } from '../inventory/recipe.entity';

export enum LabDipSampleStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// One dip attempt within a LabDip, e.g. Sample #1, #2, #3.
@Entity()
export class LabDipSample {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LabDip, labDip => labDip.samples, { onDelete: 'CASCADE' })
  @JoinColumn()
  labDip: LabDip;

  // 1, 2, 3... within this lab dip.
  @Column()
  sampleNo: number;

  // Optional link to a saved recipe used for this sample; if approved,
  // this becomes the job's production recipe directly.
  @ManyToOne(() => Recipe, { onDelete: 'SET NULL', nullable: true })
  recipeRef: Recipe | null;

  // Free-text recipe summary when no saved Recipe is linked yet
  // (e.g. "Reactive Blue 2%, Reactive Black 1%, Salt 40g/l, 60C, 90min").
  @Column({ type: 'text', nullable: true })
  recipeNotes: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({
    type: 'enum',
    enum: LabDipSampleStatus,
    default: LabDipSampleStatus.PENDING,
  })
  status: LabDipSampleStatus;

  @CreateDateColumn()
  createdAt: Date;
}
