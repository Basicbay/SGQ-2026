import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../database/customer.entity.js';
import { Project } from '../database/project.entity.js';
import { Product } from '../database/product.entity.js';
import { Quotation, QuotationStatus } from '../database/quotation.entity.js';
import {
  DashboardOverviewResponseDto,
  DashboardPeriod,
  DashboardRecentQuoteDto,
  DashboardStatusItemDto,
  DashboardTrendPointDto,
  normalizeDashboardPeriod,
} from './dashboard.dto.js';

interface BucketItem {
  label: string;
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
}

interface PeriodRange {
  period: DashboardPeriod;
  periodLabel: string;
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
  prevStart: Date;
  prevEnd: Date;
  prevStartStr: string;
  prevEndStr: string;
  buckets: BucketItem[];
}

const BANGKOK_OFFSET_HOURS = 7;

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatDateStr(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

// Convert Bangkok local date components to UTC Date object
function bangkokToUtc(y: number, m: number, d: number, h: number = 0, min: number = 0, s: number = 0, ms: number = 0): Date {
  return new Date(Date.UTC(y, m, d, h - BANGKOK_OFFSET_HOURS, min, s, ms));
}

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

const THAI_DAYS_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Quotation)
    private readonly quotationRepository: Repository<Quotation>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  private round(val: number, decimals: number = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round((val + Number.EPSILON) * factor) / factor;
  }

  private formatCurrency(val: number): string {
    return '฿' + (Number(val) || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  private formatThaiDateTime(dateInput: Date | string, todayStr: string, yesterdayStr: string): string {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '-';

    const bkk = new Date(d.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
    const y = bkk.getUTCFullYear();
    const m = bkk.getUTCMonth();
    const date = bkk.getUTCDate();
    const hours = pad(bkk.getUTCHours());
    const mins = pad(bkk.getUTCMinutes());
    const dateStr = formatDateStr(y, m, date);

    if (dateStr === todayStr) {
      return `วันนี้, ${hours}:${mins} น.`;
    }
    if (dateStr === yesterdayStr) {
      return `เมื่อวาน, ${hours}:${mins} น.`;
    }

    const thaiYearShort = (y + 543) % 100;
    return `${date} ${THAI_MONTHS_SHORT[m]} ${thaiYearShort}, ${hours}:${mins} น.`;
  }

  public calculatePeriodRange(period: DashboardPeriod, refDate: Date = new Date()): PeriodRange {
    // Current time in Bangkok
    const bkkNow = new Date(refDate.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
    const y = bkkNow.getUTCFullYear();
    const m = bkkNow.getUTCMonth();
    const d = bkkNow.getUTCDate();
    const dayOfWeek = bkkNow.getUTCDay(); // 0 = Sun, 1 = Mon ...

    let start: Date;
    let end: Date;
    let startStr: string;
    let endStr: string;
    let prevStart: Date;
    let prevEnd: Date;
    let prevStartStr: string;
    let prevEndStr: string;
    let periodLabel: string;
    const buckets: BucketItem[] = [];

    switch (period) {
      case DashboardPeriod.TODAY: {
        periodLabel = 'วันนี้';
        start = bangkokToUtc(y, m, d, 0, 0, 0);
        end = bangkokToUtc(y, m, d, 23, 59, 59, 999);
        startStr = formatDateStr(y, m, d);
        endStr = startStr;

        prevStart = bangkokToUtc(y, m, d - 1, 0, 0, 0);
        prevEnd = bangkokToUtc(y, m, d - 1, 23, 59, 59, 999);
        const prevBkk = new Date(prevStart.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
        prevStartStr = formatDateStr(prevBkk.getUTCFullYear(), prevBkk.getUTCMonth(), prevBkk.getUTCDate());
        prevEndStr = prevStartStr;

        // 6 x 4-hour intervals
        for (let h = 0; h < 24; h += 4) {
          const bStart = bangkokToUtc(y, m, d, h, 0, 0);
          const bEnd = bangkokToUtc(y, m, d, h + 3, 59, 59, 999);
          buckets.push({
            label: `${pad(h)}:00 - ${pad(h + 4)}:00`,
            start: bStart,
            end: bEnd,
            startStr,
            endStr,
          });
        }
        break;
      }

      case DashboardPeriod.YESTERDAY: {
        periodLabel = 'เมื่อวาน';
        start = bangkokToUtc(y, m, d - 1, 0, 0, 0);
        end = bangkokToUtc(y, m, d - 1, 23, 59, 59, 999);
        const yBkk = new Date(start.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
        startStr = formatDateStr(yBkk.getUTCFullYear(), yBkk.getUTCMonth(), yBkk.getUTCDate());
        endStr = startStr;

        prevStart = bangkokToUtc(y, m, d - 2, 0, 0, 0);
        prevEnd = bangkokToUtc(y, m, d - 2, 23, 59, 59, 999);
        const pBkk = new Date(prevStart.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
        prevStartStr = formatDateStr(pBkk.getUTCFullYear(), pBkk.getUTCMonth(), pBkk.getUTCDate());
        prevEndStr = prevStartStr;

        for (let h = 0; h < 24; h += 4) {
          const bStart = bangkokToUtc(yBkk.getUTCFullYear(), yBkk.getUTCMonth(), yBkk.getUTCDate(), h, 0, 0);
          const bEnd = bangkokToUtc(yBkk.getUTCFullYear(), yBkk.getUTCMonth(), yBkk.getUTCDate(), h + 3, 59, 59, 999);
          buckets.push({
            label: `${pad(h)}:00 - ${pad(h + 4)}:00`,
            start: bStart,
            end: bEnd,
            startStr,
            endStr,
          });
        }
        break;
      }

      case DashboardPeriod.THIS_WEEK: {
        periodLabel = 'สัปดาห์นี้';
        // Monday is day 1. If Sunday (0), diff is -6, else 1 - dayOfWeek
        const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        start = bangkokToUtc(y, m, d + diffToMon, 0, 0, 0);
        end = bangkokToUtc(y, m, d + diffToMon + 6, 23, 59, 59, 999);

        const sBkk = new Date(start.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
        const eBkk = new Date(end.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
        startStr = formatDateStr(sBkk.getUTCFullYear(), sBkk.getUTCMonth(), sBkk.getUTCDate());
        endStr = formatDateStr(eBkk.getUTCFullYear(), eBkk.getUTCMonth(), eBkk.getUTCDate());

        prevStart = bangkokToUtc(y, m, d + diffToMon - 7, 0, 0, 0);
        prevEnd = bangkokToUtc(y, m, d + diffToMon - 1, 23, 59, 59, 999);
        const psBkk = new Date(prevStart.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
        const peBkk = new Date(prevEnd.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
        prevStartStr = formatDateStr(psBkk.getUTCFullYear(), psBkk.getUTCMonth(), psBkk.getUTCDate());
        prevEndStr = formatDateStr(peBkk.getUTCFullYear(), peBkk.getUTCMonth(), peBkk.getUTCDate());

        // 7 days in week
        const dayNames = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
        for (let i = 0; i < 7; i++) {
          const bStart = bangkokToUtc(y, m, d + diffToMon + i, 0, 0, 0);
          const bEnd = bangkokToUtc(y, m, d + diffToMon + i, 23, 59, 59, 999);
          const curBkk = new Date(bStart.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
          const bDateStr = formatDateStr(curBkk.getUTCFullYear(), curBkk.getUTCMonth(), curBkk.getUTCDate());
          buckets.push({
            label: `${dayNames[i]} (${curBkk.getUTCDate()})`,
            start: bStart,
            end: bEnd,
            startStr: bDateStr,
            endStr: bDateStr,
          });
        }
        break;
      }

      case DashboardPeriod.LAST_7_DAYS: {
        periodLabel = '7 วันล่าสุด';
        start = bangkokToUtc(y, m, d - 6, 0, 0, 0);
        end = bangkokToUtc(y, m, d, 23, 59, 59, 999);
        const sBkk = new Date(start.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
        startStr = formatDateStr(sBkk.getUTCFullYear(), sBkk.getUTCMonth(), sBkk.getUTCDate());
        endStr = formatDateStr(y, m, d);

        prevStart = bangkokToUtc(y, m, d - 13, 0, 0, 0);
        prevEnd = bangkokToUtc(y, m, d - 7, 23, 59, 59, 999);
        const psBkk = new Date(prevStart.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
        const peBkk = new Date(prevEnd.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
        prevStartStr = formatDateStr(psBkk.getUTCFullYear(), psBkk.getUTCMonth(), psBkk.getUTCDate());
        prevEndStr = formatDateStr(peBkk.getUTCFullYear(), peBkk.getUTCMonth(), peBkk.getUTCDate());

        for (let i = 6; i >= 0; i--) {
          const bStart = bangkokToUtc(y, m, d - i, 0, 0, 0);
          const bEnd = bangkokToUtc(y, m, d - i, 23, 59, 59, 999);
          const curBkk = new Date(bStart.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
          const bDateStr = formatDateStr(curBkk.getUTCFullYear(), curBkk.getUTCMonth(), curBkk.getUTCDate());
          buckets.push({
            label: `${curBkk.getUTCDate()} ${THAI_MONTHS_SHORT[curBkk.getUTCMonth()]}`,
            start: bStart,
            end: bEnd,
            startStr: bDateStr,
            endStr: bDateStr,
          });
        }
        break;
      }

      case DashboardPeriod.THIS_MONTH: {
        periodLabel = 'เดือนนี้';
        start = bangkokToUtc(y, m, 1, 0, 0, 0);
        // last day of current month
        end = bangkokToUtc(y, m + 1, 0, 23, 59, 59, 999);
        const eBkk = new Date(end.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
        startStr = formatDateStr(y, m, 1);
        endStr = formatDateStr(y, m, eBkk.getUTCDate());

        prevStart = bangkokToUtc(y, m - 1, 1, 0, 0, 0);
        prevEnd = bangkokToUtc(y, m, 0, 23, 59, 59, 999);
        const psBkk = new Date(prevStart.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
        const peBkk = new Date(prevEnd.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
        prevStartStr = formatDateStr(psBkk.getUTCFullYear(), psBkk.getUTCMonth(), 1);
        prevEndStr = formatDateStr(peBkk.getUTCFullYear(), peBkk.getUTCMonth(), peBkk.getUTCDate());

        // 6 intervals of 5 days: 1-5, 6-10, 11-15, 16-20, 21-25, 26-end
        const totalDays = eBkk.getUTCDate();
        const intervals = [
          { s: 1, e: 5 },
          { s: 6, e: 10 },
          { s: 11, e: 15 },
          { s: 16, e: 20 },
          { s: 21, e: 25 },
          { s: 26, e: totalDays },
        ];
        for (const item of intervals) {
          const bStart = bangkokToUtc(y, m, item.s, 0, 0, 0);
          const bEnd = bangkokToUtc(y, m, item.e, 23, 59, 59, 999);
          buckets.push({
            label: `${item.s}-${item.e} ${THAI_MONTHS_SHORT[m]}`,
            start: bStart,
            end: bEnd,
            startStr: formatDateStr(y, m, item.s),
            endStr: formatDateStr(y, m, item.e),
          });
        }
        break;
      }

      case DashboardPeriod.THIS_QUARTER: {
        periodLabel = 'ไตรมาสนี้';
        const qStartMonth = Math.floor(m / 3) * 3;
        start = bangkokToUtc(y, qStartMonth, 1, 0, 0, 0);
        end = bangkokToUtc(y, qStartMonth + 3, 0, 23, 59, 59, 999);
        const qEndBkk = new Date(end.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
        startStr = formatDateStr(y, qStartMonth, 1);
        endStr = formatDateStr(y, qStartMonth + 2, qEndBkk.getUTCDate());

        prevStart = bangkokToUtc(y, qStartMonth - 3, 1, 0, 0, 0);
        prevEnd = bangkokToUtc(y, qStartMonth, 0, 23, 59, 59, 999);
        const pqEndBkk = new Date(prevEnd.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
        const pqStartBkk = new Date(prevStart.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
        prevStartStr = formatDateStr(pqStartBkk.getUTCFullYear(), pqStartBkk.getUTCMonth(), 1);
        prevEndStr = formatDateStr(pqEndBkk.getUTCFullYear(), pqEndBkk.getUTCMonth(), pqEndBkk.getUTCDate());

        for (let i = 0; i < 3; i++) {
          const curMonth = qStartMonth + i;
          const bStart = bangkokToUtc(y, curMonth, 1, 0, 0, 0);
          const bEnd = bangkokToUtc(y, curMonth + 1, 0, 23, 59, 59, 999);
          const curEndBkk = new Date(bEnd.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
          buckets.push({
            label: `${THAI_MONTHS_SHORT[curMonth]}`,
            start: bStart,
            end: bEnd,
            startStr: formatDateStr(y, curMonth, 1),
            endStr: formatDateStr(y, curMonth, curEndBkk.getUTCDate()),
          });
        }
        break;
      }

      case DashboardPeriod.THIS_YEAR:
      default: {
        periodLabel = 'ปีนี้';
        start = bangkokToUtc(y, 0, 1, 0, 0, 0);
        end = bangkokToUtc(y, 11, 31, 23, 59, 59, 999);
        startStr = formatDateStr(y, 0, 1);
        endStr = formatDateStr(y, 11, 31);

        prevStart = bangkokToUtc(y - 1, 0, 1, 0, 0, 0);
        prevEnd = bangkokToUtc(y - 1, 11, 31, 23, 59, 59, 999);
        prevStartStr = formatDateStr(y - 1, 0, 1);
        prevEndStr = formatDateStr(y - 1, 11, 31);

        for (let i = 0; i < 12; i++) {
          const bStart = bangkokToUtc(y, i, 1, 0, 0, 0);
          const bEnd = bangkokToUtc(y, i + 1, 0, 23, 59, 59, 999);
          const curEndBkk = new Date(bEnd.getTime() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
          buckets.push({
            label: THAI_MONTHS_SHORT[i],
            start: bStart,
            end: bEnd,
            startStr: formatDateStr(y, i, 1),
            endStr: formatDateStr(y, i, curEndBkk.getUTCDate()),
          });
        }
        break;
      }
    }

    return {
      period,
      periodLabel,
      start,
      end,
      startStr,
      endStr,
      prevStart,
      prevEnd,
      prevStartStr,
      prevEndStr,
      buckets,
    };
  }

  private isQuotationInRange(q: Quotation, rangeStart: Date, rangeEnd: Date, startStr: string, endStr: string): boolean {
    const issueDate = q.issueDate?.trim();
    if (issueDate && issueDate.length === 10) {
      if (issueDate >= startStr && issueDate <= endStr) {
        return true;
      }
    }
    const createdAt = q.createdAt ? new Date(q.createdAt) : null;
    if (createdAt && !isNaN(createdAt.getTime())) {
      if (createdAt >= rangeStart && createdAt <= rangeEnd) {
        return true;
      }
    }
    return false;
  }

  public async getOverview(periodInput?: string): Promise<DashboardOverviewResponseDto> {
    const period = normalizeDashboardPeriod(periodInput);
    const range = this.calculatePeriodRange(period);

    // Bangkok dates for display
    const bkkNow = new Date(Date.now() + BANGKOK_OFFSET_HOURS * 3600 * 1000);
    const todayStr = formatDateStr(bkkNow.getUTCFullYear(), bkkNow.getUTCMonth(), bkkNow.getUTCDate());
    const yBkk = new Date(Date.now() - 24 * 3600 * 1000 + BANGKOK_OFFSET_HOURS * 3600 * 1000);
    const yesterdayStr = formatDateStr(yBkk.getUTCFullYear(), yBkk.getUTCMonth(), yBkk.getUTCDate());

    // Fetch all quotations with relations
    const [allQuotes, totalCustomers, totalProjects, totalProducts] = await Promise.all([
      this.quotationRepository.find({
        order: { createdAt: 'DESC' },
        relations: { customer: true, project: true },
      }),
      this.customerRepository.count(),
      this.projectRepository.count(),
      this.productRepository.count(),
    ]);

    // Filter quotations for current period and previous period
    const currentPeriodQuotes: Quotation[] = [];
    const prevPeriodQuotes: Quotation[] = [];

    for (const q of allQuotes) {
      if (this.isQuotationInRange(q, range.start, range.end, range.startStr, range.endStr)) {
        currentPeriodQuotes.push(q);
      } else if (this.isQuotationInRange(q, range.prevStart, range.prevEnd, range.prevStartStr, range.prevEndStr)) {
        prevPeriodQuotes.push(q);
      }
    }

    // Aggregate Current Period
    let currentTotalValue = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let acceptedCount = 0;

    const statusCounts: Record<string, number> = {
      [QuotationStatus.ACCEPTED]: 0,
      [QuotationStatus.APPROVED]: 0,
      [QuotationStatus.PENDING_APPROVAL]: 0,
      [QuotationStatus.SENT]: 0,
      [QuotationStatus.DRAFT]: 0,
      [QuotationStatus.REJECTED]: 0,
    };

    for (const q of currentPeriodQuotes) {
      const val = Number(q.grandTotal) || 0;
      currentTotalValue += val;

      const st = q.status;
      if (st === QuotationStatus.PENDING_APPROVAL || st === QuotationStatus.PENDING_REVIEW) {
        pendingCount++;
        statusCounts[QuotationStatus.PENDING_APPROVAL] = (statusCounts[QuotationStatus.PENDING_APPROVAL] || 0) + 1;
      } else if (st === QuotationStatus.ACCEPTED) {
        acceptedCount++;
        approvedCount++;
        statusCounts[QuotationStatus.ACCEPTED] = (statusCounts[QuotationStatus.ACCEPTED] || 0) + 1;
      } else if (st === QuotationStatus.APPROVED) {
        approvedCount++;
        statusCounts[QuotationStatus.APPROVED] = (statusCounts[QuotationStatus.APPROVED] || 0) + 1;
      } else if (st === QuotationStatus.SENT) {
        approvedCount++;
        statusCounts[QuotationStatus.SENT] = (statusCounts[QuotationStatus.SENT] || 0) + 1;
      } else if (st === QuotationStatus.REJECTED || st === QuotationStatus.CANCELLED) {
        statusCounts[QuotationStatus.REJECTED] = (statusCounts[QuotationStatus.REJECTED] || 0) + 1;
      } else {
        statusCounts[QuotationStatus.DRAFT] = (statusCounts[QuotationStatus.DRAFT] || 0) + 1;
      }
    }

    // Aggregate Previous Period for comparison
    let prevTotalValue = 0;
    for (const q of prevPeriodQuotes) {
      prevTotalValue += Number(q.grandTotal) || 0;
    }

    // Value Change %
    let valueChangePercent = 0;
    if (prevTotalValue > 0) {
      valueChangePercent = this.round(((currentTotalValue - prevTotalValue) / prevTotalValue) * 100, 1);
    } else if (currentTotalValue > 0) {
      valueChangePercent = 100;
    }

    const currentTotalQuotations = currentPeriodQuotes.length;
    const prevTotalQuotations = prevPeriodQuotes.length;
    const quoteDiff = currentTotalQuotations - prevTotalQuotations;
    const totalQuotationsChange =
      quoteDiff > 0
        ? `+${quoteDiff} รายการจากช่วงก่อน`
        : quoteDiff < 0
          ? `${quoteDiff} รายการจากช่วงก่อน`
          : 'เท่ากับช่วงก่อนหน้า';

    const winRate =
      currentTotalQuotations > 0
        ? this.round((acceptedCount / currentTotalQuotations) * 100, 1)
        : 0;

    // Trend points across buckets
    const trendDataPoints: DashboardTrendPointDto[] = range.buckets.map((b) => {
      let bValue = 0;
      let bCount = 0;

      for (const q of currentPeriodQuotes) {
        if (this.isQuotationInRange(q, b.start, b.end, b.startStr, b.endStr)) {
          bValue += Number(q.grandTotal) || 0;
          bCount++;
        }
      }

      return {
        label: b.label,
        value: this.round(bValue),
        count: bCount,
      };
    });

    // Status breakdown items with colors
    const totalStatusCount = Math.max(1, currentTotalQuotations);
    const statusConfigList: { status: string; label: string; color: string }[] = [
      { status: 'ACCEPTED', label: 'ลูกค้ายอมรับ', color: '#0d9488' },
      { status: 'APPROVED', label: 'อนุมัติแล้ว', color: '#10b981' },
      { status: 'PENDING_APPROVAL', label: 'รออนุมัติ', color: '#f59e0b' },
      { status: 'SENT', label: 'ส่งให้ลูกค้าแล้ว', color: '#3b82f6' },
      { status: 'DRAFT', label: 'ฉบับร่าง', color: '#71717a' },
      { status: 'REJECTED', label: 'ปฏิเสธ/ยกเลิก', color: '#ef4444' },
    ];

    const statusBreakdown: DashboardStatusItemDto[] = statusConfigList.map((cfg) => {
      const count = statusCounts[cfg.status] || 0;
      const pct = currentTotalQuotations > 0 ? this.round((count / totalStatusCount) * 100, 0) : 0;
      return {
        status: cfg.status,
        label: cfg.label,
        count,
        percentage: pct,
        color: cfg.color,
      };
    });

    // Recent quotations: prioritize current period, fallback to system recent if current period has 0
    const sourceQuotes = currentPeriodQuotes.length > 0 ? currentPeriodQuotes : allQuotes;
    const recentQuotations: DashboardRecentQuoteDto[] = sourceQuotes.slice(0, 6).map((q) => {
      const gTotal = Number(q.grandTotal) || 0;
      return {
        id: q.id,
        quotationNumber: q.quotationNumber,
        customerName: q.customer?.name || q.customerName,
        projectName: q.project?.name || q.projectName || null,
        grandTotal: this.round(gTotal),
        grandTotalFormatted: this.formatCurrency(gTotal),
        status: q.status,
        issueDate: q.issueDate,
        createdAt: q.createdAt,
        dateFormatted: this.formatThaiDateTime(q.createdAt, todayStr, yesterdayStr),
      };
    });

    return {
      period: range.period,
      periodLabel: range.periodLabel,
      dateRange: {
        startDate: range.startStr,
        endDate: range.endStr,
      },
      stats: {
        totalValue: this.round(currentTotalValue),
        totalValueFormatted: this.formatCurrency(currentTotalValue),
        valueChangePercent,
        valueChangeText: `เทียบกับ${range.period === DashboardPeriod.TODAY ? 'เมื่อวาน' : 'ช่วงก่อนหน้า'}`,
        totalQuotations: currentTotalQuotations,
        totalQuotationsChange,
        pendingCount,
        approvedCount,
        acceptedCount,
        winRate,
        totalCustomers,
        totalProjects,
        totalProducts,
      },
      trend: {
        title: `มูลค่าใบเสนอราคา (${range.periodLabel})`,
        totalValue: this.round(currentTotalValue),
        changePercent: valueChangePercent,
        dataPoints: trendDataPoints,
      },
      statusBreakdown,
      recentQuotations,
    };
  }
}
