import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
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

export const CUSTOMER_TYPES = ['COMPANY', 'INDIVIDUAL'] as const;
export type CustomerTypeValue = (typeof CUSTOMER_TYPES)[number];

export const CUSTOMER_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type CustomerStatusValue = (typeof CUSTOMER_STATUSES)[number];

export class CreateCustomerDto {
  @ApiPropertyOptional({
    example: 'CUST-2026-001',
    description: 'รหัสลูกค้า (หากไม่ระบุ ระบบจะสร้างให้อัตโนมัติ)',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @Length(3, 32, { message: 'รหัสลูกค้าต้องมีความยาว 3 ถึง 32 ตัวอักษร' })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'รหัสลูกค้าต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข และ _ . - เท่านั้น',
  })
  @MaxLength(32)
  customerCode?: string;

  @ApiProperty({
    example: 'บริษัท พราวด์ บิลด์ดิ้ง จำกัด',
    description: 'ชื่อลูกค้า หรือชื่อบริษัท',
    maxLength: 200,
  })
  @IsString()
  @Length(1, 200)
  @Matches(/\S/, { message: 'กรุณากรอกชื่อลูกค้าหรือชื่อบริษัท' })
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({
    example: 'COMPANY',
    enum: CUSTOMER_TYPES,
    description: 'ประเภทลูกค้า (COMPANY = นิติบุคคล, INDIVIDUAL = บุคคลธรรมดา)',
    default: 'COMPANY',
  })
  @IsOptional()
  @ValidateIf((_object, value) => value !== '' && value !== null && value !== undefined)
  @IsString()
  @IsIn(CUSTOMER_TYPES, {
    message: 'ประเภทลูกค้าต้องเป็น COMPANY หรือ INDIVIDUAL เท่านั้น',
  })
  @MaxLength(32)
  customerType?: string;

  @ApiPropertyOptional({
    example: '0105558123456',
    description: 'เลขประจำตัวผู้เสียภาษี หรือเลขบัตรประชาชน',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  taxId?: string;

  @ApiPropertyOptional({
    example: 'คุณสมชาย เข็มกลัด',
    description: 'ชื่อผู้ติดต่อ',
    maxLength: 160,
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  contactName?: string;

  @ApiPropertyOptional({
    example: '0812345678',
    description: 'เบอร์โทรศัพท์ติดต่อ',
    maxLength: 40,
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({
    example: 'contact@proudbuilding.co.th',
    description: 'อีเมลติดต่อ',
    maxLength: 160,
  })
  @IsOptional()
  @ValidateIf((_object, value) => value !== '')
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional({
    example: '@proudbuilding',
    description: 'Line ID ของลูกค้า หรือผู้ติดต่อ',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lineId?: string;

  @ApiPropertyOptional({
    example: '88/12 หมู่ 4 ถนนสุขุมวิท แขวงบางนา เขตบางนา กรุงเทพมหานคร 10260',
    description: 'ที่อยู่สำหรับออกเอกสารและใบเสนอราคา',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({
    example: 'ลูกค้าเกรด A โครงการบ้านเดี่ยว',
    description: 'หมายเหตุเพิ่มเติม',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    enum: CUSTOMER_STATUSES,
    description: 'สถานะลูกค้า (ACTIVE = ใช้งาน, INACTIVE = ไม่ใช้งาน)',
    default: 'ACTIVE',
  })
  @IsOptional()
  @ValidateIf((_object, value) => value !== '' && value !== null && value !== undefined)
  @IsString()
  @IsIn(CUSTOMER_STATUSES, {
    message: 'สถานะลูกค้าต้องเป็น ACTIVE หรือ INACTIVE เท่านั้น',
  })
  @MaxLength(32)
  status?: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({
    example: 'CUST-2026-001',
    description: 'รหัสลูกค้า',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @Length(3, 32, { message: 'รหัสลูกค้าต้องมีความยาว 3 ถึง 32 ตัวอักษร' })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'รหัสลูกค้าต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข และ _ . - เท่านั้น',
  })
  @MaxLength(32)
  customerCode?: string;

  @ApiPropertyOptional({
    example: 'บริษัท พราวด์ บิลด์ดิ้ง จำกัด',
    description: 'ชื่อลูกค้า หรือชื่อบริษัท',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  @Matches(/\S/, { message: 'กรุณากรอกชื่อลูกค้าหรือชื่อบริษัท' })
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    example: 'COMPANY',
    enum: CUSTOMER_TYPES,
    description: 'ประเภทลูกค้า (COMPANY, INDIVIDUAL)',
  })
  @IsOptional()
  @ValidateIf((_object, value) => value !== '' && value !== null && value !== undefined)
  @IsString()
  @IsIn(CUSTOMER_TYPES, {
    message: 'ประเภทลูกค้าต้องเป็น COMPANY หรือ INDIVIDUAL เท่านั้น',
  })
  @MaxLength(32)
  customerType?: string;

  @ApiPropertyOptional({
    example: '0105558123456',
    description: 'เลขประจำตัวผู้เสียภาษี หรือเลขบัตรประชาชน',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  taxId?: string;

  @ApiPropertyOptional({
    example: 'คุณสมชาย เข็มกลัด',
    description: 'ชื่อผู้ติดต่อ',
    maxLength: 160,
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  contactName?: string;

  @ApiPropertyOptional({
    example: '0812345678',
    description: 'เบอร์โทรศัพท์ติดต่อ',
    maxLength: 40,
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({
    example: 'contact@proudbuilding.co.th',
    description: 'อีเมลติดต่อ',
    maxLength: 160,
  })
  @IsOptional()
  @ValidateIf((_object, value) => value !== '')
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional({
    example: '@proudbuilding',
    description: 'Line ID ของลูกค้า หรือผู้ติดต่อ',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lineId?: string;

  @ApiPropertyOptional({
    example: '88/12 หมู่ 4 ถนนสุขุมวิท แขวงบางนา เขตบางนา กรุงเทพมหานคร 10260',
    description: 'ที่อยู่สำหรับออกเอกสารและใบเสนอราคา',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({
    example: 'ลูกค้าเกรด A โครงการบ้านเดี่ยว',
    description: 'หมายเหตุเพิ่มเติม',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    enum: CUSTOMER_STATUSES,
    description: 'สถานะลูกค้า (ACTIVE, INACTIVE)',
  })
  @IsOptional()
  @ValidateIf((_object, value) => value !== '' && value !== null && value !== undefined)
  @IsString()
  @IsIn(CUSTOMER_STATUSES, {
    message: 'สถานะลูกค้าต้องเป็น ACTIVE หรือ INACTIVE เท่านั้น',
  })
  @MaxLength(32)
  status?: string;
}

export class CustomerQueryDto {
  @ApiPropertyOptional({
    description: 'ค้นหาจากรหัสลูกค้า, ชื่อลูกค้า/บริษัท, ชื่อผู้ติดต่อ, เลขผู้เสียภาษี, เบอร์โทร, Line ID, อีเมล',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    enum: CUSTOMER_TYPES,
    description: 'กรองตามประเภทลูกค้า (COMPANY, INDIVIDUAL)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  customerType?: string;

  @ApiPropertyOptional({
    enum: CUSTOMER_STATUSES,
    description: 'กรองตามสถานะ (ACTIVE, INACTIVE)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;

  @ApiPropertyOptional({
    default: 1,
    description: 'ลำดับหน้า (Page number)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    default: 10,
    description: 'จำนวนรายการต่อหน้า (Page size)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class CustomerItemResponse {
  @ApiProperty({ format: 'uuid', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'CUST-2026-001' })
  customerCode!: string;

  @ApiProperty({ example: 'บริษัท พราวด์ บิลด์ดิ้ง จำกัด' })
  name!: string;

  @ApiProperty({ example: 'COMPANY', enum: CUSTOMER_TYPES })
  customerType!: string;

  @ApiProperty({ example: '0105558123456', nullable: true })
  taxId!: string | null;

  @ApiProperty({ example: 'คุณสมชาย เข็มกลัด', nullable: true })
  contactName!: string | null;

  @ApiProperty({ example: '0812345678', nullable: true })
  phone!: string | null;

  @ApiProperty({ example: 'contact@proudbuilding.co.th', nullable: true })
  email!: string | null;

  @ApiProperty({ example: '@proudbuilding', nullable: true })
  lineId!: string | null;

  @ApiProperty({ example: '88/12 หมู่ 4 ถนนสุขุมวิท แขวงบางนา', nullable: true })
  address!: string | null;

  @ApiProperty({ example: 'ลูกค้าเกรด A', nullable: true })
  note!: string | null;

  @ApiProperty({ example: 'ACTIVE', enum: CUSTOMER_STATUSES })
  status!: string;

  @ApiProperty({ example: '2026-09-20T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-20T00:00:00.000Z' })
  updatedAt!: Date;
}

export class CustomerListResponse {
  @ApiProperty({ type: () => [CustomerItemResponse] })
  items!: CustomerItemResponse[];

  @ApiProperty({ example: 1 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 1 })
  totalPages!: number;
}

export class DeleteCustomerResponse {
  @ApiProperty({ example: true })
  deleted!: boolean;

  @ApiProperty({ format: 'uuid', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;
}

export class CustomerListApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => CustomerListResponse })
  data!: CustomerListResponse;
}

export class CustomerItemApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => CustomerItemResponse })
  data!: CustomerItemResponse;
}

export class DeleteCustomerApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => DeleteCustomerResponse })
  data!: DeleteCustomerResponse;
}
