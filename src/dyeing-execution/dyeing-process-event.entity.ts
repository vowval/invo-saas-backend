import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { DyeingBatch } from './dyeing-batch.entity';

/**
 * Process events are internal sub-stages within a dyeing batch
 * Example: Load → Wetting → Dye Addition → Heating → Holding → Drain → Rinse → Neutralisation
 * These don't create separate Jobs, they're part of a single execution
 */
@Entity('dyeing_process_events')
export class DyeingProcessEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Reference to batch
  @ManyToOne(() => DyeingBatch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batch_id' })
  batch: DyeingBatch;

  // Event sequence number
  @Column()
  sequenceNumber: number;

  // Event name (e.g., "Dye Addition", "Temperature Raise", "Holding")
  @Column()
  eventName: string;

  // Event description
  @Column({ nullable: true })
  description: string;

  // Actual parameters for this event
  @Column('jsonb', { nullable: true })
  actualParameters: Record<string, any> | null;

  // Start and end times for this event
  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  // Operator remarks for this event
  @Column({ nullable: true })
  remarks: string;

  @CreateDateColumn()
  createdAt: Date;
}

/**
 * Chemical consumption record
 * Links to ChemicalItem from inventory, but records actual consumption
 */
@Entity('dyeing_chemical_consumption')
export class DyeingChemicalConsumption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Reference to batch
  @ManyToOne(() => DyeingBatch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batch_id' })
  batch: DyeingBatch;

  // Chemical name (non-hardcoded, from inventory)
  @Column()
  chemicalName: string;

  // Chemical ID (reference to ChemicalItem when inventory is available)
  @Column({ nullable: true })
  chemicalItemId: string;

  // Lot/batch number
  @Column({ nullable: true })
  chemicalLot: string;

  // Planned quantity (from recipe)
  @Column('numeric', { precision: 12, scale: 4, nullable: true })
  plannedQuantity: number | null;

  // Actual quantity used
  @Column('numeric', { precision: 12, scale: 4, nullable: true })
  actualQuantity: number | null;

  // Unit of measurement
  @Column({ nullable: true })
  unit: string;

  @CreateDateColumn()
  createdAt: Date;
}

/**
 * Dye consumption record
 * Similar to chemical, but specifically for dyes (which are special chemicals)
 */
@Entity('dyeing_dye_consumption')
export class DyeingDyeConsumption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Reference to batch
  @ManyToOne(() => DyeingBatch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batch_id' })
  batch: DyeingBatch;

  // Dye name (non-hardcoded)
  @Column()
  dyeName: string;

  // Dye ID (reference to ChemicalItem when dyes are tracked separately)
  @Column({ nullable: true })
  dyeItemId: string;

  // Lot/batch number
  @Column({ nullable: true })
  dyeLot: string;

  // Dye shade code if applicable
  @Column({ nullable: true })
  shadeCode: string;

  // Planned quantity (from recipe)
  @Column('numeric', { precision: 12, scale: 4, nullable: true })
  plannedQuantity: number | null;

  // Actual quantity used
  @Column('numeric', { precision: 12, scale: 4, nullable: true })
  actualQuantity: number | null;

  // Unit of measurement
  @Column({ nullable: true })
  unit: string;

  @CreateDateColumn()
  createdAt: Date;
}

/**
 * Dyeing QC results
 * Records factory-specific test results (no hardcoded standards)
 */
@Entity('dyeing_qc_results')
export class DyeingQCResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Reference to batch
  @ManyToOne(() => DyeingBatch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batch_id' })
  batch: DyeingBatch;

  // Test name (factory-defined, not hardcoded)
  @Column()
  testName: string;

  // Shade result
  @Column({ nullable: true })
  shadeResult: string;

  // Colour matching result
  @Column({ nullable: true })
  colourMatchingResult: string;

  // Wash fastness result
  @Column({ nullable: true })
  washFastnessResult: string;

  @Column({ nullable: true })
  washFastnessStandard: string;

  // Rubbing fastness result
  @Column({ nullable: true })
  rubbingFastnessResult: string;

  @Column({ nullable: true })
  rubbingFastnessStandard: string;

  // Other test result (flexible for factory-defined tests)
  @Column({ nullable: true })
  otherTestName: string;

  @Column({ nullable: true })
  otherTestResult: string;

  // Overall QC status: PASS, HOLD, REJECT
  @Column()
  status: string;

  // QC remarks
  @Column({ nullable: true })
  remarks: string;

  // Who conducted QC
  @Column({ nullable: true })
  qcPersonnel: string;

  @CreateDateColumn()
  createdAt: Date;
}
