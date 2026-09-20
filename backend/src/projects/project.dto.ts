import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
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
} from 'class-validator';
import { ApiResponseEnvelope } from '../auth/auth.dto.js';

export const PROJECT_TYPES = [
  'CONSTRUCTION',
  'RESIDENTIAL',
  'INTERIOR',
  'RENOVATION',
  'INFRASTRUCTURE',
] as const;
export type ProjectTypeValue = (typeof PROJECT_TYPES)[number];

export const PROJECT_STATUSES = [
  'PLANNING',
  'IN_PROGRESS',
  'COMPLETED',
  'ON_HOLD',
  'CANCELLED',
] as const;
export type ProjectStatusValue = (typeof PROJECT_STATUSES)[number];

export class CreateProjectDto {
  @ApiPropertyOptional({
    example: 'PRJ-2026-0001',
    description: 'รหัสโครงการ (หากไม่ระบุ ระบบจะสร้างให้อัตโนมัติ)',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @Length(3, 32, { message: 'รหัสโครงการต้องมีความยาว 3 ถึง 32 ตัวอักษร' })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'รหัสโครงการต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข และ _ . - เท่านั้น',
  })
  @MaxLength(32)
  projectCode?: string;

  @ApiProperty({
    example: 'งานก่อสร้างอาคารสำนักงานและโชว์รูม 3 ชั้น พราวด์ ทาวเวอร์',
    description: 'ชื่อโครงการ',
    maxLength: 200,
  })
  @IsString()
  @Length(1, 200)
  @Matches(/\S/, { message: 'กรุณากรอกชื่อโครงการ' })
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({
    example: '73ede89f-7227-4563-9d60-57544ae4ec31',
    description: 'รหัสลูกค้า (Customer UUID)',
    format: 'uuid',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsUUID('4', { message: 'รหัสลูกค้าต้องเป็นรูปแบบ UUID ที่ถูกต้อง' })
  customerId?: string | null;

  @ApiPropertyOptional({
    example: 'CONSTRUCTION',
    enum: PROJECT_TYPES,
    description: 'ประเภทโครงการ (CONSTRUCTION, RESIDENTIAL, INTERIOR, RENOVATION, INFRASTRUCTURE)',
    default: 'CONSTRUCTION',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @IsIn(PROJECT_TYPES, {
    message: 'ประเภทโครงการไม่ถูกต้อง',
  })
  @MaxLength(50)
  projectType?: string;

  @ApiPropertyOptional({
    example: 'ถนนบางนา-ตราด กม.14 ต.บางพลีใหญ่ อ.บางพลี จ.สมุทรปราการ',
    description: 'สถานที่ก่อสร้าง / ทำเลที่ตั้งโครงการ',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  @ApiPropertyOptional({
    example: 18500000.0,
    description: 'งบประมาณโครงการ (บาท)',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'งบประมาณต้องเป็นตัวเลข' })
  @Min(0, { message: 'งบประมาณต้องไม่น้อยกว่า 0' })
  budget?: number;

  @ApiPropertyOptional({
    example: '2026-02-01',
    description: 'วันที่เริ่มต้นโครงการ (YYYY-MM-DD)',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @MaxLength(20)
  startDate?: string | null;

  @ApiPropertyOptional({
    example: '2026-11-30',
    description: 'วันที่สิ้นสุดโครงการ (YYYY-MM-DD)',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @MaxLength(20)
  endDate?: string | null;

  @ApiPropertyOptional({
    example: 'PLANNING',
    enum: PROJECT_STATUSES,
    description: 'สถานะโครงการ (PLANNING, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED)',
    default: 'PLANNING',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @IsIn(PROJECT_STATUSES, {
    message: 'สถานะโครงการไม่ถูกต้อง',
  })
  @MaxLength(32)
  status?: string;

  @ApiPropertyOptional({
    example: 'ก่อสร้างโครงสร้างอาคาร คสล. 3 ชั้น งานสถาปัตยกรรมและวิศวกรรมอาคารครบวงจร',
    description: 'รายละเอียดขอบเขตงานโครงการ',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'โครงการเฟส 1 วางฐานรากและเทเสร็จเรียบร้อย',
    description: 'หมายเหตุเพิ่มเติม',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({
    example: 'PRJ-2026-0001',
    description: 'รหัสโครงการ',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @Length(3, 32, { message: 'รหัสโครงการต้องมีความยาว 3 ถึง 32 ตัวอักษร' })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'รหัสโครงการต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข และ _ . - เท่านั้น',
  })
  @MaxLength(32)
  projectCode?: string;

  @ApiPropertyOptional({
    example: 'งานก่อสร้างอาคารสำนักงานและโชว์รูม 3 ชั้น พราวด์ ทาวเวอร์',
    description: 'ชื่อโครงการ',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  @Matches(/\S/, { message: 'กรุณากรอกชื่อโครงการ' })
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    example: '73ede89f-7227-4563-9d60-57544ae4ec31',
    description: 'รหัสลูกค้า (Customer UUID)',
    format: 'uuid',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsUUID('4', { message: 'รหัสลูกค้าต้องเป็นรูปแบบ UUID ที่ถูกต้อง' })
  customerId?: string | null;

  @ApiPropertyOptional({
    example: 'CONSTRUCTION',
    enum: PROJECT_TYPES,
    description: 'ประเภทโครงการ (CONSTRUCTION, RESIDENTIAL, INTERIOR, RENOVATION, INFRASTRUCTURE)',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @IsIn(PROJECT_TYPES, {
    message: 'ประเภทโครงการไม่ถูกต้อง',
  })
  @MaxLength(50)
  projectType?: string;

  @ApiPropertyOptional({
    example: 'ถนนบางนา-ตราด กม.14 ต.บางพลีใหญ่ อ.บางพลี จ.สมุทรปราการ',
    description: 'สถานที่ก่อสร้าง / ทำเลที่ตั้งโครงการ',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  @ApiPropertyOptional({
    example: 18500000.0,
    description: 'งบประมาณโครงการ (บาท)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'งบประมาณต้องเป็นตัวเลข' })
  @Min(0, { message: 'งบประมาณต้องไม่น้อยกว่า 0' })
  budget?: number;

  @ApiPropertyOptional({
    example: '2026-02-01',
    description: 'วันที่เริ่มต้นโครงการ (YYYY-MM-DD)',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @MaxLength(20)
  startDate?: string | null;

  @ApiPropertyOptional({
    example: '2026-11-30',
    description: 'วันที่สิ้นสุดโครงการ (YYYY-MM-DD)',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @MaxLength(20)
  endDate?: string | null;

  @ApiPropertyOptional({
    example: 'IN_PROGRESS',
    enum: PROJECT_STATUSES,
    description: 'สถานะโครงการ (PLANNING, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED)',
  })
  @IsOptional()
  @ValidateIf((_object, value) => Boolean(value))
  @IsString()
  @IsIn(PROJECT_STATUSES, {
    message: 'สถานะโครงการไม่ถูกต้อง',
  })
  @MaxLength(32)
  status?: string;

  @ApiPropertyOptional({
    example: 'ก่อสร้างโครงสร้างอาคาร คสล. 3 ชั้น งานสถาปัตยกรรมและวิศวกรรมอาคารครบวงจร',
    description: 'รายละเอียดขอบเขตงานโครงการ',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'โครงการเฟส 1 วางฐานรากและเทเสร็จเรียบร้อย',
    description: 'หมายเหตุเพิ่มเติม',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class ProjectQueryDto {
  @ApiPropertyOptional({
    description: 'ค้นหาจากรหัสโครงการ, ชื่อโครงการ, ทำเลที่ตั้ง, ชื่อลูกค้า',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    description: 'กรองตามรหัสลูกค้า (Customer UUID)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  customerId?: string;

  @ApiPropertyOptional({
    enum: PROJECT_TYPES,
    description: 'กรองตามประเภทโครงการ',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  projectType?: string;

  @ApiPropertyOptional({
    enum: PROJECT_STATUSES,
    description: 'กรองตามสถานะโครงการ',
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

export class ProjectCustomerSummary {
  @ApiProperty({ format: 'uuid', example: '73ede89f-7227-4563-9d60-57544ae4ec31' })
  id!: string;

  @ApiProperty({ example: 'CUST-2026-0001' })
  customerCode!: string;

  @ApiProperty({ example: 'บริษัท พราวด์ บิลด์ดิ้ง จำกัด' })
  name!: string;

  @ApiProperty({ example: 'COMPANY' })
  customerType!: string;

  @ApiPropertyOptional({ example: '0812345678', nullable: true })
  phone!: string | null;

  @ApiPropertyOptional({ example: 'contact@proudbuilding.co.th', nullable: true })
  email!: string | null;
}

export class ProjectItemResponse {
  @ApiProperty({ format: 'uuid', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id!: string;

  @ApiProperty({ example: 'PRJ-2026-0001' })
  projectCode!: string;

  @ApiProperty({ example: 'งานก่อสร้างอาคารสำนักงานและโชว์รูม 3 ชั้น พราวด์ ทาวเวอร์' })
  name!: string;

  @ApiPropertyOptional({ format: 'uuid', example: '73ede89f-7227-4563-9d60-57544ae4ec31', nullable: true })
  customerId!: string | null;

  @ApiPropertyOptional({ type: () => ProjectCustomerSummary, nullable: true })
  customer!: ProjectCustomerSummary | null;

  @ApiPropertyOptional({ example: 'บริษัท พราวด์ บิลด์ดิ้ง จำกัด', nullable: true })
  customerName!: string | null;

  @ApiProperty({ example: 'CONSTRUCTION', enum: PROJECT_TYPES })
  projectType!: string;

  @ApiPropertyOptional({ example: 'ถนนบางนา-ตราด กม.14 ต.บางพลีใหญ่ อ.บางพลี จ.สมุทรปราการ', nullable: true })
  location!: string | null;

  @ApiProperty({ example: 18500000.0 })
  budget!: number;

  @ApiPropertyOptional({ example: '2026-02-01', nullable: true })
  startDate!: string | null;

  @ApiPropertyOptional({ example: '2026-11-30', nullable: true })
  endDate!: string | null;

  @ApiProperty({ example: 'IN_PROGRESS', enum: PROJECT_STATUSES })
  status!: string;

  @ApiPropertyOptional({ example: 'ก่อสร้างโครงสร้างอาคาร คสล. 3 ชั้น', nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ example: 'โครงการเฟส 1 วางฐานรากและเทเสร็จเรียบร้อย', nullable: true })
  note!: string | null;

  @ApiProperty({ example: '2026-09-20T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-20T00:00:00.000Z' })
  updatedAt!: Date;
}

export class ProjectListResponse {
  @ApiProperty({ type: () => [ProjectItemResponse] })
  items!: ProjectItemResponse[];

  @ApiProperty({ example: 5 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 1 })
  totalPages!: number;
}

export class DeleteProjectResponse {
  @ApiProperty({ example: true })
  deleted!: boolean;

  @ApiProperty({ format: 'uuid', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id!: string;
}

export class ProjectListApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => ProjectListResponse })
  data!: ProjectListResponse;
}

export class ProjectItemApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => ProjectItemResponse })
  data!: ProjectItemResponse;
}

export class DeleteProjectApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => DeleteProjectResponse })
  data!: DeleteProjectResponse;
}
