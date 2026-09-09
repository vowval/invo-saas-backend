import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatchCost } from './batch-cost.entity';
import { Batch, BatchStatus } from '../production/batch.entity';
import { InventoryService } from '../inventory/inventory.service';
import { InvoiceItem } from '../invoices/invoice-item.entity';
import { decimal, text } from '../common/input';

const COST_FIELDS = [
  'fabricCost',
  'dyeChemicalCost',
  'electricityCost',
  'steamFuelCost',
  'waterCost',
  'labourCost',
  'machineCost',
  'otherCost',
] as const;

@Injectable()
export class CostingService {
  constructor(
    @InjectRepository(BatchCost)
    private readonly costRepo: Repository<BatchCost>,
    @InjectRepository(Batch)
    private readonly batchRepo: Repository<Batch>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepo: Repository<InvoiceItem>,
    private readonly inventoryService: InventoryService,
  ) {}

  private async findBatchOrFail(batchId: string, companyId: string) {
    const batch = await this.batchRepo.findOne({
      where: { id: batchId, company: { id: companyId } },
      relations: ['dyeingJob', 'machine'],
    });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  // Creates or updates the cost record for a batch. Chemical cost is
  // auto-filled from actual recipe consumption unless the caller
  // explicitly overrides it.
  async upsertCost(batchId: string, data: any, companyId: string) {
    const batch = await this.findBatchOrFail(batchId, companyId);

    let cost = await this.costRepo.findOne({ where: { batch: { id: batchId } } });
    if (!cost) {
      cost = this.costRepo.create({ batch, company: { id: companyId } as any });
    }

    const autoChemicalCost = await this.inventoryService.getChemicalCostForBatch(batchId, companyId);

    cost.fabricCost = numOrDefault(data.fabricCost, cost.fabricCost ?? 0);
    cost.dyeChemicalCost = data.dyeChemicalCost !== undefined && data.dyeChemicalCost !== ''
      ? decimal(data.dyeChemicalCost, 'Dye/chemical cost', { min: 0 })
      : autoChemicalCost;
    cost.electricityCost = numOrDefault(data.electricityCost, cost.electricityCost ?? 0);
    cost.steamFuelCost = numOrDefault(data.steamFuelCost, cost.steamFuelCost ?? 0);
    cost.waterCost = numOrDefault(data.waterCost, cost.waterCost ?? 0);
    cost.labourCost = numOrDefault(data.labourCost, cost.labourCost ?? 0);
    cost.machineCost = numOrDefault(data.machineCost, cost.machineCost ?? 0);
    cost.otherCost = numOrDefault(data.otherCost, cost.otherCost ?? 0);
    cost.notes = text(data.notes, 'Notes', { max: 500 });

    await this.costRepo.save(cost);
    return this.getBatchCosting(batchId, companyId);
  }

  // Full costing view for one batch: cost breakdown, total, cost/kg,
  // customer rate, and the resulting gross contribution per kg.
  async getBatchCosting(batchId: string, companyId: string) {
    const batch = await this.findBatchOrFail(batchId, companyId);
    const cost = await this.costRepo.findOne({ where: { batch: { id: batchId } } });

    const finishedQty = Number(batch.inputQty ?? 0);
    const breakdown = COST_FIELDS.reduce(
      (acc, field) => ({ ...acc, [field]: Number(cost?.[field] ?? 0) }),
      {} as Record<(typeof COST_FIELDS)[number], number>,
    );
    const totalCost = Number(
      COST_FIELDS.reduce((sum, field) => sum + breakdown[field], 0).toFixed(2),
    );
    const costPerKg = finishedQty > 0 ? Number((totalCost / finishedQty).toFixed(2)) : null;

    const customerRate = batch.dyeingJob ? await this.inferCustomerRate(batch) : null;
    const marginPerKg = costPerKg !== null && customerRate !== null
      ? Number((customerRate - costPerKg).toFixed(2))
      : null;
    const marginPercent = marginPerKg !== null && customerRate ? Number(((marginPerKg / customerRate) * 100).toFixed(1)) : null;

    return {
      batchId: batch.id,
      batchNo: batch.batchNo,
      customerName: batch.dyeingJob?.customerName ?? null,
      jobNo: batch.dyeingJob?.jobNo ?? null,
      finishedQty,
      breakdown,
      totalCost,
      costPerKg,
      customerRate,
      marginPerKg,
      marginPercent,
      notes: cost?.notes ?? '',
      hasCostRecord: !!cost,
    };
  }

  // Best-effort customer rate lookup: uses the rate already billed on any
  // invoice item for this job, falling back to null if none yet invoiced.
  private async inferCustomerRate(batch: Batch): Promise<number | null> {
    const job = batch.dyeingJob;
    if (!job) return null;
    const item = await this.invoiceItemRepo.findOne({
      where: { dyeingJob: { id: job.id } },
      order: { id: 'DESC' },
    });
    return item ? Number(item.rate) : null;
  }

  // Simple profitability report across all costed, completed batches —
  // shows the owner which customers/jobs are most (or least) profitable.
  async getProfitabilityReport(companyId: string) {
    const batches = await this.batchRepo.find({
      where: { company: { id: companyId }, status: BatchStatus.COMPLETED },
      relations: ['dyeingJob'],
      order: { endTime: 'DESC' },
    });

    const results = [];
    for (const batch of batches) {
      const costed = await this.costRepo.findOne({ where: { batch: { id: batch.id } } });
      if (!costed) continue;
      const costing = await this.getBatchCosting(batch.id, companyId);
      results.push(costing);
    }
    return results.sort((a, b) => (a.marginPerKg ?? 0) - (b.marginPerKg ?? 0));
  }
}

function numOrDefault(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') return fallback;
  return decimal(value, 'Cost', { min: 0 });
}
