import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index, JoinColumn } from 'typeorm';
import { Process } from './process.entity';

export enum ParameterDataType {
  TEXT = 'text',
  INTEGER = 'integer',
  DECIMAL = 'decimal',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  DATE = 'date',
  TIME = 'time',
  DURATION = 'duration',
  QUANTITY = 'quantity',
  PERCENTAGE = 'percentage',
  TEMPERATURE = 'temperature',
  PH = 'pH',
  MACHINE = 'machine',
  RECIPE = 'recipe',
  CHEMICAL = 'chemical',
  COLOUR = 'colour',
  SHADE = 'shade',
}

@Entity('process_parameters')
@Index(['factory_id', 'process_id', 'display_order'])
@Index(['factory_id', 'process_id', 'parameter_code'])
export class ProcessParameter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // NULL = global parameter, UUID = factory-specific parameter
  @Column({ name: 'factory_id', type: 'uuid', nullable: true })
  factory_id: string | null;

  @Column({ name: 'process_id', type: 'uuid' })
  process_id: string;

  @ManyToOne(() => Process, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'process_id' })
  process: Process;

  @Column({ type: 'varchar', length: 100 })
  parameter_code: string;

  @Column({ type: 'varchar', length: 200 })
  parameter_name: string;

  @Column({ type: 'enum', enum: ParameterDataType })
  data_type: ParameterDataType;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string | null;

  @Column({ type: 'boolean', default: false })
  is_required: boolean;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @Column({ type: 'text', nullable: true })
  default_value: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  min_value: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  max_value: number | null;

  // JSON array of allowed values for 'select' type
  @Column({ type: 'jsonb', nullable: true })
  allowed_values: string[] | null;

  @Column({ type: 'text', nullable: true })
  help_text: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
