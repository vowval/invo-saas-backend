import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Company } from '../companies/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Company])],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
