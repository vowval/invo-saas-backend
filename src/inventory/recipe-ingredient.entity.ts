import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Recipe } from './recipe.entity';
import { ChemicalItem } from './chemical-item.entity';

// One line of a recipe: how much of a chemical/dye is dosed per kg of
// fabric (dosageGPerKg is grams per kg of fabric input). This lets the
// system scale up to any batch size: requiredQty = dosageGPerKg * inputKg / 1000.
@Entity()
export class RecipeIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Recipe, recipe => recipe.ingredients, { onDelete: 'CASCADE' })
  @JoinColumn()
  recipe: Recipe;

  @ManyToOne(() => ChemicalItem, { onDelete: 'RESTRICT' })
  chemicalItem: ChemicalItem;

  // Dosage in grams per kg of fabric input.
  @Column('decimal', { precision: 12, scale: 4 })
  dosageGPerKg: number;
}
