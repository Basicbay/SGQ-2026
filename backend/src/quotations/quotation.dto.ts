import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ApiResponseEnvelope } from '../auth/auth.dto.js';

export const QUOTATION_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'PENDING_APPROVAL',
  'APPROVED',
  'SENT',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
] as const;
export type QuotationStatusValue = (typeof QUOTATION_STATUSES)[number];

export const QUOTATION_DISCOUNT_TYPES = ['AMOUNT', 'PERCENT'] as const;
export type QuotationDiscountTypeValue = (typeof QUOTATION_DISCOUNT_TYPES)[number];

export const QUOTATION_ITEM_TYPES = [
  'PRODUCT',
  'SERVICE',
  'CUSTOM',
  'LABOR',
] as const;
export type QuotationItemTypeValue = (typeof QUOTATION_ITEM_TYPES)[number];

export class QuotationItemInputDto {
  @ApiPropertyOptional({
    example: 'f29a8d94-437b-474a-a820-82658fa070da',
    description: 'รหัสสินค้าในคลัง (ถ้าเลือกจากระบบ)',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsUUID('4', { message: 'รหัสสินค้าต้องเป็นรูปแบบ UUID' })
  productId?: string;

  @ApiPropertyOptional({
    example: 'PRODUCT',
    enum: QUOTATION_ITEM_TYPES,
    description: 'ประเภทรายการ (PRODUCT, SERVICE, CUSTOM, LABOR)',
    default: 'PRODUCT',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @IsIn(QUOTATION_ITEM_TYPES, { message: 'ประเภทรายการไม่ถูกต้อง' })
  @MaxLength(32)
  itemType?: string;

  @ApiPropertyOptional({
    example: 'PRD-2026-0001',
    description: 'รหัสรายการหรือรหัสสินค้า',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  itemCode?: string;

  @ApiProperty({
    example: 'อลูมิเนียมกล่อง 2x1 นิ้ว หนา 1.2 มม.',
    description: 'ชื่อรายการสินค้า วัสดุ หรือบริการ',
    maxLength: 250,
  })
  @IsString()
  @Length(1, 250)
  @Matches(/\S/, { message: 'กรุณาระบุชื่อรายการ' })
  @MaxLength(250)
  itemName!: string;

  @ApiPropertyOptional({
    example: 'ความยาว 6 เมตร ชุบอโนไดซ์สีธรรมชาติ',
    description: 'รายละเอียดคุณลักษณะหรือสเปกเพิ่มเติม',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    example: 10,
    description: 'จำนวน',
    default: 1,
  })
  @IsNumber({}, { message: 'จำนวนต้องเป็นตัวเลข' })
  @Min(0.01, { message: 'จำนวนต้องมากกว่า 0' })
  @Type(() => Number)
  quantity!: number;

  @ApiPropertyOptional({
    example: 'เส้น',
    description: 'หน่วยนับ (เช่น เส้น, ชุด, ตร.ม., ชิ้น, งาน)',
    default: 'ชิ้น',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  unit?: string;

  @ApiPropertyOptional({
    example: 320.0,
    description: 'ราคาต้นทุนต่อหน่วย (บาท)',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ต้นทุนต่อหน่วยต้องเป็นตัวเลข' })
  @Min(0, { message: 'ต้นทุนต่อหน่วยต้องไม่ต่ำกว่า 0' })
  @Type(() => Number)
  unitCost?: number;

  @ApiProperty({
    example: 450.0,
    description: 'ราคาจำหน่ายต่อหน่วย (บาท)',
    default: 0,
  })
  @IsNumber({}, { message: 'ราคาต่อหน่วยต้องเป็นตัวเลข' })
  @Min(0, { message: 'ราคาต่อหน่วยต้องไม่ต่ำกว่า 0' })
  @Type(() => Number)
  unitPrice!: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'ส่วนลดต่อรายการ (บาท)',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ส่วนลดต้องเป็นตัวเลข' })
  @Min(0, { message: 'ส่วนลดต้องไม่ต่ำกว่า 0' })
  @Type(() => Number)
  discountAmount?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ลำดับการแสดงผล',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sortOrder?: number;
}

export class CreateQuotationDto {
  @ApiPropertyOptional({
    example: 'QT-2026-0005',
    description: 'เลขที่ใบเสนอราคา (หากเว้นว่าง ระบบจะสร้างให้อัตโนมัติ)',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @Length(3, 32, { message: 'เลขที่ใบเสนอราคาต้องมีความยาว 3 ถึง 32 ตัวอักษร' })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'เลขที่ใบเสนอราคาต้องประกอบด้วยตัวอักษร ตัวเลข และ _ . - เท่านั้น',
  })
  @MaxLength(32)
  quotationNumber?: string;

  @ApiProperty({
    example: '73ede89f-7227-4563-9d60-57544ae4ec31',
    description: 'รหัสลูกค้า (Customer UUID)',
  })
  @IsUUID('4', { message: 'รหัสลูกค้าต้องเป็นรูปแบบ UUID' })
  customerId!: string;

  @ApiPropertyOptional({
    example: '1eb5c522-f24b-4bbb-b9e7-1ca2f26f95fa',
    description: 'รหัสโครงการ (Project UUID)',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsUUID('4', { message: 'รหัสโครงการต้องเป็นรูปแบบ UUID' })
  projectId?: string;

  @ApiPropertyOptional({
    example: '851eb25d-ee4b-408c-b776-7905d1467f5a',
    description: 'รหัสพนักงานขาย/ผู้จัดทำ (User UUID)',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsUUID('4', { message: 'รหัสพนักงานขายต้องเป็นรูปแบบ UUID' })
  sellerId?: string;

  @ApiPropertyOptional({
    example: 'DRAFT',
    enum: QUOTATION_STATUSES,
    description: 'สถานะใบเสนอราคา',
    default: 'DRAFT',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @IsIn(QUOTATION_STATUSES, { message: 'สถานะใบเสนอราคาไม่ถูกต้อง' })
  @MaxLength(32)
  status?: string;

  @ApiPropertyOptional({
    example: '2026-09-20',
    description: 'วันที่ออกเอกสาร (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'วันที่ออกเอกสารต้องอยู่ในรูปแบบ YYYY-MM-DD',
  })
  @MaxLength(10)
  issueDate?: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'กำหนดยืนราคา (วัน)',
    default: 30,
  })
  @IsOptional()
  @IsInt({ message: 'จำนวนวันยืนราคาต้องเป็นจำนวนเต็ม' })
  @Min(1, { message: 'จำนวนวันยืนราคาต้องอย่างน้อย 1 วัน' })
  @Max(365, { message: 'จำนวนวันยืนราคาต้องไม่เกิน 365 วัน' })
  @Type(() => Number)
  validDays?: number;

  @ApiPropertyOptional({
    example: '2026-10-20',
    description: 'วันที่หมดอายุใบเสนอราคา (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'วันที่หมดอายุต้องอยู่ในรูปแบบ YYYY-MM-DD',
  })
  @MaxLength(10)
  validUntil?: string;

  @ApiPropertyOptional({
    example: 'บริษัท พราวด์ บิลด์ดิ้ง จำกัด',
    description: 'ชื่อลูกค้า (Snapshot)',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  customerName?: string;

  @ApiPropertyOptional({
    example: '88/12 ถนนสุขุมวิท 21 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    description: 'ที่อยู่ลูกค้า (Snapshot)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  customerAddress?: string;

  @ApiPropertyOptional({
    example: '02-123-4567',
    description: 'เบอร์โทรลูกค้า (Snapshot)',
    maxLength: 40,
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  customerPhone?: string;

  @ApiPropertyOptional({
    example: '0105565012345',
    description: 'เลขประจำตัวผู้เสียภาษี (Snapshot)',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  customerTaxId?: string;

  @ApiPropertyOptional({
    example: 'คุณเกียรติศักดิ์ เจริญพร',
    description: 'ชื่อผู้ติดต่อ (Snapshot)',
    maxLength: 160,
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  customerContact?: string;

  @ApiPropertyOptional({
    example: 'งานก่อสร้างอาคารสำนักงานและโชว์รูม 3 ชั้น พราวด์ ทาวเวอร์',
    description: 'ชื่อโครงการ (Snapshot)',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  projectName?: string;

  @ApiPropertyOptional({
    example: 'AMOUNT',
    enum: QUOTATION_DISCOUNT_TYPES,
    description: 'ประเภทส่วนลดรวม (AMOUNT หรือ PERCENT)',
    default: 'AMOUNT',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @IsIn(QUOTATION_DISCOUNT_TYPES, { message: 'ประเภทส่วนลดไม่ถูกต้อง' })
  @MaxLength(20)
  discountType?: string;

  @ApiPropertyOptional({
    example: 5.0,
    description: 'อัตราหรือจำนวนส่วนลด (ตาม discountType)',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ส่วนลดรวมต้องเป็นตัวเลข' })
  @Min(0, { message: 'ส่วนลดรวมต้องไม่ต่ำกว่า 0' })
  @Type(() => Number)
  discountRate?: number;

  @ApiPropertyOptional({
    example: 7.0,
    description: 'อัตราภาษีมูลค่าเพิ่ม (%)',
    default: 7.0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'อัตราภาษีต้องเป็นตัวเลข' })
  @Min(0, { message: 'อัตราภาษีต้องไม่ต่ำกว่า 0' })
  @Max(100, { message: 'อัตราภาษีต้องไม่เกิน 100%' })
  @Type(() => Number)
  vatRate?: number;

  @ApiPropertyOptional({
    example: 'มัดจำ 50% เมื่องวดแรก, 50% เมื่องานแล้วเสร็จตรวจรับ',
    description: 'เงื่อนไขการชำระเงิน',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  paymentTerms?: string;

  @ApiPropertyOptional({
    example: 'จัดส่งและติดตั้งภายใน 14-21 วันทำการหลังได้รับเงินมัดจำ',
    description: 'เงื่อนไขการส่งมอบ',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  deliveryTerms?: string;

  @ApiPropertyOptional({
    example: 'รับประกันคุณภาพอุปกรณ์และงานติดตั้ง 1 ปีเต็ม',
    description: 'เงื่อนไขการรับประกัน',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  warrantyTerms?: string;

  @ApiPropertyOptional({
    example: 'ราคานี้รวมภาษีมูลค่าเพิ่ม 7% เรียบร้อยแล้ว',
    description: 'หมายเหตุเพิ่มเติม',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    type: [QuotationItemInputDto],
    description: 'รายการสินค้า/บริการในใบเสนอราคา',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemInputDto)
  items?: QuotationItemInputDto[];
}

export class UpdateQuotationDto {
  @ApiPropertyOptional({
    example: 'QT-2026-0005',
    description: 'เลขที่ใบเสนอราคา',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @Length(3, 32, { message: 'เลขที่ใบเสนอราคาต้องมีความยาว 3 ถึง 32 ตัวอักษร' })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'เลขที่ใบเสนอราคาต้องประกอบด้วยตัวอักษร ตัวเลข และ _ . - เท่านั้น',
  })
  @MaxLength(32)
  quotationNumber?: string;

  @ApiPropertyOptional({
    example: '73ede89f-7227-4563-9d60-57544ae4ec31',
    description: 'รหัสลูกค้า (Customer UUID)',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsUUID('4', { message: 'รหัสลูกค้าต้องเป็นรูปแบบ UUID' })
  customerId?: string;

  @ApiPropertyOptional({
    example: '1eb5c522-f24b-4bbb-b9e7-1ca2f26f95fa',
    description: 'รหัสโครงการ (Project UUID)',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsUUID('4', { message: 'รหัสโครงการต้องเป็นรูปแบบ UUID' })
  projectId?: string | null;

  @ApiPropertyOptional({
    example: '851eb25d-ee4b-408c-b776-7905d1467f5a',
    description: 'รหัสพนักงานขาย/ผู้จัดทำ (User UUID)',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsUUID('4', { message: 'รหัสพนักงานขายต้องเป็นรูปแบบ UUID' })
  sellerId?: string | null;

  @ApiPropertyOptional({
    example: 'DRAFT',
    enum: QUOTATION_STATUSES,
    description: 'สถานะใบเสนอราคา',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @IsIn(QUOTATION_STATUSES, { message: 'สถานะใบเสนอราคาไม่ถูกต้อง' })
  @MaxLength(32)
  status?: string;

  @ApiPropertyOptional({
    example: '2026-09-20',
    description: 'วันที่ออกเอกสาร (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'วันที่ออกเอกสารต้องอยู่ในรูปแบบ YYYY-MM-DD',
  })
  @MaxLength(10)
  issueDate?: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'กำหนดยืนราคา (วัน)',
  })
  @IsOptional()
  @IsInt({ message: 'จำนวนวันยืนราคาต้องเป็นจำนวนเต็ม' })
  @Min(1, { message: 'จำนวนวันยืนราคาต้องอย่างน้อย 1 วัน' })
  @Max(365, { message: 'จำนวนวันยืนราคาต้องไม่เกิน 365 วัน' })
  @Type(() => Number)
  validDays?: number;

  @ApiPropertyOptional({
    example: '2026-10-20',
    description: 'วันที่หมดอายุใบเสนอราคา (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'วันที่หมดอายุต้องอยู่ในรูปแบบ YYYY-MM-DD',
  })
  @MaxLength(10)
  validUntil?: string;

  @ApiPropertyOptional({
    example: 'บริษัท พราวด์ บิลด์ดิ้ง จำกัด',
    description: 'ชื่อลูกค้า (Snapshot)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  customerName?: string;

  @ApiPropertyOptional({
    example: '88/12 ถนนสุขุมวิท 21 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    description: 'ที่อยู่ลูกค้า (Snapshot)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  customerAddress?: string;

  @ApiPropertyOptional({
    example: '02-123-4567',
    description: 'เบอร์โทรลูกค้า (Snapshot)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  customerPhone?: string;

  @ApiPropertyOptional({
    example: '0105565012345',
    description: 'เลขประจำตัวผู้เสียภาษี (Snapshot)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  customerTaxId?: string;

  @ApiPropertyOptional({
    example: 'คุณเกียรติศักดิ์ เจริญพร',
    description: 'ชื่อผู้ติดต่อ (Snapshot)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  customerContact?: string;

  @ApiPropertyOptional({
    example: 'งานก่อสร้างอาคารสำนักงานและโชว์รูม 3 ชั้น พราวด์ ทาวเวอร์',
    description: 'ชื่อโครงการ (Snapshot)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  projectName?: string | null;

  @ApiPropertyOptional({
    example: 'AMOUNT',
    enum: QUOTATION_DISCOUNT_TYPES,
    description: 'ประเภทส่วนลดรวม (AMOUNT หรือ PERCENT)',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @IsIn(QUOTATION_DISCOUNT_TYPES, { message: 'ประเภทส่วนลดไม่ถูกต้อง' })
  @MaxLength(20)
  discountType?: string;

  @ApiPropertyOptional({
    example: 5.0,
    description: 'อัตราหรือจำนวนส่วนลด',
  })
  @IsOptional()
  @IsNumber({}, { message: 'ส่วนลดรวมต้องเป็นตัวเลข' })
  @Min(0, { message: 'ส่วนลดรวมต้องไม่ต่ำกว่า 0' })
  @Type(() => Number)
  discountRate?: number;

  @ApiPropertyOptional({
    example: 7.0,
    description: 'อัตราภาษีมูลค่าเพิ่ม (%)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'อัตราภาษีต้องเป็นตัวเลข' })
  @Min(0, { message: 'อัตราภาษีต้องไม่ต่ำกว่า 0' })
  @Max(100, { message: 'อัตราภาษีต้องไม่เกิน 100%' })
  @Type(() => Number)
  vatRate?: number;

  @ApiPropertyOptional({
    example: 'มัดจำ 50% เมื่องวดแรก, 50% เมื่องานแล้วเสร็จตรวจรับ',
    description: 'เงื่อนไขการชำระเงิน',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  paymentTerms?: string | null;

  @ApiPropertyOptional({
    example: 'จัดส่งและติดตั้งภายใน 14-21 วันทำการหลังได้รับเงินมัดจำ',
    description: 'เงื่อนไขการส่งมอบ',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  deliveryTerms?: string | null;

  @ApiPropertyOptional({
    example: 'รับประกันคุณภาพอุปกรณ์และงานติดตั้ง 1 ปีเต็ม',
    description: 'เงื่อนไขการรับประกัน',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  warrantyTerms?: string | null;

  @ApiPropertyOptional({
    example: 'ราคานี้รวมภาษีมูลค่าเพิ่ม 7% เรียบร้อยแล้ว',
    description: 'หมายเหตุเพิ่มเติม',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;

  @ApiPropertyOptional({
    type: [QuotationItemInputDto],
    description: 'รายการสินค้า/บริการในใบเสนอราคา',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemInputDto)
  items?: QuotationItemInputDto[];
}

export class ChangeQuotationStatusDto {
  @ApiProperty({
    example: 'APPROVED',
    enum: QUOTATION_STATUSES,
    description: 'สถานะใหม่ที่ต้องการเปลี่ยน',
  })
  @IsString()
  @IsIn(QUOTATION_STATUSES, { message: 'สถานะไม่ถูกต้อง' })
  @MaxLength(32)
  status!: string;

  @ApiPropertyOptional({
    example: 'ราคาสูงกว่างบประมาณที่กำหนด',
    description: 'เหตุผลกรณีปฏิเสธ (REJECTED) หรือยกเลิก (CANCELLED)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}

export class QuotationQueryDto {
  @ApiPropertyOptional({
    example: 'QT-2026',
    description: 'ค้นหาเลขที่ใบเสนอราคา, ชื่อลูกค้า, ชื่อโครงการ',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    example: 'APPROVED',
    description: 'กรองตามสถานะ (DRAFT, PENDING_REVIEW, PENDING_APPROVAL, APPROVED, SENT, ACCEPTED, REJECTED, EXPIRED, CANCELLED)',
    enum: QUOTATION_STATUSES,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;

  @ApiPropertyOptional({
    example: '73ede89f-7227-4563-9d60-57544ae4ec31',
    description: 'กรองตามรหัสลูกค้า',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsUUID('4')
  customerId?: string;

  @ApiPropertyOptional({
    example: '1eb5c522-f24b-4bbb-b9e7-1ca2f26f95fa',
    description: 'กรองตามรหัสโครงการ',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsUUID('4')
  projectId?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'ค้นหาตั้งแต่วันที่ (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'ค้นหาถึงวันที่ (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  endDate?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'หมายเลขหน้า',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
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
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}

export class QuotationItemResponse {
  @ApiProperty({ example: 'f8d3a123-4567-89ab-cdef-0123456789ab' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  quotationId!: string;

  @ApiProperty({ example: 'f29a8d94-437b-474a-a820-82658fa070da', nullable: true })
  productId!: string | null;

  @ApiProperty({ example: 'PRODUCT' })
  itemType!: string;

  @ApiProperty({ example: 'PRD-2026-0001', nullable: true })
  itemCode!: string | null;

  @ApiProperty({ example: 'อลูมิเนียมกล่อง 2x1 นิ้ว หนา 1.2 มม.' })
  itemName!: string;

  @ApiProperty({ example: 'ความยาว 6 เมตร ชุบอโนไดซ์สีธรรมชาติ', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 10.0 })
  quantity!: number;

  @ApiProperty({ example: 'เส้น' })
  unit!: string;

  @ApiProperty({ example: 320.0 })
  unitCost!: number;

  @ApiProperty({ example: 450.0 })
  unitPrice!: number;

  @ApiProperty({ example: 0.0 })
  discountAmount!: number;

  @ApiProperty({ example: 4500.0 })
  lineTotal!: number;

  @ApiProperty({ example: 1 })
  sortOrder!: number;

  @ApiProperty({ example: '2026-09-20T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-20T10:00:00.000Z' })
  updatedAt!: Date;
}

export class QuotationUserSummary {
  @ApiProperty({ example: '851eb25d-ee4b-408c-b776-7905d1467f5a' })
  id!: string;

  @ApiProperty({ example: 'test02' })
  username!: string;

  @ApiProperty({ example: 'สมชาย รักงาน' })
  fullName!: string;

  @ApiProperty({ example: 'SALES' })
  role!: string;
}

export class QuotationListItemResponse {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id!: string;

  @ApiProperty({ example: 'QT-2026-0001' })
  quotationNumber!: string;

  @ApiProperty({ example: '73ede89f-7227-4563-9d60-57544ae4ec31' })
  customerId!: string;

  @ApiProperty({ example: 'บริษัท พราวด์ บิลด์ดิ้ง จำกัด' })
  customerName!: string;

  @ApiProperty({ example: '1eb5c522-f24b-4bbb-b9e7-1ca2f26f95fa', nullable: true })
  projectId!: string | null;

  @ApiProperty({ example: 'พราวด์ ทาวเวอร์', nullable: true })
  projectName!: string | null;

  @ApiProperty({ example: 'APPROVED' })
  status!: string;

  @ApiProperty({ example: '2026-09-20' })
  issueDate!: string;

  @ApiProperty({ example: '2026-10-20' })
  validUntil!: string;

  @ApiProperty({ example: 30 })
  validDays!: number;

  @ApiProperty({ example: 110000.0 })
  subtotal!: number;

  @ApiProperty({ example: 5000.0 })
  discountAmount!: number;

  @ApiProperty({ example: 105000.0 })
  totalAfterDiscount!: number;

  @ApiProperty({ example: 7350.0 })
  vatAmount!: number;

  @ApiProperty({ example: 112350.0 })
  grandTotal!: number;

  @ApiProperty({ example: 3 })
  itemCount!: number;

  @ApiProperty({ type: () => QuotationUserSummary, nullable: true })
  seller!: QuotationUserSummary | null;

  @ApiProperty({ example: '2026-09-20T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-20T10:00:00.000Z' })
  updatedAt!: Date;
}

export class QuotationDetailResponse extends QuotationListItemResponse {
  @ApiProperty({ example: '88/12 ถนนสุขุมวิท 21 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110', nullable: true })
  customerAddress!: string | null;

  @ApiProperty({ example: '02-123-4567', nullable: true })
  customerPhone!: string | null;

  @ApiProperty({ example: '0105565012345', nullable: true })
  customerTaxId!: string | null;

  @ApiProperty({ example: 'คุณเกียรติศักดิ์ เจริญพร', nullable: true })
  customerContact!: string | null;

  @ApiProperty({ example: 'AMOUNT' })
  discountType!: string;

  @ApiProperty({ example: 5000.0 })
  discountRate!: number;

  @ApiProperty({ example: 7.0 })
  vatRate!: number;

  @ApiProperty({ example: 77000.0 })
  totalCost!: number;

  @ApiProperty({ example: 28000.0 })
  estimatedProfit!: number;

  @ApiProperty({ example: 26.67 })
  profitMarginPercent!: number;

  @ApiProperty({ example: 'มัดจำ 40% ...', nullable: true })
  paymentTerms!: string | null;

  @ApiProperty({ example: 'จัดส่งภายใน 21 วัน ...', nullable: true })
  deliveryTerms!: string | null;

  @ApiProperty({ example: 'รับประกัน 1 ปี ...', nullable: true })
  warrantyTerms!: string | null;

  @ApiProperty({ example: 'หมายเหตุ ...', nullable: true })
  notes!: string | null;

  @ApiProperty({ example: 'เหตุผลการปฏิเสธ ...', nullable: true })
  rejectionReason!: string | null;

  @ApiProperty({ type: () => QuotationUserSummary, nullable: true })
  approvedBy!: QuotationUserSummary | null;

  @ApiProperty({ type: [QuotationItemResponse] })
  items!: QuotationItemResponse[];
}

export class QuotationPaginationMeta {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 4 })
  total!: number;

  @ApiProperty({ example: 1 })
  totalPages!: number;
}

export class QuotationSummaryStats {
  @ApiProperty({ example: 12 })
  totalQuotations!: number;

  @ApiProperty({ example: 3 })
  pendingCount!: number;

  @ApiProperty({ example: 6 })
  approvedCount!: number;

  @ApiProperty({ example: 3450000.0 })
  totalValue!: number;
}

export class QuotationListResponse {
  @ApiProperty({ type: [QuotationListItemResponse] })
  items!: QuotationListItemResponse[];

  @ApiProperty({ type: QuotationPaginationMeta })
  pagination!: QuotationPaginationMeta;

  @ApiProperty({ type: QuotationSummaryStats })
  stats!: QuotationSummaryStats;
}

export class DeleteQuotationResponse {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id!: string;

  @ApiProperty({ example: 'ลบใบเสนอราคาเรียบร้อยแล้ว' })
  message!: string;
}

export class QuotationDetailApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => QuotationDetailResponse })
  data!: QuotationDetailResponse;
}

export class QuotationListApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => QuotationListResponse })
  data!: QuotationListResponse;
}

export class DeleteQuotationApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => DeleteQuotationResponse })
  data!: DeleteQuotationResponse;
}
