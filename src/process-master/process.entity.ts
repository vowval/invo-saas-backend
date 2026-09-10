import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index, JoinColumn } from 'typeorm';
import { ProcessCategory } from './process-category.entity';

@Entity('processes')
@Index(['category_id', 'display_order'])
@Index(['is_active'])
@Index(['process_code'])
export class Process {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id', type: 'uuid' })
  category_id: string;

  @ManyToOne(() => ProcessCategory, (category) => category.processes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: ProcessCategory;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
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
