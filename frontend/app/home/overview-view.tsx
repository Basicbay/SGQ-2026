'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileSpreadsheet,
  FileText,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  TrendingUp,
  Users,
  Building2,
  Package,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type DashboardPeriod =
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'LAST_7_DAYS'
  | 'THIS_MONTH'
  | 'THIS_QUARTER'
  | 'THIS_YEAR';

export interface DashboardOverviewData {
  period: DashboardPeriod;
  periodLabel: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  stats: {
    totalValue: number;
    totalValueFormatted: string;
    valueChangePercent: number;
    valueChangeText: string;
    totalQuotations: number;
    totalQuotationsChange: string;
    pendingCount: number;
    approvedCount: number;
    acceptedCount: number;
    winRate: number;
    totalCustomers: number;
    totalProjects: number;
    totalProducts: number;
  };
  trend: {
    title: string;
    totalValue: number;
    changePercent: number;
    dataPoints: {
      label: string;
      value: number;
      count: number;
    }[];
  };
  statusBreakdown: {
    status: string;
    label: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  recentQuotations: {
    id: string;
    quotationNumber: string;
    customerName: string;
    projectName: string | null;
    grandTotal: number;
    grandTotalFormatted: string;
    status: string;
    issueDate: string;
    createdAt: string;
    dateFormatted: string;
  }[];
}

interface OverviewViewProps {
  onNavigateView: (
    view:
      | 'overview'
      | 'settings'
      | 'user-settings'
      | 'customers'
      | 'projects'
      | 'products'
      | 'quotes',
  ) => void;
  currentUser?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
  } | null;
}

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: 'TODAY', label: 'วันนี้' },
  { value: 'YESTERDAY', label: 'เมื่อวาน' },
  { value: 'THIS_WEEK', label: 'สัปดาห์นี้' },
  { value: 'LAST_7_DAYS', label: '7 วันล่าสุด' },
  { value: 'THIS_MONTH', label: 'เดือนนี้' },
  { value: 'THIS_QUARTER', label: 'ไตรมาสนี้' },
  { value: 'THIS_YEAR', label: 'ปีนี้' },
];

function renderStatusBadge(status: string) {
  switch (status) {
    case 'ACCEPTED':
      return (
        <Badge
          variant="outline"
          className="border-teal-500/30 bg-teal-500/10 text-teal-600 dark:border-teal-500/30 dark:bg-teal-500/15 dark:text-teal-400 gap-1 font-medium text-xs"
        >
          <CheckCircle2 className="size-3" />
          ลูกค้ายอมรับ
        </Badge>
      );
    case 'APPROVED':
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400 gap-1 font-medium text-xs"
        >
          <CheckCircle2 className="size-3" />
          อนุมัติแล้ว
        </Badge>
      );
    case 'PENDING_APPROVAL':
    case 'PENDING_REVIEW':
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400 gap-1 font-medium text-xs"
        >
          <Clock3 className="size-3" />
          รออนุมัติ
        </Badge>
      );
    case 'SENT':
      return (
        <Badge
          variant="outline"
          className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-400 gap-1 font-medium text-xs"
        >
          ส่งแล้ว
        </Badge>
      );
    case 'REJECTED':
    case 'CANCELLED':
      return (
        <Badge
          variant="outline"
          className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400 gap-1 font-medium text-xs"
        >
          ปฏิเสธ / ยกเลิก
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="border-border bg-muted/60 text-muted-foreground gap-1 font-medium text-xs"
        >
          ฉบับร่าง
        </Badge>
      );
  }
}

export function OverviewView({ onNavigateView, currentUser }: OverviewViewProps) {
  // Default filter is 'TODAY' (วันนี้) as required
  const [period, setPeriod] = useState<DashboardPeriod>('TODAY');
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchOverview() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/dashboard/overview?period=${period}`);
        const json = await res.json();
        if (isMounted) {
          if (json?.success && json?.data) {
            setData(json.data);
          } else {
            setError(json?.error || 'ไม่สามารถโหลดข้อมูลภาพรวมได้');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchOverview();
    return () => {
      isMounted = false;
    };
  }, [period]);

  // Conic gradient string for Donut chart from real statusBreakdown
  const donutGradient = useMemo(() => {
    if (!data || !data.statusBreakdown || data.stats.totalQuotations === 0) {
      return 'conic-gradient(#71717a 0 100%)';
    }

    let currentPct = 0;
    const parts: string[] = [];

    data.statusBreakdown.forEach((item) => {
      if (item.percentage > 0) {
        const start = currentPct;
        const end = currentPct + item.percentage;
        parts.push(`${item.color} ${start}% ${end}%`);
        currentPct = end;
      }
    });

    if (parts.length === 0) {
      return 'conic-gradient(#71717a 0 100%)';
    }

    if (currentPct < 100) {
      parts.push(`#71717a ${currentPct}% 100%`);
    }

    return `conic-gradient(${parts.join(', ')})`;
  }, [data]);

  // Generate SVG path for the area/line trend chart
  const trendSvg = useMemo(() => {
    if (!data?.trend?.dataPoints || data.trend.dataPoints.length === 0) {
      return { pathArea: '', pathLine: '', maxVal: 0 };
    }

    const points = data.trend.dataPoints;
    const values = points.map((p) => p.value);
    const maxVal = Math.max(...values, 1000);

    const width = 680;
    const height = 150;
    const paddingBottom = 15;
    const paddingTop = 15;
    const plotHeight = height - paddingTop - paddingBottom;

    const coords = points.map((pt, idx) => {
      const x = points.length === 1 ? width / 2 : (idx / (points.length - 1)) * width;
      const normalized = pt.value / maxVal;
      const y = height - paddingBottom - normalized * plotHeight;
      return { x, y };
    });

    if (coords.length === 1) {
      const p = coords[0];
      return {
        pathArea: `M0,${height} L0,${p.y} L${width},${p.y} L${width},${height} Z`,
        pathLine: `M0,${p.y} L${width},${p.y}`,
        maxVal,
      };
    }

    // Smooth Bezier path
    let lineD = `M${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      lineD += ` C${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }

    const areaD = `${lineD} L${coords[coords.length - 1].x},${height} L${coords[0].x},${height} Z`;

    return {
      pathArea: areaD,
      pathLine: lineD,
      maxVal,
    };
  }, [data]);

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Welcome and Action Row with Filter */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              สวัสดี, {currentUser?.name || 'ยินดีต้อนรับ'} 👋
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            ติดตามภาพรวมงานใบเสนอราคา และสถานะความคืบหน้าโครงการของคุณ
            {data ? ` (${data.periodLabel}: ${data.dateRange.startDate === data.dateRange.endDate ? data.dateRange.startDate : `${data.dateRange.startDate} ถึง ${data.dateRange.endDate}`})` : ''}
          </p>
        </div>

        {/* Time Period Filter Dropdown (Default: วันนี้) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2.5 py-1 text-xs">
            <span className="text-muted-foreground font-medium hidden sm:inline">
              ช่วงเวลา:
            </span>
            <Select
              value={period}
              onValueChange={(val) => setPeriod(val as DashboardPeriod)}
            >
              <SelectTrigger className="w-[130px] h-8 bg-transparent border-0 p-0 text-xs font-semibold text-foreground focus:ring-0 shadow-none">
                <SelectValue placeholder="เลือกช่วงเวลา" />
              </SelectTrigger>
              <SelectContent align="end" className="text-xs">
                {PERIOD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => onNavigateView('quotes')}
            className="h-9 gap-1.5 text-xs shadow-sm"
          >
            <Plus className="size-4" />
            <span>สร้างใบเสนอราคา</span>
          </Button>
        </div>
      </div>

      {/* 4 Main Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: มูลค่าใบเสนอราคา */}
        <Card className="relative overflow-hidden transition-all hover:shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="grid size-10 place-items-center rounded-lg text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/15">
                <CircleDollarSign className="size-5" />
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'font-medium text-xs',
                  (stats?.valueChangePercent || 0) >= 0
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
                )}
              >
                {loading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  `${(stats?.valueChangePercent || 0) >= 0 ? '+' : ''}${stats?.valueChangePercent || 0}%`
                )}
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground">
                มูลค่าใบเสนอราคา ({data?.periodLabel || 'วันนี้'})
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground font-mono">
                {loading ? '...' : stats?.totalValueFormatted || '฿0'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stats?.valueChangeText || 'เทียบกับช่วงก่อนหน้า'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: ใบเสนอราคาทั้งหมด */}
        <Card className="relative overflow-hidden transition-all hover:shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="grid size-10 place-items-center rounded-lg text-sky-600 bg-sky-500/10 dark:text-sky-400 dark:bg-sky-500/15">
                <FileText className="size-5" />
              </div>
              <Badge
                variant="outline"
                className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium text-xs"
              >
                {stats?.totalQuotationsChange || 'สถิติปัจจุบัน'}
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground">
                ใบเสนอราคาทั้งหมด
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground font-mono">
                {loading ? '...' : `${stats?.totalQuotations || 0} รายการ`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                อนุมัติ/ยอมรับแล้ว {stats?.approvedCount || 0} รายการ
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: รอการอนุมัติ */}
        <Card className="relative overflow-hidden transition-all hover:shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="grid size-10 place-items-center rounded-lg text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/15">
                <Clock3 className="size-5" />
              </div>
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium text-xs"
              >
                {(stats?.pendingCount || 0) > 0 ? 'ต้องติดตาม' : 'เรียบร้อย'}
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground">
                รอการอนุมัติ
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground font-mono">
                {loading ? '...' : `${stats?.pendingCount || 0} รายการ`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {(stats?.pendingCount || 0) > 0
                  ? 'รอการตรวจสอบและอนุมัติจากผู้จัดการ'
                  : 'ไม่มีเอกสารค้างรออนุมัติ'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: อัตราปิดการขาย (Win Rate) */}
        <Card className="relative overflow-hidden transition-all hover:shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="grid size-10 place-items-center rounded-lg text-teal-600 bg-teal-500/10 dark:text-teal-400 dark:bg-teal-500/15">
                <TrendingUp className="size-5" />
              </div>
              <Badge
                variant="outline"
                className="border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium text-xs"
              >
                ยอมรับ {stats?.acceptedCount || 0} ฉบับ
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground">
                อัตราปิดการขาย (Win Rate)
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground font-mono">
                {loading ? '...' : `${stats?.winRate || 0}%`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                จากใบเสนอราคา {stats?.totalQuotations || 0} รายการในช่วงนี้
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Secondary System Stats Summary (Customers, Projects, Products) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => onNavigateView('customers')}
          className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-border transition-all text-left group"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Users className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ลูกค้าในระบบทั้งหมด</p>
              <p className="text-sm font-bold text-foreground">
                {stats?.totalCustomers ?? '-'} ราย
              </p>
            </div>
          </div>
          <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateView('projects')}
          className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-border transition-all text-left group"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Building2 className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">โครงการทั้งหมด</p>
              <p className="text-sm font-bold text-foreground">
                {stats?.totalProjects ?? '-'} โครงการ
              </p>
            </div>
          </div>
          <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateView('products')}
          className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-border transition-all text-left group"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Package className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">สินค้าและวัสดุในคลัง</p>
              <p className="text-sm font-bold text-foreground">
                {stats?.totalProducts ?? '-'} รายการ
              </p>
            </div>
          </div>
          <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
        </button>
      </div>

      {/* Analytics Charts Section (Trend + Donut Status Breakdown) */}
      <section className="grid gap-5 lg:grid-cols-7">
        {/* Dynamic Area/Line Trend Chart */}
        <Card className="lg:col-span-4 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  {data?.trend?.title || 'มูลค่าใบเสนอราคา'}
                </CardTitle>
                <CardDescription className="text-xs">
                  สถิติมูลค่างานเสนอราคาตามช่วงเวลาที่เลือก ({data?.periodLabel || 'วันนี้'})
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setPeriod(period)}
                className="text-muted-foreground hover:text-foreground"
                title="รีเฟรชกราฟ"
                aria-label="รีเฟรชกราฟ"
              >
                <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
              </Button>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {loading ? '...' : stats?.totalValueFormatted || '฿0'}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  (stats?.valueChangePercent || 0) >= 0
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
                )}
              >
                {(stats?.valueChangePercent || 0) >= 0 ? '↑' : '↓'}{' '}
                {Math.abs(stats?.valueChangePercent || 0)}% {stats?.valueChangeText}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[180px] w-full relative">
              {loading ? (
                <div className="size-full flex items-center justify-center text-muted-foreground text-xs gap-2">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>กำลังโหลดข้อมูลแนวโน้ม...</span>
                </div>
              ) : trendSvg.pathLine ? (
                <svg
                  viewBox="0 0 680 160"
                  className="h-full w-full overflow-visible"
                  role="img"
                  aria-label="กราฟมูลค่าใบเสนอราคา"
                >
                  <defs>
                    <linearGradient id="quoteTrendGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[20, 60, 100, 140].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      x2="680"
                      y1={y}
                      y2={y}
                      stroke="currentColor"
                      strokeDasharray="4 4"
                      className="text-border/60"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Gradient Area Fill */}
                  <path d={trendSvg.pathArea} fill="url(#quoteTrendGradient)" />

                  {/* Trend Line */}
                  <path
                    d={trendSvg.pathLine}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <div className="size-full flex items-center justify-center text-xs text-muted-foreground">
                  ไม่พบข้อมูลมูลค่าในช่วงเวลานี้
                </div>
              )}
            </div>

            {/* X-Axis Interval Labels */}
            <div className="mt-2 flex justify-between text-xs text-muted-foreground px-1 overflow-x-auto gap-2">
              {data?.trend?.dataPoints?.map((pt, idx) => (
                <span key={idx} className="whitespace-nowrap text-center">
                  {pt.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Donut Breakdown */}
        <Card className="lg:col-span-3 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  สถานะใบเสนอราคา
                </CardTitle>
                <CardDescription className="text-xs">
                  จำแนกตามสถานะในช่วง{data?.periodLabel || 'วันนี้'} (ทั้งหมด {stats?.totalQuotations || 0} รายการ)
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateView('quotes')}
                className="text-xs text-primary hover:text-primary/80 h-8 px-2"
              >
                ดูทั้งหมด
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
              {/* Donut Chart with dynamic conic-gradient */}
              <div
                className="relative grid size-[146px] shrink-0 place-items-center rounded-full shadow-xs transition-all duration-500"
                style={{ background: donutGradient }}
              >
                <div className="grid size-[104px] place-items-center rounded-full bg-card border border-border/40 shadow-inner">
                  <div className="text-center">
                    <p className="text-2xl font-bold tracking-tight text-foreground font-mono">
                      {loading ? '...' : stats?.totalQuotations || 0}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      รายการ
                    </p>
                  </div>
                </div>
              </div>

              {/* Legend with actual counts and percentages */}
              <div className="w-full flex-1 space-y-2 text-xs">
                {data?.statusBreakdown?.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between text-xs py-0.5"
                  >
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate max-w-[110px]">{item.label}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground font-mono">
                        {item.count} รายการ
                      </span>
                      <span className="text-muted-foreground/70 text-xs font-mono">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent Quotations Table with Real System Data */}
      <section>
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                ใบเสนอราคาล่าสุด
              </CardTitle>
              <CardDescription className="text-xs">
                รายการเอกสารที่สร้างหรืออัปเดตล่าสุดในระบบ ({data?.periodLabel || 'วันนี้'})
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateView('quotes')}
              className="text-xs gap-1.5 h-8 w-fit"
            >
              <span>ดูใบเสนอราคาทั้งหมด</span>
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-[150px]">เลขที่เอกสาร</TableHead>
                  <TableHead>ลูกค้า / โครงการ</TableHead>
                  <TableHead className="w-[150px]">มูลค่าสุทธิ</TableHead>
                  <TableHead className="w-[150px]">สถานะ</TableHead>
                  <TableHead className="w-[180px]">วันที่ / อัปเดตล่าสุด</TableHead>
                  <TableHead className="pr-6 w-[70px] text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="size-5 animate-spin text-primary" />
                        <span>กำลังโหลดข้อมูลใบเสนอราคา...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !data?.recentQuotations || data.recentQuotations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileSpreadsheet className="size-8 text-muted-foreground/60" />
                        <span className="font-medium text-foreground">
                          ไม่พบใบเสนอราคาในช่วงเวลา {data?.periodLabel}
                        </span>
                        <span className="text-muted-foreground">
                          ลองเปลี่ยนช่วงเวลา เช่น &quot;เดือนนี้&quot; หรือ &quot;7 วันล่าสุด&quot; หรือเริ่มต้นสร้างใบเสนอราคาใหม่
                        </span>
                        <Button
                          size="sm"
                          onClick={() => onNavigateView('quotes')}
                          className="text-xs mt-2"
                        >
                          <Plus className="size-3.5 mr-1" />
                          สร้างใบเสนอราคา
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recentQuotations.map((quote) => (
                    <TableRow key={quote.id} className="hover:bg-muted/40 transition-colors">
                      {/* Quotation Number: Green text, font-mono, without badge, matching other tables */}
                      <TableCell className="pl-6">
                        <button
                          type="button"
                          onClick={() => onNavigateView('quotes')}
                          className="font-mono text-xs sm:text-sm font-medium text-primary hover:underline cursor-pointer text-left whitespace-nowrap"
                          title="คลิกเพื่อไปที่หน้ารายการใบเสนอราคา"
                        >
                          {quote.quotationNumber}
                        </button>
                      </TableCell>

                      {/* Customer & Project */}
                      <TableCell>
                        <div className="max-w-[280px]">
                          <p className="font-medium text-foreground text-xs sm:text-sm leading-snug truncate">
                            {quote.customerName}
                          </p>
                          {quote.projectName && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {quote.projectName}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Grand Total */}
                      <TableCell className="font-bold text-foreground text-xs sm:text-sm font-mono">
                        {quote.grandTotalFormatted}
                      </TableCell>

                      {/* Status */}
                      <TableCell>{renderStatusBadge(quote.status)}</TableCell>

                      {/* Last Updated Date */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {quote.dateFormatted}
                      </TableCell>

                      {/* Action */}
                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onNavigateView('quotes')}
                          className="text-muted-foreground hover:text-foreground"
                          title="เปิดดูใบเสนอราคา"
                          aria-label={`เปิดดู ${quote.quotationNumber}`}
                        >
                          <ArrowUpRight className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
