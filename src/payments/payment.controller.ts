import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentService } from './payment.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  create(@Body() body: any, @Req() req) {
    return this.paymentService.create(body, req.user.companyId);
  }

  @Get()
  findAll(@Req() req) {
    return this.paymentService.findAll(req.user.companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.paymentService.remove(id, req.user.companyId);
  }
}

// Separate resource for the customer-level "who owes me money" ledger view.
@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerLedgerController {
  constructor(private paymentService: PaymentService) {}

  @Get()
  listCustomers(@Req() req) {
    return this.paymentService.listCustomers(req.user.companyId);
  }

  @Get(':customerName/ledger')
  getLedger(@Param('customerName') customerName: string, @Req() req) {
    return this.paymentService.getCustomerLedger(decodeURIComponent(customerName), req.user.companyId);
  }
}
