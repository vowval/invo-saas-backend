import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Index, JoinColumn } from 'typeorm';
import { ProcessCategory } from './process-category.entity';
import { ProcessParameter } from './process-parameter.entity';

@Entity('processes')
@Index(['factory_id', 'category_id', 'display_order'])
@Index(['factory_id', 'is_active'])
@Index(['factory_id', 'process_code'])
@Index(['is_system_default']) // For finding global processes
export class Process {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // NULL = system-wide/global process, UUID = factory-specific process
  @Column({ name: 'factory_id', type: 'uuid', nullable: true })
  factory_id: string | null;

  @Column({ name: 'category_id', type: 'uuid' })
  category_id: string;

  @ManyToOne(() => ProcessCategory, (category) => category.processes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: ProcessCategory;

  @OneToMany(() => ProcessParameter, (param) => param.process)
  parameters: ProcessParameter[];

  @Column({ type: 'varchar', length: 150 })
  name: string;

  // process_code unique per factory (if factory_id is set) or globally (if null)
  @Column({ type: 'varchar', length: 50 })
  process_code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // e.g., "Wash", "Dye", "Finish", "Dry"
  @Column({ type: 'varchar', length: 50 })
  process_family: string;

  // e.g., "Chemical", "Mechanical", "Thermal"
  @Column({ type: 'varchar', length: 50 })
  process_type: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_system_default: boolean;

  // For factory processes: can reference the global process they were cloned from
  @Column({ type: 'uuid', nullable: true })
  cloned_from_process_id: string | null;

  // Can only be set to false if no process executions exist
  @Column({ type: 'boolean', default: false })
  has_executions: boolean;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
