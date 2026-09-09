import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';

// A dyeing recipe, e.g. "NAVY-023": fabric type, process parameters, and
// the list of dye/chemical ingredients dosed per kg of fabric.
@Entity()
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // e.g. "NAVY-023"
  @Column()
  code: string;

  @Column({ nullable: true })
  fabricType: string;

  @Column({ nullable: true })
  temperatureC: number;

  @Column({ nullable: true })
  timeMinutes: number;

  // e.g. "1:8"
  @Column({ nullable: true })
  liquorRatio: string;

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => RecipeIngredient, ingredient => ingredient.recipe, { cascade: true })
  ingredients: RecipeIngredient[];

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;
}
