import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FabricInspection } from './fabric-inspection.entity';

export enum CheckpointType {
  ROLL_COUNT = 'ROLL_COUNT',
  WEIGHT = 'WEIGHT',
  GSM = 'GSM',
  WIDTH = 'WIDTH',
  FABRIC_TYPE = 'FABRIC_TYPE',
  COMPOSITION = 'COMPOSITION',
  SHADE_COLOUR = 'SHADE_COLOUR',
  VISIBLE_DEFECTS = 'VISIBLE_DEFECTS',
  CONTAMINATION = 'CONTAMINATION',
  MOISTURE_CONDITION = 'MOISTURE_CONDITION',
  LOT_CONSISTENCY = 'LOT_CONSISTENCY',
  CUSTOMER_SPEC = 'CUSTOMER_SPEC',
}

export enum CheckpointStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  NA = 'NA', // Not applicable
}

@Entity()
export class InspectionCheckpoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FabricInspection, (inspection) => inspection.checkpoints, { onDelete: 'CASCADE' })
  inspection: FabricInspection;

  @Column({ type: 'enum', enum: CheckpointType })
  checkType: CheckpointType;

  @Column({ type: 'enum', enum: CheckpointStatus })
  status: CheckpointStatus;

  @Column()
  specification: string; // What was expected (e.g., "1000 GSM ±5%")

  @Column({ nullable: true })
  actualValue: string; // What was found (e.g., "1005 GSM")

  @Column({ nullable: true })
  notes: string; // Additional notes/observations

  @Column({ nullable: true })
  isOptional: boolean; // Some checks may be optional

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
