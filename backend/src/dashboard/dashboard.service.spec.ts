import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DashboardService } from './dashboard.service.js';
import { DashboardPeriod, normalizeDashboardPeriod } from './dashboard.dto.js';
import { QuotationStatus } from '../database/quotation.entity.js';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockQuotationRepo: any;
  let mockCustomerRepo: any;
  let mockProjectRepo: any;
  let mockProductRepo: any;

  beforeEach(() => {
    mockQuotationRepo = {
      find: vi.fn(),
    };
    mockCustomerRepo = {
      count: vi.fn().mockResolvedValue(5),
    };
    mockProjectRepo = {
      count: vi.fn().mockResolvedValue(5),
    };
    mockProductRepo = {
      count: vi.fn().mockResolvedValue(10),
    };

    service = new DashboardService(
      mockQuotationRepo,
      mockCustomerRepo,
      mockProjectRepo,
      mockProductRepo,
    );
  });

  it('should normalize periods correctly', () => {
    expect(normalizeDashboardPeriod('TODAY')).toBe(DashboardPeriod.TODAY);
    expect(normalizeDashboardPeriod('วันนี้')).toBe(DashboardPeriod.TODAY);
    expect(normalizeDashboardPeriod('YESTERDAY')).toBe(DashboardPeriod.YESTERDAY);
    expect(normalizeDashboardPeriod('เมื่อวาน')).toBe(DashboardPeriod.YESTERDAY);
    expect(normalizeDashboardPeriod('THIS_WEEK')).toBe(DashboardPeriod.THIS_WEEK);
    expect(normalizeDashboardPeriod('สัปดาห์นี้')).toBe(DashboardPeriod.THIS_WEEK);
    expect(normalizeDashboardPeriod('LAST_7_DAYS')).toBe(DashboardPeriod.LAST_7_DAYS);
    expect(normalizeDashboardPeriod('7 วันล่าสุด')).toBe(DashboardPeriod.LAST_7_DAYS);
    expect(normalizeDashboardPeriod('THIS_MONTH')).toBe(DashboardPeriod.THIS_MONTH);
    expect(normalizeDashboardPeriod('เดือนนี้')).toBe(DashboardPeriod.THIS_MONTH);
    expect(normalizeDashboardPeriod('THIS_QUARTER')).toBe(DashboardPeriod.THIS_QUARTER);
    expect(normalizeDashboardPeriod('ไตรมาสนี้')).toBe(DashboardPeriod.THIS_QUARTER);
    expect(normalizeDashboardPeriod('THIS_YEAR')).toBe(DashboardPeriod.THIS_YEAR);
    expect(normalizeDashboardPeriod('ปีนี้')).toBe(DashboardPeriod.THIS_YEAR);
    expect(normalizeDashboardPeriod(undefined)).toBe(DashboardPeriod.TODAY);
  });

  it('should calculate period ranges correctly', () => {
    const refDate = new Date('2026-09-20T05:00:00Z'); // Sunday 12:00 in Bangkok
    const rangeToday = service.calculatePeriodRange(DashboardPeriod.TODAY, refDate);
    expect(rangeToday.periodLabel).toBe('วันนี้');
    expect(rangeToday.startStr).toBe('2026-09-20');
    expect(rangeToday.endStr).toBe('2026-09-20');
    expect(rangeToday.buckets.length).toBe(6);

    const rangeWeek = service.calculatePeriodRange(DashboardPeriod.THIS_WEEK, refDate);
    expect(rangeWeek.periodLabel).toBe('สัปดาห์นี้');
    expect(rangeWeek.startStr).toBe('2026-09-14'); // Monday
    expect(rangeWeek.endStr).toBe('2026-09-20');   // Sunday
    expect(rangeWeek.buckets.length).toBe(7);

    const rangeMonth = service.calculatePeriodRange(DashboardPeriod.THIS_MONTH, refDate);
    expect(rangeMonth.periodLabel).toBe('เดือนนี้');
    expect(rangeMonth.startStr).toBe('2026-09-01');
    expect(rangeMonth.endStr).toBe('2026-09-30');
    expect(rangeMonth.buckets.length).toBe(6);

    const rangeYear = service.calculatePeriodRange(DashboardPeriod.THIS_YEAR, refDate);
    expect(rangeYear.periodLabel).toBe('ปีนี้');
    expect(rangeYear.startStr).toBe('2026-01-01');
    expect(rangeYear.endStr).toBe('2026-12-31');
    expect(rangeYear.buckets.length).toBe(12);
  });

  it('should return overview data accurately with real quotations', async () => {
    mockQuotationRepo.find.mockResolvedValue([
      {
        id: 'q1',
        quotationNumber: 'QT-2026-0004',
        customerName: 'บริษัท พราวด์ บิลด์ดิ้ง จำกัด',
        projectName: 'พราวด์ ทาวเวอร์',
        status: QuotationStatus.DRAFT,
        issueDate: '2026-09-20',
        grandTotal: 36487,
        createdAt: new Date('2026-09-20T05:06:22Z'),
      },
      {
        id: 'q2',
        quotationNumber: 'QT-2026-0002',
        customerName: 'คุณณัฐวุฒิ',
        projectName: 'บ้านพักอาศัย',
        status: QuotationStatus.SENT,
        issueDate: '2026-09-17',
        grandTotal: 49300.25,
        createdAt: new Date('2026-09-17T05:06:22Z'),
      },
      {
        id: 'q3',
        quotationNumber: 'QT-2026-0001',
        customerName: 'บริษัท พราวด์ บิลด์ดิ้ง จำกัด',
        projectName: 'พราวด์ ทาวเวอร์',
        status: QuotationStatus.ACCEPTED,
        issueDate: '2026-09-15',
        grandTotal: 112350,
        createdAt: new Date('2026-09-15T05:06:22Z'),
      },
    ]);

    const res = await service.getOverview('THIS_MONTH');
    expect(res.period).toBe(DashboardPeriod.THIS_MONTH);
    expect(res.periodLabel).toBe('เดือนนี้');
    expect(res.stats.totalQuotations).toBe(3);
    expect(res.stats.totalValue).toBe(198137.25);
    expect(res.stats.totalCustomers).toBe(5);
    expect(res.stats.totalProjects).toBe(5);
    expect(res.stats.totalProducts).toBe(10);
    expect(res.statusBreakdown.length).toBe(6);
    expect(res.recentQuotations.length).toBe(3);
  });
});
