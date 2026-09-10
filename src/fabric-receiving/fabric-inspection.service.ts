import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FabricInspection, InspectionResult } from './fabric-inspection.entity';
import { InspectionCheckpoint, CheckpointStatus } from './inspection-checkpoint.entity';
import { FabricReceipt } from './fabric-receipt.entity';
import { DyeingJob, TrackingStatus } from '../dyeing-jobs/dyeing-job.entity';

@Injectable()
export class FabricInspectionService {
  constructor(
    @InjectRepository(FabricInspection)
    private readonly inspectionRepo: Repository<FabricInspection>,
    @InjectRepository(InspectionCheckpoint)
    private readonly checkpointRepo: Repository<InspectionCheckpoint>,
    @InjectRepository(FabricReceipt)
    private readonly receiptRepo: Repository<FabricReceipt>,
    @InjectRepository(DyeingJob)
    private readonly jobRepo: Repository<DyeingJob>,
  ) {}

  async createInspection(receiptId: string, data: any, companyId: string) {
    const receipt = await this.receiptRepo.findOne({
      where: { id: receiptId, company: { id: companyId } },
      relations: ['job'],
    });

    if (!receipt) {
      throw new NotFoundException('Fabric receipt not found');
    }

    if (!receipt.job) {
      throw new BadRequestException('Receipt must be linked to a job');
    }

    // Check if inspection already exists and has PASS/REJECT result
    const existingInspection = await this.inspectionRepo.findOne({
      where: { receipt: { id: receiptId } },
    });

    if (existingInspection && (existingInspection.result === InspectionResult.PASS || existingInspection.result === InspectionResult.REJECT)) {
      throw new BadRequestException('Cannot modify inspection with PASS or REJECT result. Create a new inspection record instead.');
    }

    const inspection = this.inspectionRepo.create({
      receipt,
      inspectorName: data.inspectorName,
      inspectionDateTime: data.inspectionDateTime || new Date(),
      remarks: data.remarks,
      gsm: data.gsm,
      width: data.width,
      fabricTypeVerified: data.fabricTypeVerified,
      compositionVerified: data.compositionVerified,
      weightVerified: data.weightVerified,
      visibleDefects: data.visibleDefects,
      contamination: data.contamination,
      moistureCondition: data.moistureCondition,
      lotConsistency: data.lotConsistency,
      shadeConsistency: data.shadeConsistency,
      rollCountVerified: data.rollCountVerified,
      actualRollCount: data.actualRollCount,
      photoPaths: data.photoPaths || [],
      company: { id: companyId },
    });

    const savedInspection = await this.inspectionRepo.save(inspection);

    // Add checkpoints if provided
    if (data.checkpoints && Array.isArray(data.checkpoints)) {
      const checkpoints = data.checkpoints.map((cp) =>
        this.checkpointRepo.create({
          inspection: savedInspection,
          checkType: cp.checkType,
          status: cp.status,
          specification: cp.specification,
          actualValue: cp.actualValue,
          notes: cp.notes,
          isOptional: cp.isOptional || false,
        }),
      );
      await this.checkpointRepo.save(checkpoints);
    }

    return this.getInspectionById(savedInspection.id, companyId);
  }

  async submitInspectionResult(inspectionId: string, result: InspectionResult, companyId: string) {
    const inspection = await this.inspectionRepo.findOne({
      where: { id: inspectionId, company: { id: companyId } },
      relations: ['receipt', 'receipt.job', 'checkpoints'],
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    // Validate all mandatory checkpoints are filled if submitting result
    if (result !== InspectionResult.HOLD) {
      const mandatoryCheckpoints = inspection.checkpoints.filter((cp) => !cp.isOptional);
      const incompleteMandatory = mandatoryCheckpoints.filter((cp) => !cp.status);
      
      if (incompleteMandatory.length > 0) {
        throw new BadRequestException(
          `Cannot submit inspection: ${incompleteMandatory.length} mandatory checkpoints incomplete`,
        );
      }
    }

    inspection.result = result;

    // Update job tracking status based on inspection result
    if (result === InspectionResult.PASS) {
      inspection.receipt.job.trackingStatus = TrackingStatus.JOB_CARD_PRODUCTION_ORDER;
    } else if (result === InspectionResult.REJECT) {
      inspection.receipt.job.trackingStatus = TrackingStatus.FABRIC_INSPECTION;
    }
    // HOLD keeps current status

    await this.inspectionRepo.save(inspection);
    if (result === InspectionResult.PASS || result === InspectionResult.REJECT) {
      await this.jobRepo.save(inspection.receipt.job);
    }

    return this.getInspectionById(inspectionId, companyId);
  }

  async getInspectionById(inspectionId: string, companyId: string) {
    const inspection = await this.inspectionRepo.findOne({
      where: { id: inspectionId, company: { id: companyId } },
      relations: ['receipt', 'receipt.job', 'checkpoints'],
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    return inspection;
  }

  async getReceiptInspections(receiptId: string, companyId: string) {
    const inspections = await this.inspectionRepo.find({
      where: { receipt: { id: receiptId }, company: { id: companyId } },
      relations: ['checkpoints'],
      order: { createdAt: 'DESC' },
    });

    return inspections;
  }

  async getJobInspectionHistory(jobId: string, companyId: string) {
    const job = await this.jobRepo.findOne({
      where: { id: jobId, company: { id: companyId } },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Get all receipts for this job
    const receipts = await this.receiptRepo.find({
      where: { job: { id: jobId }, company: { id: companyId } },
      relations: ['inspections'],
    });

    // Flatten inspections from all receipts
    const allInspections = receipts.flatMap((r) => r.inspections || []);
    
    return allInspections.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addCheckpoint(inspectionId: string, checkpointData: any, companyId: string) {
    const inspection = await this.inspectionRepo.findOne({
      where: { id: inspectionId, company: { id: companyId } },
      relations: ['checkpoints'],
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    if (inspection.result === InspectionResult.PASS || inspection.result === InspectionResult.REJECT) {
      throw new BadRequestException('Cannot modify inspection with PASS or REJECT result');
    }

    const checkpoint = this.checkpointRepo.create({
      inspection,
      checkType: checkpointData.checkType,
      status: checkpointData.status,
      specification: checkpointData.specification,
      actualValue: checkpointData.actualValue,
      notes: checkpointData.notes,
      isOptional: checkpointData.isOptional || false,
    });

    return this.checkpointRepo.save(checkpoint);
  }

  async updateCheckpoint(checkpointId: string, data: any, companyId: string) {
    const checkpoint = await this.checkpointRepo.findOne({
      where: { id: checkpointId },
      relations: ['inspection', 'inspection.company'],
    });

    if (!checkpoint) {
      throw new NotFoundException('Checkpoint not found');
    }

    if (checkpoint.inspection.company.id !== companyId) {
      throw new BadRequestException('Unauthorized access');
    }

    // Prevent changes to finalized inspections
    if (checkpoint.inspection.result === InspectionResult.PASS || checkpoint.inspection.result === InspectionResult.REJECT) {
      throw new BadRequestException('Cannot modify checkpoint in finalized inspection');
    }

    checkpoint.status = data.status || checkpoint.status;
    checkpoint.specification = data.specification || checkpoint.specification;
    checkpoint.actualValue = data.actualValue || checkpoint.actualValue;
    checkpoint.notes = data.notes || checkpoint.notes;

    return this.checkpointRepo.save(checkpoint);
  }

  async getInspectionSummary(receiptId: string, companyId: string) {
    const inspections = await this.getReceiptInspections(receiptId, companyId);

    if (inspections.length === 0) {
      return null;
    }

    const latestInspection = inspections[0];
    const passedCheckpoints = latestInspection.checkpoints.filter((cp) => cp.status === CheckpointStatus.PASS).length;
    const failedCheckpoints = latestInspection.checkpoints.filter((cp) => cp.status === CheckpointStatus.FAIL).length;
    const totalMandatory = latestInspection.checkpoints.filter((cp) => !cp.isOptional).length;

    return {
      inspectionId: latestInspection.id,
      result: latestInspection.result,
      inspectorName: latestInspection.inspectorName,
      inspectionDateTime: latestInspection.inspectionDateTime,
      passedCheckpoints,
      failedCheckpoints,
      totalCheckpoints: latestInspection.checkpoints.length,
      totalMandatory,
      canProceed: latestInspection.result === InspectionResult.PASS,
      canRetry: latestInspection.result === InspectionResult.REJECT || latestInspection.result === InspectionResult.HOLD,
    };
  }
}
