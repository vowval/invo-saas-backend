import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductService } from './product.service';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  create(@Body() body: any, @Req() req) {
    return this.productService.create(body, {
      id: req.user.companyId,
    } as any);
  }

  @Get()
  findAll(@Req() req) {
    return this.productService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.productService.findOne(id, req.user.companyId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req) {
    return this.productService.update(id, body, req.user.companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.productService.remove(id, req.user.companyId);
  }
}
