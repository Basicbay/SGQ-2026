import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @Length(1, 160) siteName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @Length(0, 500) siteDescription?: string;
  @ApiProperty({ required: false }) @IsOptional() iconUrl?: string | null;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @Length(0, 500) address?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @Length(0, 32) taxId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @Length(0, 200) companyName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @Length(0, 300) website?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @Length(0, 160) email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @Length(0, 40) phone?: string;
}

export class SettingsResponse extends PartialType(UpdateSettingsDto) {
  @ApiProperty() id!: string;
  @ApiProperty() updatedAt!: Date;
}

export class StorageBreakdownDto {
  @ApiProperty({ description: 'Data bytes in user tables' }) tableDataBytes!: number;
  @ApiProperty({ description: 'Pretty data size in user tables' }) tableDataPretty!: string;
  @ApiProperty({ description: 'Percentage of total storage for table data' }) tableDataPercent!: number;

  @ApiProperty({ description: 'Index bytes in user tables' }) indexBytes!: number;
  @ApiProperty({ description: 'Pretty index size' }) indexPretty!: string;
  @ApiProperty({ description: 'Percentage of total storage for indexes' }) indexPercent!: number;

  @ApiProperty({ description: 'System catalog and WAL bytes' }) systemBytes!: number;
  @ApiProperty({ description: 'Pretty system size' }) systemPretty!: string;
  @ApiProperty({ description: 'Percentage of total storage for system' }) systemPercent!: number;

  @ApiProperty({ description: 'Percentage of total storage remaining free' }) freePercent!: number;
}

export class StorageStatsDto {
  @ApiProperty({ description: 'Name of the database' }) databaseName!: string;
  @ApiProperty({ description: 'Name of the Neon project' }) projectName!: string;
  @ApiProperty({ description: 'Current Neon branch' }) branch!: string;
  @ApiProperty({ description: 'Total storage quota limit in bytes (512 MB)' }) totalLimitBytes!: number;
  @ApiProperty({ description: 'Total storage quota formatted' }) totalLimitPretty!: string;
  @ApiProperty({ description: 'Used storage in bytes' }) usedBytes!: number;
  @ApiProperty({ description: 'Used storage formatted' }) usedPretty!: string;
  @ApiProperty({ description: 'Remaining free storage in bytes' }) freeBytes!: number;
  @ApiProperty({ description: 'Remaining free storage formatted' }) freePretty!: string;
  @ApiProperty({ description: 'Percentage of storage used' }) usedPercent!: number;
  @ApiProperty({ type: StorageBreakdownDto }) breakdown!: StorageBreakdownDto;
}

