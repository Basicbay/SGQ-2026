import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiResponseEnvelope } from '../auth/auth.dto.js';

export const PRODUCT_CATEGORIES = [
  'aluminium-profiles',
  'architectural-glass',
  'hardware-accessories',
  'digital-door-locks',
  'custom-aluminium',
  'additional-products',
  'installation-service',
] as const;
export type ProductCategoryValue = (typeof PRODUCT_CATEGORIES)[number];

export const STOCK_STATUSES = [
  'IN_STOCK',
  'LOW_STOCK',
  'OUT_OF_STOCK',
  'MADE_TO_ORDER',
] as const;
export type StockStatusValue = (typeof STOCK_STATUSES)[number];

export const PRODUCT_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type ProductStatusValue = (typeof PRODUCT_STATUSES)[number];

export class CreateProductDto {
  @ApiPropertyOptional({
    example: 'PRD-2026-0001',
    description: 'รหัสสินค้า/วัสดุ (หากไม่ระบุ ระบบจะสร้างให้อัตโนมัติ)',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @Length(3, 32, { message: 'รหัสสินค้าต้องมีความยาว 3 ถึง 32 ตัวอักษร' })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'รหัสสินค้าต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข และ _ . - เท่านั้น',
  })
  @MaxLength(32)
  productCode?: string;

  @ApiProperty({
    example: 'อลูมิเนียมกล่อง 2x1 นิ้ว หนา 1.2 มม.',
    description: 'ชื่อสินค้าหรือวัสดุ',
    maxLength: 200,
  })
  @IsString()
  @Length(1, 200)
  @Matches(/\S/, { message: 'กรุณากรอกชื่อสินค้าหรือวัสดุ' })
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({
    example: 'aluminium-profiles',
    enum: PRODUCT_CATEGORIES,
    description: 'หมวดหมู่สินค้า',
    default: 'aluminium-profiles',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @IsIn(PRODUCT_CATEGORIES, { message: 'หมวดหมู่สินค้าไม่ถูกต้อง' })
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({
    example: 'ORM',
    description: 'แบรนด์หรือยี่ห้อสินค้า',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({
    example: 'อลูมิเนียมธรรมชาติ',
    description: 'สีหรือรูปแบบผิว',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @ApiPropertyOptional({
    example: 'เส้น',
    description: 'หน่วยนับของสินค้า (เช่น เส้น, ชิ้น, ตร.ม., ชุด, แผ่น, กล่อง)',
    default: 'ชิ้น',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  unit?: string;

  @ApiPropertyOptional({
    example: 320.0,
    description: 'ราคาต้นทุน (บาท)',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ราคาต้นทุนต้องเป็นตัวเลข' })
  @Min(0, { message: 'ราคาต้นทุนต้องไม่ต่ำกว่า 0' })
  @Type(() => Number)
  costPrice?: number;

  @ApiPropertyOptional({
    example: 450.0,
    description: 'ราคาจำหน่าย (บาท)',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ราคาจำหน่ายต้องเป็นตัวเลข' })
  @Min(0, { message: 'ราคาจำหน่ายต้องไม่ต่ำกว่า 0' })
  @Type(() => Number)
  sellingPrice?: number;

  @ApiPropertyOptional({
    example: 150.0,
    description: 'จำนวนคงเหลือในสต็อก',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'จำนวนสินค้าต้องเป็นตัวเลข' })
  @Min(0, { message: 'จำนวนสินค้าต้องไม่ต่ำกว่า 0' })
  @Type(() => Number)
  stockQuantity?: number;

  @ApiPropertyOptional({
    example: 'IN_STOCK',
    enum: STOCK_STATUSES,
    description: 'สถานะสต็อก (IN_STOCK, LOW_STOCK, OUT_OF_STOCK, MADE_TO_ORDER)',
    default: 'IN_STOCK',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @IsIn(STOCK_STATUSES, { message: 'สถานะสต็อกไม่ถูกต้อง' })
  @MaxLength(32)
  stockStatus?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    enum: PRODUCT_STATUSES,
    description: 'สถานะการใช้งาน (ACTIVE, INACTIVE)',
    default: 'ACTIVE',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @IsIn(PRODUCT_STATUSES, { message: 'สถานะการใช้งานไม่ถูกต้อง' })
  @MaxLength(32)
  status?: string;

  @ApiPropertyOptional({
    example: '/api/upload/prd-001.webp',
    description: 'URL รูปภาพสินค้า',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 'อลูมิเนียมกล่องคุณภาพสูง ความยาว 6 เมตร',
    description: 'รายละเอียดคุณลักษณะสินค้า',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    example: 'สินค้าพร้อมส่ง สต็อกอัปเดตทุกสัปดาห์',
    description: 'หมายเหตุเพิ่มเติม',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({
    example: 'PRD-2026-0001',
    description: 'รหัสสินค้า/วัสดุ',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @Length(3, 32, { message: 'รหัสสินค้าต้องมีความยาว 3 ถึง 32 ตัวอักษร' })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'รหัสสินค้าต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข และ _ . - เท่านั้น',
  })
  @MaxLength(32)
  productCode?: string;

  @ApiPropertyOptional({
    example: 'อลูมิเนียมกล่อง 2x1 นิ้ว หนา 1.2 มม.',
    description: 'ชื่อสินค้าหรือวัสดุ',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  @Matches(/\S/, { message: 'ชื่อสินค้าต้องไม่เป็นช่องว่าง' })
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    example: 'aluminium-profiles',
    enum: PRODUCT_CATEGORIES,
    description: 'หมวดหมู่สินค้า',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @IsIn(PRODUCT_CATEGORIES, { message: 'หมวดหมู่สินค้าไม่ถูกต้อง' })
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({
    example: 'ORM',
    description: 'แบรนด์หรือยี่ห้อสินค้า',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({
    example: 'อลูมิเนียมธรรมชาติ',
    description: 'สีหรือรูปแบบผิว',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @ApiPropertyOptional({
    example: 'เส้น',
    description: 'หน่วยนับของสินค้า',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  unit?: string;

  @ApiPropertyOptional({
    example: 320.0,
    description: 'ราคาต้นทุน (บาท)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'ราคาต้นทุนต้องเป็นตัวเลข' })
  @Min(0, { message: 'ราคาต้นทุนต้องไม่ต่ำกว่า 0' })
  @Type(() => Number)
  costPrice?: number;

  @ApiPropertyOptional({
    example: 450.0,
    description: 'ราคาจำหน่าย (บาท)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'ราคาจำหน่ายต้องเป็นตัวเลข' })
  @Min(0, { message: 'ราคาจำหน่ายต้องไม่ต่ำกว่า 0' })
  @Type(() => Number)
  sellingPrice?: number;

  @ApiPropertyOptional({
    example: 150.0,
    description: 'จำนวนคงเหลือในสต็อก',
  })
  @IsOptional()
  @IsNumber({}, { message: 'จำนวนสินค้าต้องเป็นตัวเลข' })
  @Min(0, { message: 'จำนวนสินค้าต้องไม่ต่ำกว่า 0' })
  @Type(() => Number)
  stockQuantity?: number;

  @ApiPropertyOptional({
    example: 'IN_STOCK',
    enum: STOCK_STATUSES,
    description: 'สถานะสต็อก',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @IsIn(STOCK_STATUSES, { message: 'สถานะสต็อกไม่ถูกต้อง' })
  @MaxLength(32)
  stockStatus?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    enum: PRODUCT_STATUSES,
    description: 'สถานะการใช้งาน',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @IsIn(PRODUCT_STATUSES, { message: 'สถานะการใช้งานไม่ถูกต้อง' })
  @MaxLength(32)
  status?: string;

  @ApiPropertyOptional({
    example: '/api/upload/prd-001.webp',
    description: 'URL รูปภาพสินค้า',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string | null;

  @ApiPropertyOptional({
    example: 'อลูมิเนียมกล่องคุณภาพสูง ความยาว 6 เมตร',
    description: 'รายละเอียดคุณลักษณะสินค้า',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional({
    example: 'สินค้าพร้อมส่ง สต็อกอัปเดตทุกสัปดาห์',
    description: 'หมายเหตุเพิ่มเติม',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string | null;
}

export class ProductQueryDto {
  @ApiPropertyOptional({
    example: 'อลูมิเนียม',
    description: 'คำค้นหารหัสสินค้า, ชื่อสินค้า, แบรนด์, สี, หรือรายละเอียด',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    example: 'aluminium-profiles',
    description: 'กรองตามหมวดหมู่สินค้า',
    enum: PRODUCT_CATEGORIES,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({
    example: 'ORM',
    description: 'กรองตามแบรนด์',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({
    example: 'IN_STOCK',
    description: 'กรองตามสถานะสต็อก (IN_STOCK, LOW_STOCK, OUT_OF_STOCK, MADE_TO_ORDER)',
    enum: STOCK_STATUSES,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  stockStatus?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    description: 'กรองตามสถานะการใช้งาน (ACTIVE, INACTIVE)',
    enum: PRODUCT_STATUSES,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'หมายเลขหน้า (เริ่มต้น 1)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'หมายเลขหน้าต้องเป็นจำนวนเต็ม' })
  @Min(1, { message: 'หมายเลขหน้าต้องมากกว่าหรือเท่ากับ 1' })
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'จำนวนรายการต่อหน้า (สูงสุด 100)',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt({ message: 'จำนวนรายการต่อหน้าต้องเป็นจำนวนเต็ม' })
  @Min(1, { message: 'จำนวนรายการต่อหน้าต้องมากกว่าหรือเท่ากับ 1' })
  @Max(100, { message: 'จำนวนรายการต่อหน้าต้องไม่เกิน 100' })
  @Type(() => Number)
  limit?: number = 10;
}

export class ProductItemResponse {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id!: string;

  @ApiProperty({ example: 'PRD-2026-0001' })
  productCode!: string;

  @ApiProperty({ example: 'อลูมิเนียมกล่อง 2x1 นิ้ว หนา 1.2 มม.' })
  name!: string;

  @ApiProperty({ example: 'aluminium-profiles' })
  category!: string;

  @ApiProperty({ example: 'ORM', nullable: true })
  brand!: string | null;

  @ApiProperty({ example: 'อลูมิเนียมธรรมชาติ', nullable: true })
  color!: string | null;

  @ApiProperty({ example: 'เส้น' })
  unit!: string;

  @ApiProperty({ example: 320.0 })
  costPrice!: number;

  @ApiProperty({ example: 450.0 })
  sellingPrice!: number;

  @ApiProperty({ example: 150.0 })
  stockQuantity!: number;

  @ApiProperty({ example: 'IN_STOCK' })
  stockStatus!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: '/api/upload/prd-001.webp', nullable: true })
  imageUrl!: string | null;

  @ApiProperty({
    example: 'อลูมิเนียมกล่องคุณภาพสูง ความยาว 6 เมตร',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({ example: 'สินค้าพร้อมส่ง', nullable: true })
  note!: string | null;

  @ApiProperty({ example: '2026-03-20T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-03-20T10:00:00.000Z' })
  updatedAt!: Date;
}

export class ProductPaginationMeta {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 45 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

export class ProductListResponse {
  @ApiProperty({ type: [ProductItemResponse] })
  items!: ProductItemResponse[];

  @ApiProperty({ type: ProductPaginationMeta })
  pagination!: ProductPaginationMeta;
}

export class DeleteProductResponse {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id!: string;

  @ApiProperty({ example: 'ลบข้อมูลสินค้าและวัสดุเรียบร้อยแล้ว' })
  message!: string;
}

export class ProductItemApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => ProductItemResponse })
  data!: ProductItemResponse;
}

export class ProductListApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => ProductListResponse })
  data!: ProductListResponse;
}

export class DeleteProductApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => DeleteProductResponse })
  data!: DeleteProductResponse;
}
