import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { Customer } from '../database/customer.entity.js';
import { Project } from '../database/project.entity.js';
import { Product } from '../database/product.entity.js';
import { Quotation } from '../database/quotation.entity.js';
import { User } from '../database/user.entity.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quotation,
      Customer,
      Project,
      Product,
      User,
    ]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
