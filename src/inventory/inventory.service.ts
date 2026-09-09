import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChemicalItem } from './chemical-item.entity';
import {
  StockTransaction,
  StockTransactionType,
} from './stock-transaction.entity';
import { Recipe } from './recipe.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';
import { Batch } from '../production/batch.entity';
import { decimal, text } from '../common/input';

function num(value: unknown, label: string, opts: { required?: boolean; min?: number } = {}) {
  if (value === undefined || value === null || value === '') {
    if (opts.required) throw new BadRequestException(`${label} is required`);
    return undefined;
  }
  return decimal(value, label, { required: opts.required, min: opts.min });
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(ChemicalItem) private readonly chemicalRepo: Repository<ChemicalItem>,
    @InjectRepository(StockTransaction) private readonly txnRepo: Repository<StockTransaction>,
    @InjectRepository(Recipe) private readonly recipeRepo: Repository<Recipe>,
    @InjectRepository(RecipeIngredient) private readonly ingredientRepo: Repository<RecipeIngredient>,
  ) {}

  // ---- Chemical items ----

  async createChemical(data: any, companyId: string) {
    const chemical = this.chemicalRepo.create({
      name: text(data.name, 'Name', { required: true, max: 100 }),
      category: data.category || undefined,
      unit: text(data.unit, 'Unit') || 'kg',
      minStockLevel: num(data.minStockLevel, 'Minimum stock level') ?? 0,
      unitCost: num(data.unitCost, 'Unit cost') ?? 0,
      currentStock: 0,
      company: { id: companyId } as any,
    });
    const saved = await this.chemicalRepo.save(chemical);

    const opening = num(data.openingStock, 'Opening stock') ?? 0;
    if (opening > 0) {
      await this.recordTransaction(saved.id, companyId, StockTransactionType.OPENING, opening, 'Opening stock');
    }
    return this.findChemicalOrFail(saved.id, companyId);
  }

  listChemicals(companyId: string) {
    return this.chemicalRepo.find({
      where: { company: { id: companyId } },
      order: { name: 'ASC' },
    });
  }

  async lowStockChemicals(companyId: string) {
    const chemicals = await this.listChemicals(companyId);
    return chemicals.filter(c => Number(c.currentStock) <= Number(c.minStockLevel));
  }

  private async findChemicalOrFail(id: string, companyId: string) {
    const chemical = await this.chemicalRepo.findOne({ where: { id, company: { id: companyId } } });
    if (!chemical) throw new NotFoundException('Chemical item not found');
    return chemical;
  }

  // Records a signed stock movement and updates the running balance.
  // quantity should be positive for stock-in (OPENING/PURCHASE) and
  // negative for stock-out (CONSUMPTION/WASTAGE), or either sign for
  // ADJUSTMENT.
  private async recordTransaction(
    chemicalItemId: string,
    companyId: string,
    type: StockTransactionType,
    quantity: number,
    notes?: string,
    batchId?: string,
  ) {
    const chemical = await this.findChemicalOrFail(chemicalItemId, companyId);

    const txn = this.txnRepo.create({
      chemicalItem: chemical,
      type,
      quantity,
      notes,
      batch: batchId ? ({ id: batchId } as any) : null,
      company: { id: companyId } as any,
    });
    await this.txnRepo.save(txn);

    chemical.currentStock = Number(chemical.currentStock) + Number(quantity);
    await this.chemicalRepo.save(chemical);
    return chemical;
  }

  async recordPurchase(chemicalItemId: string, companyId: string, quantity: number, notes?: string, unitCost?: number) {
    const qty = num(quantity, 'Quantity', { required: true, min: 0.001 })!;
    const cost = num(unitCost, 'Unit cost');
    if (cost !== undefined) {
      const chemical = await this.findChemicalOrFail(chemicalItemId, companyId);
      chemical.unitCost = cost;
      await this.chemicalRepo.save(chemical);
    }
    return this.recordTransaction(chemicalItemId, companyId, StockTransactionType.PURCHASE, qty, notes);
  }

  async recordAdjustment(chemicalItemId: string, companyId: string, quantity: number, notes?: string) {
    const qty = num(quantity, 'Quantity', { required: true })!;
    if (qty === 0) throw new BadRequestException('Adjustment quantity cannot be zero');
    return this.recordTransaction(chemicalItemId, companyId, StockTransactionType.ADJUSTMENT, qty, notes);
  }

  async recordWastage(chemicalItemId: string, companyId: string, quantity: number, notes?: string) {
    const qty = num(quantity, 'Quantity', { required: true, min: 0.001 })!;
    return this.recordTransaction(chemicalItemId, companyId, StockTransactionType.WASTAGE, -qty, notes);
  }

  async listTransactions(chemicalItemId: string, companyId: string) {
    await this.findChemicalOrFail(chemicalItemId, companyId);
    return this.txnRepo.find({
      where: { chemicalItem: { id: chemicalItemId }, company: { id: companyId } },
      relations: ['batch'],
      order: { createdAt: 'DESC' },
    });
  }

  // Total cost of chemicals/dyes consumed by a batch, valued at each
  // chemical's current unit cost. Used by production costing to
  // auto-populate the dye/chemical cost line without manual re-entry.
  async getChemicalCostForBatch(batchId: string, companyId: string) {
    const consumptions = await this.txnRepo.find({
      where: {
        batch: { id: batchId },
        company: { id: companyId },
        type: StockTransactionType.CONSUMPTION,
      },
      relations: ['chemicalItem'],
    });
    return Number(
      consumptions
        .reduce((sum, txn) => sum + Math.abs(Number(txn.quantity)) * Number(txn.chemicalItem.unitCost || 0), 0)
        .toFixed(2),
    );
  }

  // ---- Recipes ----

  async createRecipe(data: any, companyId: string) {
    const ingredients = Array.isArray(data.ingredients) ? data.ingredients : [];
    if (ingredients.length === 0) {
      throw new BadRequestException('At least one ingredient is required');
    }

    for (const ingredient of ingredients) {
      await this.findChemicalOrFail(ingredient.chemicalItemId, companyId);
    }

    const recipe = this.recipeRepo.create({
      code: text(data.code, 'Recipe code', { required: true, max: 50 }),
      fabricType: text(data.fabricType, 'Fabric type'),
      temperatureC: num(data.temperatureC, 'Temperature'),
      timeMinutes: num(data.timeMinutes, 'Time'),
      liquorRatio: text(data.liquorRatio, 'Liquor ratio'),
      notes: text(data.notes, 'Notes'),
      company: { id: companyId } as any,
      ingredients: ingredients.map((ingredient: any) =>
        this.ingredientRepo.create({
          chemicalItem: { id: ingredient.chemicalItemId } as any,
          dosageGPerKg: num(ingredient.dosageGPerKg, 'Dosage', { required: true, min: 0.0001 }),
        }),
      ),
    });

    const saved = await this.recipeRepo.save(recipe);
    return this.getRecipeOrFail(saved.id, companyId);
  }

  listRecipes(companyId: string) {
    return this.recipeRepo.find({
      where: { company: { id: companyId } },
      relations: ['ingredients', 'ingredients.chemicalItem'],
      order: { code: 'ASC' },
    });
  }

  async getRecipeOrFail(id: string, companyId: string) {
    const recipe = await this.recipeRepo.findOne({
      where: { id, company: { id: companyId } },
      relations: ['ingredients', 'ingredients.chemicalItem'],
    });
    if (!recipe) throw new NotFoundException('Recipe not found');
    return recipe;
  }

  // Returns the required quantity (in the chemical's own unit) of each
  // ingredient for a given fabric input quantity in kg, without deducting
  // anything — used for previewing requirements before starting a batch.
  async previewRequirement(recipeId: string, companyId: string, inputQtyKg: number) {
    const recipe = await this.getRecipeOrFail(recipeId, companyId);
    const qty = num(inputQtyKg, 'Input quantity', { required: true, min: 0.001 })!;
    return recipe.ingredients.map(ingredient => ({
      chemicalItemId: ingredient.chemicalItem.id,
      name: ingredient.chemicalItem.name,
      unit: ingredient.chemicalItem.unit,
      requiredQty: Number(((Number(ingredient.dosageGPerKg) * qty) / 1000).toFixed(4)),
      currentStock: Number(ingredient.chemicalItem.currentStock),
    }));
  }

  // Deducts chemical stock for a batch based on its recipe and inputQty.
  // Called when a batch starts. Throws if any ingredient has insufficient
  // stock, so the batch is not left half-consumed.
  async consumeForBatch(batch: Batch) {
    if (!batch.recipeRef || !batch.inputQty) return;

    const companyId = (batch.company as any).id ?? batch.company;
    const recipe = await this.getRecipeOrFail((batch.recipeRef as any).id ?? batch.recipeRef, companyId);
    const inputQty = Number(batch.inputQty);

    const requirements = recipe.ingredients.map(ingredient => ({
      chemicalItem: ingredient.chemicalItem,
      requiredQty: (Number(ingredient.dosageGPerKg) * inputQty) / 1000,
    }));

    const shortfalls = requirements.filter(r => Number(r.chemicalItem.currentStock) < r.requiredQty);
    if (shortfalls.length > 0) {
      const names = shortfalls.map(s => s.chemicalItem.name).join(', ');
      throw new BadRequestException(`Insufficient stock for: ${names}`);
    }

    for (const requirement of requirements) {
      await this.recordTransaction(
        requirement.chemicalItem.id,
        companyId,
        StockTransactionType.CONSUMPTION,
        -requirement.requiredQty,
        `Batch ${batch.batchNo} (recipe ${recipe.code})`,
        batch.id,
      );
    }
  }
}
