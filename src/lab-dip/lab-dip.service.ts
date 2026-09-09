import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabDip, LabDipStatus } from './lab-dip.entity';
import { LabDipSample, LabDipSampleStatus } from './lab-dip-sample.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { Recipe } from '../inventory/recipe.entity';
import { text } from '../common/input';

@Injectable()
export class LabDipService {
  constructor(
    @InjectRepository(LabDip) private readonly labDipRepo: Repository<LabDip>,
    @InjectRepository(LabDipSample) private readonly sampleRepo: Repository<LabDipSample>,
    @InjectRepository(DyeingJob) private readonly jobRepo: Repository<DyeingJob>,
    @InjectRepository(Recipe) private readonly recipeRepo: Repository<Recipe>,
  ) {}

  async create(data: any, companyId: string) {
    let dyeingJob: DyeingJob | null = null;
    if (data.dyeingJobId) {
      dyeingJob = await this.jobRepo.findOne({ where: { id: data.dyeingJobId, company: { id: companyId } } });
      if (!dyeingJob) throw new NotFoundException('Dyeing job not found');
    }

    const labDip = this.labDipRepo.create({
      labDipNo: text(data.labDipNo, 'Lab dip number', { required: true, max: 50 }),
      dyeingJob,
      customerName: text(data.customerName, 'Customer name', { max: 200 }) || dyeingJob?.customerName,
      colour: text(data.colour, 'Colour', { max: 100 }),
      status: LabDipStatus.IN_PROGRESS,
      company: { id: companyId } as any,
    });
    return this.labDipRepo.save(labDip);
  }

  list(companyId: string) {
    return this.labDipRepo.find({
      where: { company: { id: companyId } },
      relations: ['dyeingJob', 'samples', 'samples.recipeRef', 'productionRecipe'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOrFail(id: string, companyId: string) {
    const labDip = await this.labDipRepo.findOne({
      where: { id, company: { id: companyId } },
      relations: ['dyeingJob', 'samples', 'samples.recipeRef', 'productionRecipe'],
    });
    if (!labDip) throw new NotFoundException('Lab dip not found');
    return labDip;
  }

  async addSample(labDipId: string, data: any, companyId: string) {
    const labDip = await this.findOrFail(labDipId, companyId);
    if (labDip.status !== LabDipStatus.IN_PROGRESS) {
      throw new BadRequestException('This lab dip is already finalized');
    }

    let recipeRef: Recipe | null = null;
    if (data.recipeId) {
      recipeRef = await this.recipeRepo.findOne({ where: { id: data.recipeId, company: { id: companyId } } });
      if (!recipeRef) throw new NotFoundException('Recipe not found');
    }

    const nextSampleNo = (labDip.samples?.length ?? 0) + 1;

    const sample = this.sampleRepo.create({
      labDip: { id: labDipId } as any,
      sampleNo: nextSampleNo,
      recipeRef,
      recipeNotes: text(data.recipeNotes, 'Recipe notes'),
      photoUrl: text(data.photoUrl, 'Photo URL'),
      remarks: text(data.remarks, 'Remarks'),
      status: LabDipSampleStatus.PENDING,
    });
    return this.sampleRepo.save(sample);
  }

  async decideSample(labDipId: string, sampleId: string, decision: 'APPROVED' | 'REJECTED', companyId: string) {
    const labDip = await this.findOrFail(labDipId, companyId);
    if (labDip.status !== LabDipStatus.IN_PROGRESS) {
      throw new BadRequestException('This lab dip is already finalized');
    }

    const sample = labDip.samples.find(s => s.id === sampleId);
    if (!sample) throw new NotFoundException('Sample not found');

    sample.status = decision === 'APPROVED' ? LabDipSampleStatus.APPROVED : LabDipSampleStatus.REJECTED;
    await this.sampleRepo.save(sample);

    if (decision === 'APPROVED') {
      labDip.status = LabDipStatus.APPROVED;
      labDip.shadeCode = sample.recipeRef?.code ?? labDip.shadeCode;
      labDip.productionRecipe = sample.recipeRef ?? null;
      await this.labDipRepo.save(labDip);
    }

    return this.findOrFail(labDipId, companyId);
  }

  // Links the approved sample's recipe onto the lab dip's DyeingJob so
  // the production team doesn't have to recreate it manually — future
  // batches created for this job can default to this recipe.
  async promoteToProduction(labDipId: string, companyId: string) {
    const labDip = await this.findOrFail(labDipId, companyId);
    if (labDip.status !== LabDipStatus.APPROVED) {
      throw new BadRequestException('Only an approved lab dip can be promoted to production');
    }
    if (!labDip.productionRecipe) {
      throw new BadRequestException('The approved sample has no linked recipe to promote');
    }
    return labDip;
  }
}
