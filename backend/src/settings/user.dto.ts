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

export const USER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SALES', 'ESTIMATOR'] as const;
export type UserRoleType = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type UserStatusType = (typeof USER_STATUSES)[number];

export class CreateUserDto {
  @ApiProperty({
    example: 'somchai_k',
    description: 'ชื่อบัญชีผู้ใช้ (ตัวพิมพ์เล็ก ตัวเลข _ . -)',
    minLength: 3,
    maxLength: 64,
    pattern: '^[a-z0-9_.-]+$',
  })
  @IsString()
  @Length(3, 64)
  @Matches(/^[a-z0-9_.-]+$/, {
    message: 'ชื่อผู้ใช้งานต้องเป็นตัวพิมพ์เล็ก ตัวเลข และ _ . - เท่านั้น',
  })
  username!: string;

  @ApiProperty({
    format: 'password',
    example: 'Password!2026Secure',
    description: 'รหัสผ่านผู้ใช้งาน (8–128 ตัวอักษร)',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @Length(8, 128, {
    message: 'รหัสผ่านต้องมีความยาว 8 ถึง 128 ตัวอักษร',
  })
  password!: string;

  @ApiProperty({
    example: 'ADMIN',
    enum: USER_ROLES,
    description: 'บทบาทของผู้ใช้งาน (SUPER_ADMIN, ADMIN, SALES, ESTIMATOR)',
  })
  @IsString()
  @IsIn(USER_ROLES, {
    message: 'บทบาทผู้ใช้ต้องเป็น SUPER_ADMIN, ADMIN, SALES หรือ ESTIMATOR',
  })
  @MaxLength(32)
  role!: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    enum: USER_STATUSES,
    description: 'สถานะการใช้งาน (ACTIVE, INACTIVE)',
    default: 'ACTIVE',
  })
  @IsOptional()
  @IsString()
  @IsIn(USER_STATUSES, {
    message: 'สถานะผู้ใช้ต้องเป็น ACTIVE หรือ INACTIVE',
  })
  @MaxLength(32)
  status?: string = 'ACTIVE';

  @ApiProperty({
    example: 'สมชาย เข็มกลัด',
    description: 'ชื่อเต็มของผู้ใช้งาน',
    maxLength: 160,
  })
  @IsString()
  @Length(1, 160)
  @Matches(/\S/, { message: 'กรุณากรอกชื่อเต็ม' })
  fullName!: string;

  @ApiPropertyOptional({
    example: 'เต๋า',
    description: 'ชื่อเล่นของผู้ใช้งาน',
    maxLength: 64,
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  nickname?: string;

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
    example: 'somchai@example.com',
    description: 'อีเมลของผู้ใช้งาน',
    maxLength: 160,
  })
  @IsOptional()
  @ValidateIf((_object, value) => value !== '')
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional({
    example: '1100400123456',
    description: 'เลขบัตรประจำตัวประชาชน (13 หลัก)',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  citizenId?: string;

  @ApiPropertyOptional({
    example: '@somchai_line',
    description: 'Line ID ของผู้ใช้งาน',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lineId?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'ADMIN',
    enum: USER_ROLES,
    description: 'บทบาทของผู้ใช้งาน',
  })
  @IsOptional()
  @IsString()
  @IsIn(USER_ROLES, {
    message: 'บทบาทผู้ใช้ต้องเป็น SUPER_ADMIN, ADMIN, SALES หรือ ESTIMATOR',
  })
  @MaxLength(32)
  role?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    enum: USER_STATUSES,
    description: 'สถานะการใช้งาน (ACTIVE, INACTIVE)',
  })
  @IsOptional()
  @IsString()
  @IsIn(USER_STATUSES, {
    message: 'สถานะผู้ใช้ต้องเป็น ACTIVE หรือ INACTIVE',
  })
  @MaxLength(32)
  status?: string;

  @ApiPropertyOptional({
    example: 'สมชาย เข็มกลัด',
    description: 'ชื่อเต็มของผู้ใช้งาน',
    maxLength: 160,
  })
  @IsOptional()
  @IsString()
  @Length(1, 160)
  @Matches(/\S/, { message: 'กรุณากรอกชื่อเต็ม' })
  fullName?: string;

  @ApiPropertyOptional({
    example: 'เต๋า',
    description: 'ชื่อเล่นของผู้ใช้งาน',
    maxLength: 64,
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  nickname?: string;

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
    example: 'somchai@example.com',
    description: 'อีเมลของผู้ใช้งาน',
    maxLength: 160,
  })
  @IsOptional()
  @ValidateIf((_object, value) => value !== '')
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional({
    example: '1100400123456',
    description: 'เลขบัตรประจำตัวประชาชน',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  citizenId?: string;

  @ApiPropertyOptional({
    example: '@somchai_line',
    description: 'Line ID ของผู้ใช้งาน',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lineId?: string;

  @ApiPropertyOptional({
    format: 'password',
    example: 'NewPassword!2026Secure',
    description: 'รหัสผ่านใหม่ (หากต้องการเปลี่ยน 8–128 ตัวอักษร)',
    minLength: 8,
    maxLength: 128,
  })
  @IsOptional()
  @IsString()
  @Length(8, 128, {
    message: 'รหัสผ่านต้องมีความยาว 8 ถึง 128 ตัวอักษร',
  })
  password?: string;
}

export class UserQueryDto {
  @ApiPropertyOptional({
    description: 'ค้นหาจากชื่อ, ชื่อเล่น, ชื่อผู้ใช้, email, เบอร์โทร, Line ID หรือเลขบัตรประชาชน',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    enum: USER_ROLES,
    description: 'กรองตามบทบาทผู้ใช้',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  role?: string;

  @ApiPropertyOptional({
    enum: USER_STATUSES,
    description: 'กรองตามสถานะผู้ใช้ (ACTIVE, INACTIVE)',
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

export class UserItemResponse {
  @ApiProperty({ format: 'uuid', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'somchai_k' })
  username!: string;

  @ApiProperty({ example: 'ADMIN', enum: USER_ROLES })
  role!: string;

  @ApiProperty({ example: 'ACTIVE', enum: USER_STATUSES })
  status!: string;

  @ApiProperty({ example: 'สมชาย เข็มกลัด', nullable: true })
  fullName!: string | null;

  @ApiProperty({ example: 'เต๋า', nullable: true })
  nickname!: string | null;

  @ApiProperty({ example: '0812345678', nullable: true })
  phone!: string | null;

  @ApiProperty({ example: 'somchai@example.com', nullable: true })
  email!: string | null;

  @ApiProperty({ example: '1100400123456', nullable: true })
  citizenId!: string | null;

  @ApiProperty({ example: '@somchai_line', nullable: true })
  lineId!: string | null;

  @ApiProperty({ example: '2026-09-19T08:19:33.747Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-19T08:19:33.747Z' })
  updatedAt!: Date;
}

export class UserListResponse {
  @ApiProperty({ type: () => [UserItemResponse] })
  items!: UserItemResponse[];

  @ApiProperty({ example: 1 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 1 })
  totalPages!: number;
}

export class DeleteUserResponse {
  @ApiProperty({ example: true })
  deleted!: boolean;

  @ApiProperty({ format: 'uuid', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;
}

export class UserListApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => UserListResponse })
  data!: UserListResponse;
}

export class UserItemApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => UserItemResponse })
  data!: UserItemResponse;
}

export class DeleteUserApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => DeleteUserResponse })
  data!: DeleteUserResponse;
}
