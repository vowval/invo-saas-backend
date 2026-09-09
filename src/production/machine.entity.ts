import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';

export enum MachineStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  MAINTENANCE = 'MAINTENANCE',
}

@Entity()
export class Machine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // e.g. "Jet Dyeing Machine #4"
  @Column()
  name: string;

  @Column({ nullable: true })
  machineType: string;

  @Column({
    type: 'enum',
    enum: MachineStatus,
    default: MachineStatus.IDLE,
  })
  status: MachineStatus;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;
}
