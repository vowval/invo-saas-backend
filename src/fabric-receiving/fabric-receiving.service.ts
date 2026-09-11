import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FabricReceipt } from './fabric-receipt.entity';
import { ReceiptLot } from './receipt-lot.entity';
import { ReceiptRoll } from './receipt-roll.entity';
import { DyeingJob, DyeingJobStatus, TrackingStatus } from '../dyeing-jobs/dyeing-job.entity';
import { Company } from '../companies/company.entity';

export interface CreateFabricReceiptDto {
  customerName: string;
  customerDcNumber: string;
  customerReference?: string;
  receiptDate: string;
  vehicleNumber?: string;
  transporter?: string;
  fabricType: string;
  fabricConstruction?: string;
  composition?: string;
  colour?: string;
  grossWeight: number;
  tareWeight?: number;
  netWeight: number;
  uom: string;
  receivedBy: string;
  remarks?: string;
  attachmentPaths?: string[];
  lots: CreateReceiptLotDto[];
}

export interface CreateReceiptLotDto {
  lotNumber: string;
  rolls: CreateReceiptRollDto[];
}

export interface CreateReceiptRollDto {
  rollNumber: string;
  weight: number;
}

@Injectable()
export class FabricReceivingService {
  constructor(
    @InjectRepository(FabricReceipt)
    private receiptRepository: Repository<FabricReceipt>,
    @InjectRepository(ReceiptLot)
    private lotRepository: Repository<ReceiptLot>,
    @InjectRepository(ReceiptRoll)
    private rollRepository: Repository<ReceiptRoll>,
    @InjectRepository(DyeingJob)
    private jobRepository: Repository<DyeingJob>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  /**
   * Generate unique job number
   * Format: JOB-YYYY-XXXXXX
   */
  private async generateJobNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const lastJob = await this.jobRepository.findOne({
      where: { company: { id: companyId } },
      order: { createdAt: 'DESC' },
    });

    let sequenceNumber = 1;
    if (lastJob && lastJob.jobNo) {
      const match = lastJob.jobNo.match(/JOB-\d+-(\d+)/);
      if (match) {
        sequenceNumber = parseInt(match[1], 10) + 1;
      }
    }

    const paddedNumber = String(sequenceNumber).padStart(6, '0');
    return `JOB-${year}-${paddedNumber}`;
  }

  /**
   * Create a complete fabric receipt with job
   * Ensures material traceability from receiving onward
   */
  async createFabricReceipt(
    companyId: string,
    dto: CreateFabricReceiptDto,
  ): Promise<{ job: DyeingJob; receipt: FabricReceipt }> {
    try {
      console.log('Step 1: Finding company with ID:', companyId);
      const company = await this.companyRepository.findOne({ where: { id: companyId } });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      console.log('Step 1 ✓: Company found:', company.id);

      // Validate data
      if (dto.lots.length === 0) {
        throw new BadRequestException('At least one lot is required');
      }

      // Calculate total weight from all lots
      let totalWeight = 0;
      for (const lot of dto.lots) {
        for (const roll of lot.rolls) {
          totalWeight += roll.weight;
        }
      }

      // Verify weight consistency
      if (Math.abs(totalWeight - dto.netWeight) > 0.1) {
        throw new BadRequestException(
          `Total roll weight (${totalWeight}) does not match net weight (${dto.netWeight})`,
        );
      }

      // Generate job number
      console.log('Step 2: Generating job number');
      const jobNo = await this.generateJobNumber(companyId);
      console.log('Step 2 ✓: Job number generated:', jobNo);

      // Create Job
      console.log('Step 3: Creating DyeingJob');
      const job = this.jobRepository.create({
        jobNo,
        customerName: dto.customerName,
        fabricType: dto.fabricType,
        colour: dto.colour,
        unit: dto.uom,
        quantityReceived: dto.netWeight, // INITIAL RECEIVED QUANTITY - IMMUTABLE
        quantityDelivered: 0,
        partyDcNo: dto.customerDcNumber,
        receivedDate: new Date(dto.receiptDate),
        status: DyeingJobStatus.RECEIVED,
        trackingStatus: TrackingStatus.FABRIC_RECEIVED,
        company,
      });

      const savedJob = await this.jobRepository.save(job);
      console.log('Step 3 ✓: DyeingJob saved:', savedJob.id);

      // Create FabricReceipt
      console.log('Step 4: Creating FabricReceipt');
      const receipt = this.receiptRepository.create({
        job: savedJob,
        customerDcNumber: dto.customerDcNumber,
        customerReference: dto.customerReference,
        receiptDate: new Date(dto.receiptDate),
        vehicleNumber: dto.vehicleNumber,
        transporter: dto.transporter,
        fabricType: dto.fabricType,
        fabricConstruction: dto.fabricConstruction,
        composition: dto.composition,
        colour: dto.colour,
        grossWeight: dto.grossWeight,
        tareWeight: dto.tareWeight,
        netWeight: dto.netWeight,
        uom: dto.uom,
        receivedBy: dto.receivedBy,
        remarks: dto.remarks,
        attachmentPaths: dto.attachmentPaths,
        company,
        lots: [],
      });

      // Save receipt first
      const savedReceipt = await this.receiptRepository.save(receipt);
      console.log('Step 4 ✓: FabricReceipt saved:', savedReceipt.id);

      // Create lots with rolls
      console.log('Step 5: Creating lots and rolls');
      const savedLots: ReceiptLot[] = [];
      for (const lotDto of dto.lots) {
        const lot = this.lotRepository.create({
          receipt: savedReceipt,
          lotNumber: lotDto.lotNumber,
          numberOfRolls: lotDto.rolls.length,
          totalWeight: lotDto.rolls.reduce((sum, roll) => sum + roll.weight, 0),
          uom: dto.uom,
          rolls: [],
        });

        const savedLot = await this.lotRepository.save(lot);

        // Create rolls
        const savedRolls: ReceiptRoll[] = [];
        for (const rollDto of lotDto.rolls) {
          const roll = this.rollRepository.create({
            lot: savedLot,
            rollNumber: rollDto.rollNumber,
            weight: rollDto.weight,
            uom: dto.uom,
            isActive: true,
          });
          const savedRoll = await this.rollRepository.save(roll);
          savedRolls.push(savedRoll);
        }

        savedLot.rolls = savedRolls;
        savedLots.push(savedLot);
      }
      console.log('Step 5 ✓: Lots and rolls created');

      console.log('✅ Fabric receipt creation completed successfully');
      return { job: savedJob, receipt: savedReceipt };
    } catch (error) {
      console.error('❌ Error in createFabricReceipt:', error);
      throw error;
    }
  }

  /**
   * Get fabric receipt details with all lots and rolls
   */
  async getFabricReceipt(receiptId: string, companyId: string): Promise<FabricReceipt> {
    const receipt = await this.receiptRepository.findOne({
      where: { id: receiptId, company: { id: companyId } },
      relations: ['job', 'lots', 'lots.rolls', 'company'],
    });

    if (!receipt) {
      throw new NotFoundException('Fabric receipt not found');
    }

    return receipt;
  }

  /**
   * Get all fabric receipts for a job
   */
  async getJobReceipts(jobId: string, companyId: string): Promise<FabricReceipt[]> {
    return this.receiptRepository.find({
      where: { job: { id: jobId }, company: { id: companyId } },
      relations: ['lots', 'lots.rolls'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all fabric receipts for a company
   */
  async getCompanyReceipts(companyId: string, limit = 50, offset = 0): Promise<{
    data: FabricReceipt[];
    total: number;
  }> {
    const [data, total] = await this.receiptRepository.findAndCount({
      where: { company: { id: companyId } },
      relations: ['job', 'lots'],
      order: { receiptDate: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { data, total };
  }

  /**
   * Get material traceability for a job
   * Shows received quantity and all subsequent process quantities
   */
  async getMaterialTraceability(jobId: string, companyId: string) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId, company: { id: companyId } },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const receipts = await this.receiptRepository.find({
      where: { job: { id: jobId } },
      relations: ['lots', 'lots.rolls'],
    });

    return {
      jobNo: job.jobNo,
      customerName: job.customerName,
      fabricType: job.fabricType,
      receivedQuantity: job.quantityReceived, // IMMUTABLE SOURCE OF TRUTH
      uom: job.unit,
      receipts,
      // TODO: Add process stages (dyeing input/output, washing, etc.)
    };
  }

  /**
   * Mark fabric receipt as inspected
   * Moves job to INSPECTION status
   */
  async completeReception(receiptId: string, companyId: string): Promise<DyeingJob> {
    const receipt = await this.receiptRepository.findOne({
      where: { id: receiptId, company: { id: companyId } },
      relations: ['job'],
    });

    if (!receipt) {
      throw new NotFoundException('Fabric receipt not found');
    }

    const job = receipt.job;
    job.trackingStatus = TrackingStatus.FABRIC_INSPECTION;
    job.status = DyeingJobStatus.IN_PROCESS;

    return this.jobRepository.save(job);
  }
}
