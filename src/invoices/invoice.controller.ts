import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InvoiceService } from './invoice.service';
import { InvoicePdfService } from './invoice-pdf.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(
    private invoiceService: InvoiceService,
    private invoicePdfService: InvoicePdfService,
  ) {}

  @Post()
  create(@Body() body: any, @Req() req) {
    return this.invoiceService.create(body, req.user.companyId);
  }

  @Get()
  findAll(@Req() req) {
    return this.invoiceService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.invoiceService.findOne(id, req.user.companyId);
  }

  // ✅ ADD THIS
  @Get(':id/pdf')
  getPdf(@Param('id') id: string, @Req() req, @Res() res) {
    return this.invoicePdfService.generate(
      id,
      req.user.companyId,
      res,
    );
  }
}
