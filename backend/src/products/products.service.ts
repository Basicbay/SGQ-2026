import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Product,
  ProductCategory,
  ProductStatus,
  StockStatus,
} from '../database/product.entity.js';
import type {
  CreateProductDto,
  DeleteProductResponse,
  ProductItemResponse,
  ProductListResponse,
  ProductQueryDto,
  UpdateProductDto,
} from './product.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  private mapProductResponse(product: Product): ProductItemResponse {
    return {
      id: product.id,
      productCode: product.productCode,
      name: product.name,
      category: product.category,
      brand: product.brand ?? null,
      color: product.color ?? null,
      unit: product.unit,
      costPrice: Number(product.costPrice) || 0,
      sellingPrice: Number(product.sellingPrice) || 0,
      stockQuantity: Number(product.stockQuantity) || 0,
      stockStatus: product.stockStatus,
      status: product.status,
      imageUrl: product.imageUrl ?? null,
      description: product.description ?? null,
      note: product.note ?? null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private async generateProductCode(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `PRD-${currentYear}-`;
    const latest = await this.productRepository
      .createQueryBuilder('product')
      .where('product.product_code LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('product.product_code', 'DESC')
      .getOne();

    let nextSeq = 1;
    if (latest && latest.productCode) {
      const parts = latest.productCode.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(num)) {
        nextSeq = num + 1;
      }
    }
    return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  }

  async findAll(query: ProductQueryDto): Promise<ProductListResponse> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const qb = this.productRepository.createQueryBuilder('product');

    if (query.search && query.search.trim() !== '') {
      const s = `%${query.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(product.product_code) LIKE :s OR LOWER(product.name) LIKE :s OR LOWER(COALESCE(product.brand, \'\')) LIKE :s OR LOWER(COALESCE(product.color, \'\')) LIKE :s OR LOWER(COALESCE(product.description, \'\')) LIKE :s)',
        { s },
      );
    }

    if (query.category && query.category.trim() !== '' && query.category !== 'ALL') {
      qb.andWhere('product.category = :category', {
        category: query.category.trim(),
      });
    }

    if (query.brand && query.brand.trim() !== '' && query.brand !== 'ALL') {
      qb.andWhere('product.brand = :brand', {
        brand: query.brand.trim(),
      });
    }

    if (query.stockStatus && query.stockStatus.trim() !== '' && query.stockStatus !== 'ALL') {
      qb.andWhere('product.stock_status = :stockStatus', {
        stockStatus: query.stockStatus.trim(),
      });
    }

    if (query.status && query.status.trim() !== '' && query.status !== 'ALL') {
      qb.andWhere('product.status = :status', {
        status: query.status.trim(),
      });
    }

    qb.orderBy('product.created_at', 'DESC');
    qb.skip(skip);
    qb.take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((p) => this.mapProductResponse(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<ProductItemResponse> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`ไม่พบข้อมูลสินค้าและวัสดุตามรหัสที่ระบุ`);
    }

    return this.mapProductResponse(product);
  }

  async create(dto: CreateProductDto): Promise<ProductItemResponse> {
    let productCode = dto.productCode?.trim();

    if (!productCode) {
      productCode = await this.generateProductCode();
    } else {
      const existing = await this.productRepository.findOne({
        where: { productCode },
      });
      if (existing) {
        throw new ConflictException(`รหัสสินค้า "${productCode}" มีอยู่ในระบบแล้ว`);
      }
    }

    const product = this.productRepository.create({
      productCode,
      name: dto.name.trim(),
      category: dto.category?.trim() || ProductCategory.ALUMINIUM_PROFILES,
      brand: dto.brand?.trim() || null,
      color: dto.color?.trim() || null,
      unit: dto.unit?.trim() || 'ชิ้น',
      costPrice: dto.costPrice ?? 0,
      sellingPrice: dto.sellingPrice ?? 0,
      stockQuantity: dto.stockQuantity ?? 0,
      stockStatus: dto.stockStatus?.trim() || StockStatus.IN_STOCK,
      status: dto.status?.trim() || ProductStatus.ACTIVE,
      imageUrl: dto.imageUrl?.trim() || null,
      description: dto.description?.trim() || null,
      note: dto.note?.trim() || null,
    });

    const saved = await this.productRepository.save(product);
    return this.mapProductResponse(saved);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductItemResponse> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`ไม่พบข้อมูลสินค้าและวัสดุตามรหัสที่ระบุ`);
    }

    if (dto.productCode && dto.productCode.trim() !== product.productCode) {
      const existing = await this.productRepository.findOne({
        where: { productCode: dto.productCode.trim() },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `รหัสสินค้า "${dto.productCode.trim()}" ซ้ำกับสินค้าอื่นในระบบ`,
        );
      }
      product.productCode = dto.productCode.trim();
    }

    if (dto.name !== undefined) product.name = dto.name.trim();
    if (dto.category !== undefined) product.category = dto.category.trim();
    if (dto.brand !== undefined) product.brand = dto.brand ? dto.brand.trim() : null;
    if (dto.color !== undefined) product.color = dto.color ? dto.color.trim() : null;
    if (dto.unit !== undefined) product.unit = dto.unit ? dto.unit.trim() : 'ชิ้น';
    if (dto.costPrice !== undefined) product.costPrice = dto.costPrice;
    if (dto.sellingPrice !== undefined) product.sellingPrice = dto.sellingPrice;
    if (dto.stockQuantity !== undefined) product.stockQuantity = dto.stockQuantity;
    if (dto.stockStatus !== undefined) product.stockStatus = dto.stockStatus.trim();
    if (dto.status !== undefined) product.status = dto.status.trim();
    if (dto.imageUrl !== undefined) product.imageUrl = dto.imageUrl ? dto.imageUrl.trim() : null;
    if (dto.description !== undefined) product.description = dto.description ? dto.description.trim() : null;
    if (dto.note !== undefined) product.note = dto.note ? dto.note.trim() : null;

    const updated = await this.productRepository.save(product);
    return this.mapProductResponse(updated);
  }

  async remove(id: string): Promise<DeleteProductResponse> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`ไม่พบข้อมูลสินค้าและวัสดุตามรหัสที่ระบุ`);
    }

    await this.productRepository.remove(product);

    return {
      id,
      message: 'ลบข้อมูลสินค้าและวัสดุเรียบร้อยแล้ว',
    };
  }
}
