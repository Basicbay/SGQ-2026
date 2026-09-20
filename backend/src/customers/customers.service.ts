import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer, CustomerStatus, CustomerType } from '../database/customer.entity.js';
import type {
  CreateCustomerDto,
  CustomerItemResponse,
  CustomerListResponse,
  CustomerQueryDto,
  DeleteCustomerResponse,
  UpdateCustomerDto,
} from './customer.dto.js';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  private mapCustomerResponse(customer: Customer): CustomerItemResponse {
    return {
      id: customer.id,
      customerCode: customer.customerCode,
      name: customer.name,
      customerType: customer.customerType,
      taxId: customer.taxId,
      contactName: customer.contactName,
      phone: customer.phone,
      email: customer.email,
      lineId: customer.lineId ?? null,
      address: customer.address,
      note: customer.note,
      status: customer.status,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  private async generateCustomerCode(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `CUST-${currentYear}-`;
    const latest = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.customer_code LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('customer.customer_code', 'DESC')
      .getOne();

    let nextSeq = 1;
    if (latest && latest.customerCode) {
      const parts = latest.customerCode.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(num)) {
        nextSeq = num + 1;
      }
    }
    return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  }

  async findAll(query: CustomerQueryDto): Promise<CustomerListResponse> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const qb = this.customerRepository.createQueryBuilder('customer');

    if (query.search && query.search.trim() !== '') {
      const s = `%${query.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(customer.customer_code) LIKE :s OR LOWER(customer.name) LIKE :s OR LOWER(COALESCE(customer.tax_id, \'\')) LIKE :s OR LOWER(COALESCE(customer.contact_name, \'\')) LIKE :s OR LOWER(COALESCE(customer.phone, \'\')) LIKE :s OR LOWER(COALESCE(customer.email, \'\')) LIKE :s OR LOWER(COALESCE(customer.line_id, \'\')) LIKE :s)',
        { s },
      );
    }

    if (query.customerType && query.customerType.trim() !== '') {
      qb.andWhere('customer.customer_type = :customerType', {
        customerType: query.customerType.trim(),
      });
    }

    if (query.status && query.status.trim() !== '') {
      qb.andWhere('customer.status = :status', {
        status: query.status.trim(),
      });
    }

    qb.orderBy('customer.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((c) => this.mapCustomerResponse(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<CustomerItemResponse> {
    const customer = await this.customerRepository.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException('ไม่พบข้อมูลลูกค้าที่ระบุ');
    }
    return this.mapCustomerResponse(customer);
  }

  async create(dto: CreateCustomerDto): Promise<CustomerItemResponse> {
    let customerCode = dto.customerCode?.trim();
    if (!customerCode) {
      customerCode = await this.generateCustomerCode();
    } else {
      const existing = await this.customerRepository.findOne({
        where: { customerCode },
      });
      if (existing) {
        throw new ConflictException('รหัสลูกค้านี้มีอยู่ในระบบแล้ว');
      }
    }

    const customer = this.customerRepository.create({
      customerCode,
      name: dto.name.trim(),
      customerType: dto.customerType || CustomerType.COMPANY,
      taxId: dto.taxId?.trim() || null,
      contactName: dto.contactName?.trim() || null,
      phone: dto.phone?.trim() || null,
      email: dto.email?.trim() || null,
      lineId: dto.lineId?.trim() || null,
      address: dto.address?.trim() || null,
      note: dto.note?.trim() || null,
      status: dto.status || CustomerStatus.ACTIVE,
    });

    const saved = await this.customerRepository.save(customer);
    return this.mapCustomerResponse(saved);
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<CustomerItemResponse> {
    const customer = await this.customerRepository.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException('ไม่พบข้อมูลลูกค้าที่ระบุ');
    }

    if (dto.customerCode && dto.customerCode.trim() !== customer.customerCode) {
      const newCode = dto.customerCode.trim();
      const existing = await this.customerRepository.findOne({
        where: { customerCode: newCode },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('รหัสลูกค้านี้มีอยู่ในระบบแล้ว');
      }
      customer.customerCode = newCode;
    }

    if (dto.name !== undefined) {
      customer.name = dto.name.trim();
    }
    if (dto.customerType !== undefined) {
      customer.customerType = dto.customerType;
    }
    if (dto.taxId !== undefined) {
      customer.taxId = dto.taxId?.trim() || null;
    }
    if (dto.contactName !== undefined) {
      customer.contactName = dto.contactName?.trim() || null;
    }
    if (dto.phone !== undefined) {
      customer.phone = dto.phone?.trim() || null;
    }
    if (dto.email !== undefined) {
      customer.email = dto.email?.trim() || null;
    }
    if (dto.lineId !== undefined) {
      customer.lineId = dto.lineId?.trim() || null;
    }
    if (dto.address !== undefined) {
      customer.address = dto.address?.trim() || null;
    }
    if (dto.note !== undefined) {
      customer.note = dto.note?.trim() || null;
    }
    if (dto.status !== undefined) {
      customer.status = dto.status;
    }

    const updated = await this.customerRepository.save(customer);
    return this.mapCustomerResponse(updated);
  }

  async delete(id: string): Promise<DeleteCustomerResponse> {
    const customer = await this.customerRepository.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException('ไม่พบข้อมูลลูกค้าที่ระบุ');
    }

    await this.customerRepository.remove(customer);
    return {
      deleted: true,
      id,
    };
  }
}
