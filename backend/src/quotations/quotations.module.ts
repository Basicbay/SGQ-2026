import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { Customer } from '../database/customer.entity.js';
import { Project } from '../database/project.entity.js';
import { Product } from '../database/product.entity.js';
import { Quotation, QuotationItem } from '../database/quotation.entity.js';
import { User } from '../database/user.entity.js';
import { QuotationsController } from './quotations.controller.js';
import { QuotationsService } from './quotations.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quotation,
      QuotationItem,
      Customer,
      Project,
      Product,
      User,
    ]),
    AuthModule,
  ],
  controllers: [QuotationsController],
  providers: [QuotationsService],
  exports: [QuotationsService],
})
export class QuotationsModule {}
