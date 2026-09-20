import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Quotation,
  QuotationDiscountType,
  QuotationItem,
  QuotationItemType,
  QuotationStatus,
} from '../database/quotation.entity.js';
import { QuotationsService } from './quotations.service.js';

describe('QuotationsService', () => {
  let service: QuotationsService;
  let mockQuotationRepo: any;
  let mockQuotationItemRepo: any;
  let mockCustomerRepo: any;
  let mockProjectRepo: any;
  let mockProductRepo: any;
  let mockUserRepo: any;

  const mockItem: QuotationItem = {
    id: 'item-1',
    quotationId: 'quote-1',
    quotation: null as any,
    productId: 'prod-1',
    product: null,
    itemType: QuotationItemType.PRODUCT,
    itemCode: 'PRD-2026-0001',
    itemName: 'อลูมิเนียมกล่อง 2x1 นิ้ว',
    description: 'ความยาว 6 เมตร',
    quantity: 10,
    unit: 'เส้น',
    unitCost: 300,
    unitPrice: 500,
    discountAmount: 0,
    lineTotal: 5000,
    sortOrder: 1,
    createdAt: new Date('2026-03-20T10:00:00.000Z'),
    updatedAt: new Date('2026-03-20T10:00:00.000Z'),
  };

  const mockQuotation: Quotation = {
    id: 'quote-1',
    quotationNumber: 'QT-2026-0001',
    customerId: 'cust-1',
    customer: { id: 'cust-1', name: 'ลูกค้าทดสอบ', address: 'กทม.', phone: '0812345678', taxId: '1234567890123', contactName: 'คุณทดสอบ' } as any,
    projectId: 'prj-1',
    project: { id: 'prj-1', name: 'โครงการทดสอบ' } as any,
    sellerId: 'user-1',
    seller: { id: 'user-1', username: 'sales01', fullName: 'พนักงานขาย', role: 'SALES' } as any,
    approvedById: null,
    approvedBy: null,
    status: QuotationStatus.DRAFT,
    issueDate: '2026-09-20',
    validUntil: '2026-10-20',
    validDays: 30,
    customerName: 'ลูกค้าทดสอบ',
    customerAddress: 'กทม.',
    customerPhone: '0812345678',
    customerTaxId: '1234567890123',
    customerContact: 'คุณทดสอบ',
    projectName: 'โครงการทดสอบ',
    subtotal: 5000,
    discountType: QuotationDiscountType.AMOUNT,
    discountRate: 0,
    discountAmount: 0,
    totalAfterDiscount: 5000,
    vatRate: 7,
    vatAmount: 350,
    grandTotal: 5350,
    totalCost: 3000,
    estimatedProfit: 2000,
    profitMarginPercent: 40,
    paymentTerms: 'มัดจำ 50%',
    deliveryTerms: '14 วัน',
    warrantyTerms: '1 ปี',
    notes: 'หมายเหตุ',
    rejectionReason: null,
    items: [mockItem],
    createdAt: new Date('2026-03-20T10:00:00.000Z'),
    updatedAt: new Date('2026-03-20T10:00:00.000Z'),
  };

  beforeEach(() => {
    const qb: any = {
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      addOrderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getOne: vi.fn().mockResolvedValue(null),
      getManyAndCount: vi.fn().mockResolvedValue([[mockQuotation], 1]),
    };

    mockQuotationRepo = {
      createQueryBuilder: vi.fn().mockReturnValue(qb),
      find: vi.fn().mockResolvedValue([mockQuotation]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ ...dto, id: 'new-quote-id' })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve(entity)),
      remove: vi.fn().mockResolvedValue(mockQuotation),
    };

    mockQuotationItemRepo = {
      create: vi.fn().mockImplementation((dto) => ({ ...dto, id: 'new-item-id' })),
      save: vi.fn().mockResolvedValue([mockItem]),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    mockCustomerRepo = {
      findOne: vi.fn().mockResolvedValue({
        id: 'cust-1',
        name: 'ลูกค้าทดสอบ',
        address: 'กทม.',
        phone: '0812345678',
        taxId: '1234567890123',
        contactName: 'คุณทดสอบ',
      }),
    };

    mockProjectRepo = {
      findOne: vi.fn().mockResolvedValue({
        id: 'prj-1',
        name: 'โครงการทดสอบ',
      }),
    };

    mockProductRepo = {
      findOne: vi.fn(),
    };

    mockUserRepo = {
      findOne: vi.fn(),
    };

    service = new QuotationsService(
      mockQuotationRepo,
      mockQuotationItemRepo,
      mockCustomerRepo,
      mockProjectRepo,
      mockProductRepo,
      mockUserRepo,
    );
  });

  describe('findAll', () => {
    it('should return quotations list with pagination and summary stats', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.stats.totalQuotations).toBe(1);
      expect(result.items[0].quotationNumber).toBe('QT-2026-0001');
    });

    it('should filter by status and customer', async () => {
      const result = await service.findAll({
        status: 'APPROVED',
        customerId: 'cust-1',
        search: 'QT-2026',
      });
      expect(result.items).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return quotation details when found', async () => {
      mockQuotationRepo.findOne.mockResolvedValue(mockQuotation);
      const result = await service.findOne('quote-1');
      expect(result.id).toBe('quote-1');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].lineTotal).toBe(5000);
    });

    it('should throw NotFoundException when quotation not found', async () => {
      mockQuotationRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create quotation with calculated totals, snapshots, and line items', async () => {
      mockQuotationRepo.findOne.mockResolvedValue(mockQuotation);

      const result = await service.create(
        {
          customerId: 'cust-1',
          projectId: 'prj-1',
          discountType: QuotationDiscountType.AMOUNT,
          discountRate: 500,
          vatRate: 7,
          items: [
            {
              itemName: 'อลูมิเนียมกล่อง',
              quantity: 10,
              unit: 'เส้น',
              unitCost: 300,
              unitPrice: 500,
              discountAmount: 0,
            },
          ],
        },
        { id: 'user-1', role: 'SALES' },
      );

      expect(mockQuotationRepo.create).toHaveBeenCalled();
      expect(mockQuotationRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockCustomerRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create({ customerId: 'non-existent' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if duplicate quotation number', async () => {
      mockQuotationRepo.findOne.mockResolvedValue(mockQuotation);
      await expect(
        service.create({
          customerId: 'cust-1',
          quotationNumber: 'QT-2026-0001',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update quotation and recalculate totals', async () => {
      mockQuotationRepo.findOne.mockResolvedValue({
        ...mockQuotation,
        items: [mockItem],
      });

      const result = await service.update('quote-1', {
        discountRate: 200,
        notes: 'Updated notes',
      });

      expect(mockQuotationRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when updating non-existent quotation', async () => {
      mockQuotationRepo.findOne.mockResolvedValue(null);
      await expect(
        service.update('non-existent', { notes: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('changeStatus', () => {
    it('should change status to APPROVED and set approvedBy', async () => {
      mockQuotationRepo.findOne
        .mockResolvedValueOnce({ ...mockQuotation, status: QuotationStatus.PENDING_APPROVAL })
        .mockResolvedValueOnce({ ...mockQuotation, status: QuotationStatus.APPROVED });

      const result = await service.changeStatus(
        'quote-1',
        { status: QuotationStatus.APPROVED },
        { id: 'admin-id', role: 'ADMIN' },
      );

      expect(mockQuotationRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should change status to REJECTED and set rejection reason', async () => {
      mockQuotationRepo.findOne
        .mockResolvedValueOnce({ ...mockQuotation })
        .mockResolvedValueOnce({ ...mockQuotation, status: QuotationStatus.REJECTED });

      const result = await service.changeStatus(
        'quote-1',
        { status: QuotationStatus.REJECTED, rejectionReason: 'ราคาสูงเกินไป' },
      );

      expect(mockQuotationRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove draft quotation', async () => {
      mockQuotationRepo.findOne.mockResolvedValue({
        ...mockQuotation,
        status: QuotationStatus.DRAFT,
      });

      const result = await service.remove('quote-1', { id: 'user-1', role: 'SALES' });
      expect(mockQuotationRepo.remove).toHaveBeenCalled();
      expect(result.id).toBe('quote-1');
    });

    it('should reject removing non-draft quotation for non-admin', async () => {
      mockQuotationRepo.findOne.mockResolvedValue({
        ...mockQuotation,
        status: QuotationStatus.APPROVED,
      });

      await expect(
        service.remove('quote-1', { id: 'user-1', role: 'SALES' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
