'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Building,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Printer,
  Send,
  User,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  bahttext,
  formatCurrency,
  formatDateThai,
  QuotationDetail,
  QuotationStatus,
  STATUS_CONFIG,
} from './quotation-types';

interface SystemSettingsData {
  siteName?: string;
  companyName?: string;
  taxId?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  iconUrl?: string;
}

interface QuotationDetailViewProps {
  quotation: QuotationDetail;
  onBack: () => void;
  onEdit: (id: string) => void;
  onChangeStatus: (id: string, status: QuotationStatus) => void;
  loading: boolean;
}

export function QuotationDetailView({
  quotation,
  onBack,
  onEdit,
  onChangeStatus,
  loading,
}: QuotationDetailViewProps) {
  const [companySettings, setCompanySettings] = useState<SystemSettingsData>({
    companyName: 'SGQ Smart Glass Quality Co., Ltd.',
    taxId: '0105565099881',
    address:
      'เลขที่ 168 ถนนกาญจนาภิเษก แขวงบางแค เขตบางแค กรุงเทพมหานคร 10160',
    phone: '02-803-1234, 081-456-7890',
    email: 'contact@smartglassquality.com',
    website: 'https://smartglassquality.com',
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings/system');
        const json = await res.json();
        if (json?.success && json?.data) {
          setCompanySettings((prev) => ({
            ...prev,
            ...json.data,
          }));
        }
      } catch {
        // use default fallback
      }
    }
    loadSettings();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const statusConfig = STATUS_CONFIG[quotation.status] || {
    label: quotation.status,
    badgeClass: 'bg-muted text-muted-foreground',
    dotClass: 'bg-muted-foreground',
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-9 px-2.5 text-xs text-foreground border-border hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            กลับหน้ารายการ
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <span>ใบเสนอราคา:</span>
                <span className="font-mono text-primary font-bold">
                  {quotation.quotationNumber}
                </span>
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              สร้างเมื่อ: {formatDateThai(quotation.createdAt)} | ปรับปรุงล่าสุด:{' '}
              {formatDateThai(quotation.updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-9 text-xs border-border text-foreground hover:bg-muted"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-primary" />
            พิมพ์ / บันทึก PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(quotation.id)}
            className="h-9 text-xs border-border text-foreground hover:bg-muted"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            แก้ไขเอกสาร
          </Button>

          {/* Quick status transition actions */}
          {quotation.status !== 'APPROVED' && (
            <Button
              size="sm"
              onClick={() => onChangeStatus(quotation.id, 'APPROVED')}
              disabled={loading}
              className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              อนุมัติ
            </Button>
          )}

          {quotation.status !== 'SENT' && (
            <Button
              size="sm"
              onClick={() => onChangeStatus(quotation.id, 'SENT')}
              disabled={loading}
              className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              ส่งให้ลูกค้า
            </Button>
          )}

          {quotation.status !== 'ACCEPTED' && (
            <Button
              size="sm"
              onClick={() => onChangeStatus(quotation.id, 'ACCEPTED')}
              disabled={loading}
              className="h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              ลูกค้ายอมรับ
            </Button>
          )}
        </div>
      </div>

      {/* A4 Formal Quotation Sheet Container - Always White Paper Sheet regardless of dark/light theme */}
      <div className="max-w-4xl mx-auto bg-white text-neutral-900 border border-neutral-300 rounded-xl shadow-xl p-8 sm:p-10 print:p-0 print:border-none print:shadow-none print:max-w-none print:rounded-none">
        {/* Company Letterhead Header */}
        <div className="border-b-2 border-neutral-800 pb-5">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1.5 max-w-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-black text-sm">
                  SGQ
                </div>
                <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
                  {companySettings.companyName || 'SGQ Smart Glass Quality'}
                </h2>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {companySettings.address}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600 pt-0.5">
                <span>
                  <strong>เลขประจำตัวผู้เสียภาษี:</strong>{' '}
                  {companySettings.taxId || '-'}
                </span>
                <span>
                  <strong>โทรศัพท์:</strong> {companySettings.phone || '-'}
                </span>
                <span>
                  <strong>อีเมล:</strong> {companySettings.email || '-'}
                </span>
              </div>
            </div>

            {/* Document Title & Badge */}
            <div className="text-right sm:min-w-[200px] flex flex-col sm:items-end">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                ใบเสนอราคา
              </h1>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
                QUOTATION
              </p>
              <div className="mt-2 text-xs bg-neutral-100 rounded px-2.5 py-1 text-neutral-800 font-semibold inline-block border border-neutral-300">
                เลขที่: {quotation.quotationNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Document Information Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-neutral-200 text-xs">
          {/* Customer Box */}
          <div className="bg-neutral-50 rounded-lg p-3.5 border border-neutral-200 space-y-1.5">
            <p className="font-bold text-neutral-900 text-xs flex items-center gap-1.5 border-b border-neutral-200 pb-1">
              <User className="w-3.5 h-3.5 text-primary" />
              ข้อมูลลูกค้า / Customer
            </p>
            <p className="font-semibold text-neutral-900 text-xs">
              {quotation.customerName}
            </p>
            {quotation.customerAddress && (
              <p className="text-neutral-600 leading-relaxed">
                <strong>ที่อยู่:</strong> {quotation.customerAddress}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 text-neutral-600 pt-0.5">
              {quotation.customerTaxId && (
                <p>
                  <strong>เลขผู้เสียภาษี:</strong> {quotation.customerTaxId}
                </p>
              )}
              {quotation.customerPhone && (
                <p>
                  <strong>เบอร์โทร:</strong> {quotation.customerPhone}
                </p>
              )}
              {quotation.customerContact && (
                <p className="col-span-2">
                  <strong>ผู้ติดต่อ:</strong> {quotation.customerContact}
                </p>
              )}
            </div>
          </div>

          {/* Document & Project Box */}
          <div className="bg-neutral-50 rounded-lg p-3.5 border border-neutral-200 space-y-1.5">
            <p className="font-bold text-neutral-900 text-xs flex items-center gap-1.5 border-b border-neutral-200 pb-1">
              <Building className="w-3.5 h-3.5 text-neutral-700" />
              ข้อมูลเอกสารและโครงการ / Details
            </p>
            <div className="grid grid-cols-2 gap-y-1.5 text-neutral-700">
              <p>
                <strong>วันที่ออก:</strong> {formatDateThai(quotation.issueDate)}
              </p>
              <p>
                <strong>กำหนดยืนราคา:</strong> {quotation.validDays} วัน
              </p>
              <p>
                <strong>หมดอายุวันที่:</strong>{' '}
                {formatDateThai(quotation.validUntil)}
              </p>
              <p>
                <strong>ผู้จัดทำ:</strong>{' '}
                {quotation.seller?.fullName || quotation.seller?.username || 'ฝ่ายขาย SGQ'}
              </p>
            </div>
            {quotation.projectName && (
              <div className="mt-2 pt-1 border-t border-neutral-200 text-neutral-800">
                <strong>ชื่อโครงการ:</strong> {quotation.projectName}
              </div>
            )}
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="py-5">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-100 text-neutral-900 border-y-2 border-neutral-800 font-bold uppercase">
                <th className="py-2.5 px-3 w-10 text-center">ลำดับ</th>
                <th className="py-2.5 px-3">รายการสินค้า / วัสดุ / บริการ</th>
                <th className="py-2.5 px-3 w-16 text-center">จำนวน</th>
                <th className="py-2.5 px-3 w-16 text-center">หน่วย</th>
                <th className="py-2.5 px-3 w-24 text-right">ราคา/หน่วย</th>
                <th className="py-2.5 px-3 w-20 text-right">ส่วนลด</th>
                <th className="py-2.5 px-3 w-28 text-right">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {quotation.items?.map((item, index) => (
                <tr key={index} className="align-top">
                  <td className="py-3 px-3 text-center text-neutral-500 font-medium">
                    {index + 1}
                  </td>
                  <td className="py-3 px-3 space-y-0.5">
                    <div className="font-semibold text-neutral-900">
                      {item.itemName}
                    </div>
                    {item.itemCode && (
                      <span className="inline-block text-neutral-500 text-xs font-mono mr-2">
                        [{item.itemCode}]
                      </span>
                    )}
                    {item.description && (
                      <p className="text-neutral-600 text-xs leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-medium text-neutral-900">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-3 text-center text-neutral-600">
                    {item.unit}
                  </td>
                  <td className="py-3 px-3 text-right text-neutral-900">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 px-3 text-right text-rose-600 font-medium">
                    {Number(item.discountAmount) > 0
                      ? formatCurrency(item.discountAmount)
                      : '-'}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-neutral-900">
                    {formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation & Totals Block */}
        <div className="border-t-2 border-neutral-800 pt-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Left: Thai Baht Text Box & Notes */}
            <div className="sm:col-span-7 space-y-3 text-xs">
              <div className="bg-neutral-50 p-3 rounded border border-neutral-200">
                <span className="text-neutral-500 block mb-0.5 font-medium">
                  จำนวนเงินตัวอักษร (Thai Baht Text):
                </span>
                <span className="font-bold text-neutral-900 text-xs sm:text-sm">
                  ({bahttext(quotation.grandTotal)})
                </span>
              </div>

              {quotation.notes && (
                <div className="text-neutral-600 leading-relaxed">
                  <strong>หมายเหตุ:</strong> {quotation.notes}
                </div>
              )}
            </div>

            {/* Right: Detailed Totals Box */}
            <div className="sm:col-span-5 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>รวมเงินก่อนส่วนลด:</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(quotation.subtotal)}
                </span>
              </div>

              {Number(quotation.discountAmount) > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>
                    ส่วนลด ({quotation.discountType === 'PERCENT' ? `${quotation.discountRate}%` : 'พิเศษ'}):
                  </span>
                  <span className="font-semibold">
                    - {formatCurrency(quotation.discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-neutral-800 border-t border-neutral-200 pt-1.5">
                <span>ยอดเงินหลังหักส่วนลด:</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(quotation.totalAfterDiscount)}
                </span>
              </div>

              <div className="flex justify-between text-neutral-800">
                <span>ภาษีมูลค่าเพิ่ม ({quotation.vatRate}%):</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(quotation.vatAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm font-black text-neutral-900 border-t-2 border-neutral-800 pt-2 bg-neutral-100 p-2.5 rounded">
                <span>ยอดสุทธิรวมภาษี:</span>
                <span className="text-neutral-900 text-base sm:text-lg font-black">
                  {formatCurrency(quotation.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Commercial Terms & Conditions */}
        <div className="border-t border-neutral-200 py-4 text-xs space-y-2">
          <p className="font-bold text-neutral-900 text-xs">เงื่อนไขการให้บริการ:</p>
          <ul className="list-disc list-inside space-y-1 text-neutral-600">
            {quotation.paymentTerms && (
              <li>
                <strong>เงื่อนไขการชำระเงิน:</strong> {quotation.paymentTerms}
              </li>
            )}
            {quotation.deliveryTerms && (
              <li>
                <strong>กำหนดส่งมอบ:</strong> {quotation.deliveryTerms}
              </li>
            )}
            {quotation.warrantyTerms && (
              <li>
                <strong>การรับประกัน:</strong> {quotation.warrantyTerms}
              </li>
            )}
          </ul>
        </div>

        {/* Formal Signature Blocks */}
        <div className="border-t-2 border-neutral-300 pt-8 mt-6">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            {/* Prepared By */}
            <div className="space-y-12">
              <p className="font-semibold text-neutral-800">ผู้จัดทำเอกสาร</p>
              <div className="space-y-1">
                <div className="border-b border-neutral-400 w-3/4 mx-auto" />
                <p className="font-medium text-neutral-900 pt-1">
                  ({quotation.seller?.fullName || quotation.seller?.username || '...........................................'})
                </p>
                <p className="text-neutral-500">
                  วันที่ {formatDateThai(quotation.issueDate)}
                </p>
              </div>
            </div>

            {/* Approved By */}
            <div className="space-y-12">
              <p className="font-semibold text-neutral-800">ผู้มีอำนาจลงนาม / ผู้อนุมัติ</p>
              <div className="space-y-1">
                <div className="border-b border-neutral-400 w-3/4 mx-auto" />
                <p className="font-medium text-neutral-900 pt-1">
                  ({quotation.approvedBy?.fullName || quotation.approvedBy?.username || '...........................................'})
                </p>
                <p className="text-neutral-500">วันที่ .......... / .......... / ..........</p>
              </div>
            </div>

            {/* Customer Acceptance */}
            <div className="space-y-12">
              <p className="font-semibold text-neutral-800">ผู้สั่งซื้อ / ตกลงสั่งจ้าง</p>
              <div className="space-y-1">
                <div className="border-b border-neutral-400 w-3/4 mx-auto" />
                <p className="font-medium text-neutral-900 pt-1">
                  (...........................................)
                </p>
                <p className="text-neutral-500">วันที่ .......... / .......... / ..........</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
