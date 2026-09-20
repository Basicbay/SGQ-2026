import { ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Customer, CustomerStatus, CustomerType } from '../database/customer.entity.js';
import { CustomersService } from './customers.service.js';

describe('CustomersService', () => {
  let service: CustomersService;
  let mockRepository: any;

  const mockCustomer: Customer = {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    customerCode: 'CUST-2026-001',
    name: 'บริษัท พราวด์ บิลด์ดิ้ง จำกัด',
    customerType: CustomerType.COMPANY,
    taxId: '0105558123456',
    contactName: 'คุณสมชาย เข็มกลัด',
    phone: '0812345678',
    email: 'somchai@example.com',
    lineId: '@proudbuilding',
    address: '88/12 ถนนสุขุมวิท',
    note: 'ลูกค้า VIP',
    status: CustomerStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    mockRepository = {
      createQueryBuilder: vi.fn(),
      findOne: vi.fn(),
      findOneBy: vi.fn(),
      create: vi.fn((dto) => ({
        ...dto,
        id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      save: vi.fn((entity) => Promise.resolve({ ...mockCustomer, ...entity })),
      remove: vi.fn((entity) => Promise.resolve(entity)),
    };

    service = new CustomersService(mockRepository);
  });

  describe('findAll', () => {
    it('should return a paginated list of customers with search and filters', async () => {
      const qb: any = {
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockCustomer], 1]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({
        search: 'พราวด์',
        customerType: 'COMPANY',
        status: 'ACTIVE',
        page: 1,
        limit: 10,
      });

      expect(qb.andWhere).toHaveBeenCalledTimes(3);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].customerCode).toBe('CUST-2026-001');
      expect(result.items[0].name).toBe('บริษัท พราวด์ บิลด์ดิ้ง จำกัด');
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return customer details by id', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockCustomer);

      const result = await service.findOne(mockCustomer.id);
      expect(result.id).toBe(mockCustomer.id);
      expect(result.customerCode).toBe('CUST-2026-001');
      expect(result.name).toBe('บริษัท พราวด์ บิลด์ดิ้ง จำกัด');
    });

    it('should throw NotFoundException if customer is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new customer with provided code', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const dto = {
        customerCode: 'CUST-2026-002',
        name: 'บริษัท ก่อสร้างมั่นคง จำกัด',
        customerType: CustomerType.COMPANY,
        taxId: '0105558999999',
        contactName: 'คุณวิชัย',
        phone: '0891234567',
        email: 'wichai@example.com',
        lineId: '@wichai_line',
        address: '123 ถนนเพชรบุรี',
        note: 'งานโครงสร้าง',
        status: CustomerStatus.ACTIVE,
      };

      const result = await service.create(dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { customerCode: 'CUST-2026-002' },
      });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(result.customerCode).toBe('CUST-2026-002');
      expect(result.name).toBe('บริษัท ก่อสร้างมั่นคง จำกัด');
    });

    it('should auto-generate customerCode if not provided', async () => {
      const qb: any = {
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue({ customerCode: 'CUST-2026-0005' }),
      };
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      const dto = {
        name: 'คุณสมศักดิ์ บุญชู',
        customerType: CustomerType.INDIVIDUAL,
      };

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(result.name).toBe('คุณสมศักดิ์ บุญชู');
    });

    it('should throw ConflictException if customerCode already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomer);

      await expect(
        service.create({
          customerCode: 'CUST-2026-001',
          name: 'บริษัท ซ้ำ จำกัด',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update customer fields and return updated customer', async () => {
      mockRepository.findOneBy.mockResolvedValue({ ...mockCustomer });

      const result = await service.update(mockCustomer.id, {
        name: 'บริษัท พราวด์ บิลด์ดิ้ง (สำนักงานใหญ่)',
        phone: '0898887777',
      });

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('บริษัท พราวด์ บิลด์ดิ้ง (สำนักงานใหญ่)');
    });

    it('should throw NotFoundException if updating non-existent customer', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { name: 'ชื่อใหม่' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new customerCode conflicts with another customer', async () => {
      mockRepository.findOneBy.mockResolvedValue({ ...mockCustomer });
      mockRepository.findOne.mockResolvedValue({
        ...mockCustomer,
        id: 'different-customer-id',
        customerCode: 'CUST-2026-999',
      });

      await expect(
        service.update(mockCustomer.id, {
          customerCode: 'CUST-2026-999',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('should delete customer if exists', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockCustomer);

      const result = await service.delete(mockCustomer.id);
      expect(result.deleted).toBe(true);
      expect(result.id).toBe(mockCustomer.id);
      expect(mockRepository.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException if deleting non-existent customer', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
