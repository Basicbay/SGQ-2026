import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export enum DashboardPeriod {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  THIS_WEEK = 'THIS_WEEK',
  LAST_7_DAYS = 'LAST_7_DAYS',
  THIS_MONTH = 'THIS_MONTH',
  THIS_QUARTER = 'THIS_QUARTER',
  THIS_YEAR = 'THIS_YEAR',
}

export function normalizeDashboardPeriod(val?: string): DashboardPeriod {
  if (!val) return DashboardPeriod.TODAY;
  const s = val.trim().toUpperCase();
  if (s === 'TODAY' || s === 'วันนี้') return DashboardPeriod.TODAY;
  if (s === 'YESTERDAY' || s === 'เมื่อวาน') return DashboardPeriod.YESTERDAY;
  if (s === 'THIS_WEEK' || s === 'สัปดาห์นี้' || s === 'สัปดานี้') return DashboardPeriod.THIS_WEEK;
  if (s === 'LAST_7_DAYS' || s === '7 วันล่าสุด' || s === '7วันล่าสุด') return DashboardPeriod.LAST_7_DAYS;
  if (s === 'THIS_MONTH' || s === 'เดือนนี้') return DashboardPeriod.THIS_MONTH;
  if (s === 'THIS_QUARTER' || s === 'ไตรมาสนี้') return DashboardPeriod.THIS_QUARTER;
  if (s === 'THIS_YEAR' || s === 'ปีนี้') return DashboardPeriod.THIS_YEAR;
  return DashboardPeriod.TODAY;
}

export class DashboardQueryDto {
  @ApiPropertyOptional({
    enum: DashboardPeriod,
    default: DashboardPeriod.TODAY,
    description: 'ช่วงเวลาที่ต้องการกรองข้อมูลภาพรวม (TODAY, YESTERDAY, THIS_WEEK, LAST_7_DAYS, THIS_MONTH, THIS_QUARTER, THIS_YEAR)',
  })
  @IsOptional()
  @IsString()
  period?: string;
}

export class DashboardDateRangeDto {
  @ApiProperty({ example: '2026-09-20' })
  startDate!: string;

  @ApiProperty({ example: '2026-09-20' })
  endDate!: string;
}

export class DashboardStatsDto {
  @ApiProperty({ example: 36487, description: 'มูลค่าใบเสนอราคารวมในช่วงเวลา' })
  totalValue!: number;

  @ApiProperty({ example: '฿36,487', description: 'มูลค่าใบเสนอราคาแสดงผลพร้อมเครื่องหมายสกุลเงิน' })
  totalValueFormatted!: string;

  @ApiProperty({ example: 18.4, description: 'เปอร์เซ็นต์การเปลี่ยนแปลงเทียบกับช่วงก่อนหน้า' })
  valueChangePercent!: number;

  @ApiProperty({ example: 'เทียบกับช่วงก่อนหน้า', description: 'คำอธิบายเปรียบเทียบ' })
  valueChangeText!: string;

  @ApiProperty({ example: 4, description: 'จำนวนใบเสนอราคาทั้งหมดในช่วงเวลา' })
  totalQuotations!: number;

  @ApiProperty({ example: '+1 รายการ', description: 'การเปลี่ยนแปลงจำนวนใบเสนอราคา' })
  totalQuotationsChange!: string;

  @ApiProperty({ example: 1, description: 'จำนวนใบเสนอราคาที่รอการอนุมัติ' })
  pendingCount!: number;

  @ApiProperty({ example: 2, description: 'จำนวนใบเสนอราคาที่อนุมัติหรือยอมรับแล้ว' })
  approvedCount!: number;

  @ApiProperty({ example: 2, description: 'จำนวนใบเสนอราคาที่ลูกค้ายอมรับ' })
  acceptedCount!: number;

  @ApiProperty({ example: 66.7, description: 'อัตราปิดการขาย (Win Rate %)' })
  winRate!: number;

  @ApiProperty({ example: 5, description: 'จำนวนลูกค้าทั้งหมดในระบบ' })
  totalCustomers!: number;

  @ApiProperty({ example: 5, description: 'จำนวนโครงการทั้งหมดในระบบ' })
  totalProjects!: number;

  @ApiProperty({ example: 10, description: 'จำนวนสินค้าทั้งหมดในระบบ' })
  totalProducts!: number;
}

export class DashboardTrendPointDto {
  @ApiProperty({ example: '08:00 - 12:00' })
  label!: string;

  @ApiProperty({ example: 36487 })
  value!: number;

  @ApiProperty({ example: 1 })
  count!: number;
}

export class DashboardTrendDto {
  @ApiProperty({ example: 'มูลค่าใบเสนอราคา' })
  title!: string;

  @ApiProperty({ example: 36487 })
  totalValue!: number;

  @ApiProperty({ example: 18.4 })
  changePercent!: number;

  @ApiProperty({ type: [DashboardTrendPointDto] })
  dataPoints!: DashboardTrendPointDto[];
}

export class DashboardStatusItemDto {
  @ApiProperty({ example: 'APPROVED' })
  status!: string;

  @ApiProperty({ example: 'อนุมัติแล้ว' })
  label!: string;

  @ApiProperty({ example: 2 })
  count!: number;

  @ApiProperty({ example: 50 })
  percentage!: number;

  @ApiProperty({ example: '#10b981' })
  color!: string;
}

export class DashboardRecentQuoteDto {
  @ApiProperty({ example: 'a50298b0-f699-4037-a06d-2d440c338114' })
  id!: string;

  @ApiProperty({ example: 'QT-2026-0004' })
  quotationNumber!: string;

  @ApiProperty({ example: 'บริษัท พราวด์ บิลด์ดิ้ง จำกัด' })
  customerName!: string;

  @ApiPropertyOptional({ example: 'โครงการสำนักงานพราวด์ ทาวเวอร์' })
  projectName!: string | null;

  @ApiProperty({ example: 36487 })
  grandTotal!: number;

  @ApiProperty({ example: '฿36,487' })
  grandTotalFormatted!: string;

  @ApiProperty({ example: 'DRAFT' })
  status!: string;

  @ApiProperty({ example: '2026-09-20' })
  issueDate!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ example: 'วันนี้, 12:06 น.' })
  dateFormatted!: string;
}

export class DashboardOverviewResponseDto {
  @ApiProperty({ enum: DashboardPeriod, example: DashboardPeriod.TODAY })
  period!: DashboardPeriod;

  @ApiProperty({ example: 'วันนี้' })
  periodLabel!: string;

  @ApiProperty({ type: DashboardDateRangeDto })
  dateRange!: DashboardDateRangeDto;

  @ApiProperty({ type: DashboardStatsDto })
  stats!: DashboardStatsDto;

  @ApiProperty({ type: DashboardTrendDto })
  trend!: DashboardTrendDto;

  @ApiProperty({ type: [DashboardStatusItemDto] })
  statusBreakdown!: DashboardStatusItemDto[];

  @ApiProperty({ type: [DashboardRecentQuoteDto] })
  recentQuotations!: DashboardRecentQuoteDto[];
}
