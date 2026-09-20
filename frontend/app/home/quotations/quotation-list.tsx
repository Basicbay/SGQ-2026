'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  formatCurrency,
  formatDateThai,
  QuotationListItem,
  QuotationStats,
  QuotationStatus,
  QUOTATION_STATUSES,
  STATUS_CONFIG,
} from './quotation-types';

interface QuotationListProps {
  items: QuotationListItem[];
  stats: QuotationStats;
  loading: boolean;
  page: number;
  totalPages: number;
  search: string;
  statusFilter: string;
  onSearchChange: (val: string) => void;
  onStatusFilterChange: (val: string) => void;
  onPageChange: (newPage: number) => void;
  onRefresh: () => void;
  onCreateNew: () => void;
  onViewDetail: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, newStatus: QuotationStatus) => void;
}

export function QuotationList({
  items,
  stats,
  loading,
  page,
  totalPages,
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onPageChange,
  onRefresh,
  onCreateNew,
  onViewDetail,
  onEdit,
  onDelete,
  onChangeStatus,
}: QuotationListProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              ใบเสนอราคาทั้งหมด
            </p>
            <p className="text-2xl font-bold text-foreground">
              {stats.totalQuotations || 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              รอตรวจสอบ / รออนุมัติ
            </p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.pendingCount || 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              อนุมัติ / ส่งลูกค้าแล้ว
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.approvedCount || 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              มูลค่าเสนอราคารวม
            </p>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalValue || 0)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Header & Action Toolbar */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-foreground">
              รายการใบเสนอราคา (Quotations)
            </h2>
            <p className="text-xs text-muted-foreground">
              ระบบจัดทำ ติดตาม และบริหารจัดการใบเสนอราคาสำหรับงานอลูมิเนียมและกระจก
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={onCreateNew}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 px-3.5 shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              สร้างใบเสนอราคาใหม่
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-9 px-3 text-xs border-border text-foreground hover:bg-muted"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-muted/40 border-b border-border flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ค้นหาเลขที่เอกสาร, ชื่อลูกค้า, ชื่อโครงการ..."
              className="pl-9 h-9 text-xs bg-background border-border"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="h-9 px-3 py-1 text-xs rounded-md bg-background border border-border text-foreground w-full sm:w-44 focus:outline-none focus:ring-1 focus:ring-ring"
              aria-label="กรองตามสถานะใบเสนอราคา"
            >
              <option value="ALL">สถานะทั้งหมด</option>
              {QUOTATION_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {STATUS_CONFIG[st]?.label || st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b border-border text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <TableHead className="px-4 py-3">เลขที่เอกสาร</TableHead>
                <TableHead className="px-4 py-3">ลูกค้า / โครงการ</TableHead>
                <TableHead className="px-4 py-3">วันที่ออก / ยืนราคา</TableHead>
                <TableHead className="px-4 py-3 text-right">ยอดสุทธิรวมภาษี</TableHead>
                <TableHead className="px-4 py-3">สถานะ</TableHead>
                <TableHead className="px-4 py-3 text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {loading && items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="px-4 py-12 text-center text-xs text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                      <span>กำลังโหลดข้อมูลใบเสนอราคา...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="px-4 py-16 text-center text-xs text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        ไม่พบข้อมูลใบเสนอราคา
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {search || statusFilter !== 'ALL'
                          ? 'ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง'
                          : 'เริ่มต้นสร้างใบเสนอราคาฉบับแรกสำหรับลูกค้า'}
                      </p>
                      <Button
                        onClick={onCreateNew}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs mt-2"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        สร้างใบเสนอราคาใหม่
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const isMenuOpen = activeMenuId === item.id;
                  const conf = STATUS_CONFIG[item.status] || {
                    label: item.status,
                    badgeClass: 'bg-muted text-muted-foreground',
                    dotClass: 'bg-muted-foreground',
                  };

                  return (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      {/* Quotation Number */}
                      <TableCell className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => onViewDetail(item.id)}
                            className="font-mono text-xs sm:text-sm font-medium text-primary hover:underline cursor-pointer text-left whitespace-nowrap w-fit"
                            title="คลิกเพื่อดูรายละเอียดใบเสนอราคา"
                          >
                            {item.quotationNumber}
                          </button>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{item.itemCount || 0} รายการ</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Customer & Project */}
                      <TableCell className="px-4 py-3.5">
                        <div className="flex flex-col max-w-[240px]">
                          <span className="font-medium text-foreground text-xs sm:text-sm truncate">
                            {item.customerName}
                          </span>
                          {item.projectName && (
                            <span className="text-xs text-muted-foreground items-center gap-1 mt-0.5">
                              {item.projectName}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Issue Date & Validity */}
                      <TableCell className="px-4 py-3.5">
                        <div className="flex flex-col text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            {formatDateThai(item.issueDate)}
                          </span>
                          <span className="text-muted-foreground text-xs mt-0.5">
                            หมดอายุ: {formatDateThai(item.validUntil)} ({item.validDays} วัน)
                          </span>
                        </div>
                      </TableCell>

                      {/* Grand Total */}
                      <TableCell className="px-4 py-3.5 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-foreground text-xs sm:text-sm">
                            {formatCurrency(item.grandTotal)}
                          </span>
                          {Number(item.discountAmount) > 0 && (
                            <span className="text-xs text-rose-500">
                              ลด {formatCurrency(item.discountAmount)}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${conf.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${conf.dotClass}`} />
                          {conf.label}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetail(item.id)}
                            className="h-8 px-2.5 text-xs text-primary hover:text-primary hover:bg-primary/10 border-border"
                            title="ดูรายละเอียด / พิมพ์เอกสาร"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            ดู / พิมพ์
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(item.id)}
                            className="h-8 px-2.5 text-xs text-foreground hover:bg-muted border-border"
                            title="แก้ไขข้อมูลใบเสนอราคา"
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-1" />
                            แก้ไข
                          </Button>

                          <div className="relative">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setActiveMenuId(isMenuOpen ? null : item.id)
                              }
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                              title="จัดการสถานะและอื่นๆ"
                              aria-label="จัดการสถานะและอื่นๆ"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>

                            {isMenuOpen && (
                              <div
                                className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-xl z-30 py-1 text-xs"
                                onMouseLeave={() => setActiveMenuId(null)}
                              >
                                <div className="px-3 py-1.5 font-semibold text-muted-foreground border-b border-border">
                                  เปลี่ยนสถานะเอกสาร
                                </div>

                                {item.status !== 'APPROVED' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onChangeStatus(item.id, 'APPROVED');
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 transition-colors"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    อนุมัติใบเสนอราคา
                                  </button>
                                )}

                                {item.status !== 'SENT' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onChangeStatus(item.id, 'SENT');
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-600 dark:text-sky-400 transition-colors"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    ทำเครื่องหมายว่าส่งแล้ว
                                  </button>
                                )}

                                {item.status !== 'ACCEPTED' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onChangeStatus(item.id, 'ACCEPTED');
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-600 transition-colors"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    ลูกค้ายอมรับ (Accepted)
                                  </button>
                                )}

                                {item.status !== 'REJECTED' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onChangeStatus(item.id, 'REJECTED');
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition-colors"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    ลูกค้าปฏิเสธ (Rejected)
                                  </button>
                                )}

                                <div className="border-t border-border my-1" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    onDelete(item.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-destructive/10 text-destructive transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  ลบใบเสนอราคา
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div>
            หน้า {page} จาก {Math.max(1, totalPages)}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
              className="h-8 text-xs border-border text-foreground hover:bg-muted"
            >
              ก่อนหน้า
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
              className="h-8 text-xs border-border text-foreground hover:bg-muted"
            >
              ถัดไป
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
