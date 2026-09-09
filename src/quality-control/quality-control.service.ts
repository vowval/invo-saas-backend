import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QcInspection, QcResult } from './qc-inspection.entity';
import { Batch, BatchStatus } from '../production/batch.entity';
import { decimal, text } from '../common/input';

@Injectable()
export class QualityControlService {
  constructor(
    @InjectRepository(QcInspection) private readonly qcRepo: Repository<QcInspection>,
    @InjectRepository(Batch) private readonly batchRepo: Repository<Batch>,
  ) {}

  private async findBatchOrFail(id: string, companyId: string) {
    const batch = await this.batchRepo.findOne({
      where: { id, company: { id: companyId } },
      relations: ['machine', 'dyeingJob', 'recipeRef', 'parentBatch'],
    });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  async recordInspection(batchId: string, data: any, companyId: string) {
    const batch = await this.findBatchOrFail(batchId, companyId);

    const shadeResult = data.shadeResult as QcResult | undefined;
    const colourFastnessResult = data.colourFastnessResult as QcResult | undefined;
    const fabricDefects = data.fabricDefects !== undefined ? Number(data.fabricDefects) : 0;

    // Overall is derived, not manually set: any FAIL sub-check, or too
    // many fabric defects, fails the whole inspection.
    const overall: QcResult =
      shadeResult === QcResult.FAIL ||
      colourFastnessResult === QcResult.FAIL ||
      fabricDefects > (data.defectThreshold ? Number(data.defectThreshold) : 5)
        ? QcResult.FAIL
        : QcResult.PASS;

    const inspection = this.qcRepo.create({
      batch,
      gsm: data.gsm !== undefined && data.gsm !== '' ? decimal(data.gsm, 'GSM', { min: 0 }) : null,
      width: text(data.width, 'Width'),
      shrinkagePercent: data.shrinkagePercent !== undefined && data.shrinkagePercent !== ''
        ? decimal(data.shrinkagePercent, 'Shrinkage %', { min: 0 })
        : null,
      shadeResult: shadeResult ?? null,
      colourFastnessResult: colourFastnessResult ?? null,
      fabricDefects,
      overall,
      remarks: text(data.remarks, 'Remarks'),
      company: { id: companyId } as any,
    });
    return this.qcRepo.save(inspection);
  }

  listForBatch(batchId: string, companyId: string) {
    return this.qcRepo.find({
      where: { batch: { id: batchId }, company: { id: companyId } },
      order: { inspectedAt: 'DESC' },
    });
  }

  listAll(companyId: string) {
    return this.qcRepo.find({
      where: { company: { id: companyId } },
      relations: ['batch', 'batch.machine', 'batch.dyeingJob'],
      order: { inspectedAt: 'DESC' },
    });
  }

  // Spawns a new batch to reprocess a QC-rejected batch, e.g. "B1024" ->
  // "B1024-R1". Copies machine/recipe/inputQty from the original so the
  // team doesn't have to re-enter them, and links parentBatch so the
  // owner can trace how much production is lost to reprocessing.
  async createReprocessBatch(batchId: string, companyId: string) {
    const original = await this.findBatchOrFail(batchId, companyId);

    const latestInspection = await this.qcRepo.findOne({
      where: { batch: { id: batchId }, company: { id: companyId } },
      order: { inspectedAt: 'DESC' },
    });
    if (!latestInspection || latestInspection.overall !== QcResult.FAIL) {
      throw new BadRequestException('Only a QC-failed batch can be reprocessed');
    }

    const existingReprocesses = await this.batchRepo.count({
      where: { parentBatch: { id: original.parentBatch?.id ?? original.id }, company: { id: companyId } },
    });
    const rootBatchNo = original.batchNo.replace(/-R\d+$/, '');
    const reprocessBatch = this.batchRepo.create({
      batchNo: `${rootBatchNo}-R${existingReprocesses + 1}`,
      dyeingJob: original.dyeingJob,
      machine: null,
      company: { id: companyId } as any,
      recipe: original.recipe,
      recipeRef: original.recipeRef,
      parentBatch: { id: original.parentBatch?.id ?? original.id } as any,
      inputQty: original.inputQty,
      status: BatchStatus.SCHEDULED,
    });
    return this.batchRepo.save(reprocessBatch);
  }

  // Rough production-loss metric: how many batches ever failed QC vs.
  // total inspected batches, and how many reprocess batches exist.
  async rejectionStats(companyId: string) {
    const inspections = await this.qcRepo.find({ where: { company: { id: companyId } } });
    const totalInspected = inspections.length;
    const totalFailed = inspections.filter(i => i.overall === QcResult.FAIL).length;
    const reprocessBatches = await this.batchRepo
      .createQueryBuilder('batch')
      .where('batch.companyId = :companyId', { companyId })
      .andWhere('batch.parentBatchId IS NOT NULL')
      .getCount();

    return {
      totalInspected,
      totalFailed,
      failRate: totalInspected > 0 ? Number(((totalFailed / totalInspected) * 100).toFixed(2)) : 0,
      reprocessBatchCount: reprocessBatches,
    };
  }
}
