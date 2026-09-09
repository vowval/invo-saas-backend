import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Company } from './company.entity';
import { text } from '../common/input';

@Controller('company')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  @Get('profile')
  getProfile(@Req() req: any) {
    return this.companyRepo.findOne({
      where: { id: req.user.companyId },
    });
  }

  @Patch('profile')
  async updateProfile(@Body() body: any, @Req() req: any) {
    const company = await this.companyRepo.findOne({
      where: { id: req.user.companyId },
    });
    if (!company) {
      throw new Error('Company profile not found');
    }

    Object.assign(company, {
      name: text(body.name, 'Factory name', { required: true, max: 150 }),
      address: text(body.address, 'Address', { max: 500 }),
      gstin: text(body.gstin, 'GSTIN', { max: 20 }).toUpperCase(),
      msmeUdyam: text(body.msmeUdyam, 'MSME Udyam number', { max: 30 }).toUpperCase(),
      bankName: text(body.bankName, 'Bank name', { max: 100 }),
      branchName: text(body.branchName, 'Branch name', { max: 100 }),
      accountNo: text(body.accountNo, 'Account number', { max: 30 }),
      ifsc: text(body.ifsc, 'IFSC code', { max: 20 }).toUpperCase(),
      allowServiceArchive: body.allowServiceArchive === true,
      invoicePrefix: text(body.invoicePrefix || 'INV', 'Invoice prefix', { required: true, max: 20 })
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, ''),
    });
    return this.companyRepo.save(company);
  }
}
