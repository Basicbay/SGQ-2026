import { ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Product,
  ProductCategory,
  ProductStatus,
  StockStatus,
} from '../database/product.entity.js';
import { ProductsService } from './products.service.js';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockProductRepo: any;

  const mockProduct: Product = {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    productCode: 'PRD-2026-0001',
    name: 'อลูมิเนียมกล่อง 2x1 นิ้ว',
    category: ProductCategory.ALUMINIUM_PROFILES,
    brand: 'ORM',
    color: 'อลูมิเนียมธรรมชาติ',
    unit: 'เส้น',
    costPrice: 320,
    sellingPrice: 450,
    stockQuantity: 150,
    stockStatus: StockStatus.IN_STOCK,
    status: ProductStatus.ACTIVE,
    imageUrl: null,
    description: 'อลูมิเนียมกล่องคุณภาพสูง',
    note: null,
    createdAt: new Date('2026-03-20T10:00:00.000Z'),
    updatedAt: new Date('2026-03-20T10:00:00.000Z'),
  };

  beforeEach(() => {
    const qb: any = {
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getOne: vi.fn().mockResolvedValue(null),
      getManyAndCount: vi.fn().mockResolvedValue([[mockProduct], 1]),
    };

    mockProductRepo = {
      createQueryBuilder: vi.fn().mockReturnValue(qb),
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      remove: vi.fn(),
    };

    service = new ProductsService(mockProductRepo);
  });

  describe('findAll', () => {
    it('should return products with pagination', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].productCode).toBe('PRD-2026-0001');
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by search keyword', async () => {
      const result = await service.findAll({ search: 'อลูมิเนียม' });
      expect(result.items).toHaveLength(1);
      expect(mockProductRepo.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      const result = await service.findOne(mockProduct.id);
      expect(result.id).toBe(mockProduct.id);
      expect(result.name).toBe(mockProduct.name);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a product with provided code', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);
      mockProductRepo.create.mockReturnValue(mockProduct);
      mockProductRepo.save.mockResolvedValue(mockProduct);

      const result = await service.create({
        productCode: 'PRD-2026-0001',
        name: 'อลูมิเนียมกล่อง 2x1 นิ้ว',
        category: 'aluminium-profiles',
        costPrice: 320,
        sellingPrice: 450,
      });

      expect(result.productCode).toBe('PRD-2026-0001');
    });

    it('should throw ConflictException if product code already exists', async () => {
      mockProductRepo.findOne.mockResolvedValue(mockProduct);

      await expect(
        service.create({
          productCode: 'PRD-2026-0001',
          name: 'สินค้าซ้ำ',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should auto-generate productCode if omitted', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);
      mockProductRepo.create.mockReturnValue({
        ...mockProduct,
        productCode: `PRD-${new Date().getFullYear()}-0001`,
      });
      mockProductRepo.save.mockImplementation((p: any) => Promise.resolve(p));

      const result = await service.create({
        name: 'สินค้าใหม่',
      });

      expect(result.productCode).toContain('PRD-');
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      mockProductRepo.findOne.mockResolvedValue({ ...mockProduct });
      mockProductRepo.save.mockImplementation((p: any) => Promise.resolve(p));

      const result = await service.update(mockProduct.id, {
        name: 'ชื่อสินค้าใหม่',
        sellingPrice: 500,
      });

      expect(result.name).toBe('ชื่อสินค้าใหม่');
      expect(result.sellingPrice).toBe(500);
    });

    it('should throw NotFoundException if product to update is not found', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { name: 'ชื่อใหม่' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockProductRepo.remove.mockResolvedValue(mockProduct);

      const result = await service.remove(mockProduct.id);
      expect(result.id).toBe(mockProduct.id);
      expect(mockProductRepo.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product to delete is not found', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
