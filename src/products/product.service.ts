import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Company } from '../companies/company.entity';
import { decimal, text } from '../common/input';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
  ) {}

  create(data: any, company: Company) {
    const name = text(data.name, 'Service name', { required: true, max: 120 });
    const description = text(data.description, 'Description', { max: 500 });
    const hsnCode = text(data.hsnCode, 'SAC code', { max: 20 });
    const unit = text(data.unit, 'Unit', { required: true, max: 10 }).toUpperCase();
    const rate = decimal(data.rate, 'Rate', { min: 0, max: 100000000 });
    const product = this.productRepo.create({
      name,
      description,
      hsnCode,
      unit,
      rate,
      company,
      active: true,
    });
    return this.productRepo.save(product);
  }

  findAll(companyId: string) {
    return this.productRepo.find({
      where: { company: { id: companyId }, active: true },
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: string, companyId: string) {
    return this.productRepo.findOne({
      where: { id, company: { id: companyId } },
    });
  }

  async update(id: string, data: any, companyId: string) {
    const product = await this.productRepo.findOne({
      where: { id, company: { id: companyId } },
    });
    if (!product) {
      throw new BadRequestException('Service not found');
    }
    Object.assign(product, {
      name: text(data.name, 'Service name', { required: true, max: 120 }),
      description: text(data.description, 'Description', { max: 500 }),
      hsnCode: text(data.hsnCode, 'SAC code', { max: 20 }),
      unit: text(data.unit, 'Unit', { required: true, max: 10 }).toUpperCase(),
      rate: decimal(data.rate, 'Rate', { min: 0, max: 100000000 }),
    });
    return this.productRepo.save(product);
  }

  async remove(id: string, companyId: string) {
    const product = await this.findOne(id, companyId);
    if (!product) {
      throw new BadRequestException('Service not found');
    }
    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company?.allowServiceArchive) {
      throw new BadRequestException(
        'Service archiving is disabled. Enable it in Settings first.',
      );
    }

    product.active = false;
    return this.productRepo.save(product);
  }
}
