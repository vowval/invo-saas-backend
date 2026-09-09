import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { Recipe } from '../inventory/recipe.entity';
import { LabDipSample } from './lab-dip-sample.entity';

export enum LabDipStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// A shade-approval request for a customer, e.g. "LD-438": the factory
// iterates on samples until the customer approves one, then the approved
// sample's recipe becomes the production Recipe for the job.
@Entity()
export class LabDip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // e.g. "LD-438"
  @Column()
  labDipNo: string;

  @ManyToOne(() => DyeingJob, { onDelete: 'SET NULL', nullable: true })
  dyeingJob: DyeingJob | null;

  @Column({ nullable: true })
  customerName: string;

  // e.g. "Navy" — the target colour/shade being matched.
  @Column({ nullable: true })
  colour: string;

  // e.g. "NAVY-023" — shade code once finalized.
  @Column({ nullable: true })
  shadeCode: string;

  @Column({
    type: 'enum',
    enum: LabDipStatus,
    default: LabDipStatus.IN_PROGRESS,
  })
  status: LabDipStatus;

  // Set once an approved sample's recipe is promoted to production.
  @ManyToOne(() => Recipe, { onDelete: 'SET NULL', nullable: true })
  productionRecipe: Recipe | null;

  @OneToMany(() => LabDipSample, sample => sample.labDip, { cascade: true })
  samples: LabDipSample[];

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;
}
