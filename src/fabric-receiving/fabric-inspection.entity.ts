import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FabricReceipt } from './fabric-receipt.entity';
import { Company } from '../companies/company.entity';
import { InspectionCheckpoint } from './inspection-checkpoint.entity';

export enum InspectionResult {
  PASS = 'PASS',
  HOLD = 'HOLD',
  REJECT = 'REJECT',
}

@Entity()
export class FabricInspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FabricReceipt, { onDelete: 'CASCADE' })
  receipt: FabricReceipt;

  @Column({ type: 'enum', enum: InspectionResult, nullable: true })
  result: InspectionResult;

  @Column()
  inspectorName: string;

  @Column('timestamp', { nullable: true })
  inspectionDateTime: Date;

  @Column({ nullable: true })
  remarks: string;

  @Column({ type: 'simple-array', nullable: true })
  photoPaths: string[];

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  gsm: number; // Grams per square meter

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  width: number; // Width in cm

  @Column({ nullable: true })
  fabricTypeVerified: boolean; // Customer spec match

  @Column({ nullable: true })
  compositionVerified: boolean; // Customer spec match

  @Column('decimal', { precision: 12, scale: 3, nullable: true })
  weightVerified: number; // Actual measured weight

  @Column({ nullable: true })
  visibleDefects: string; // Description of defects if any

  @Column({ nullable: true })
  contamination: string; // Description of contamination if any

  @Column({ nullable: true })
  moistureCondition: string; // Moisture level/condition notes

  @Column({ nullable: true })
  lotConsistency: string; // Notes on lot consistency

  @Column({ nullable: true })
  shadeConsistency: boolean; // For dyeing jobs - shade match

  @Column({ nullable: true })
  rollCountVerified: boolean; // Matches lot roll count

  @Column('int', { nullable: true })
  actualRollCount: number; // Actual rolls found vs expected

  @OneToMany(() => InspectionCheckpoint, (checkpoint) => checkpoint.inspection, { cascade: true })
  checkpoints: InspectionCheckpoint[];

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
