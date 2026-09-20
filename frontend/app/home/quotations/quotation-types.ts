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
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

export const QUOTATION_DISCOUNT_TYPES = ['AMOUNT', 'PERCENT'] as const;
export type QuotationDiscountType = (typeof QUOTATION_DISCOUNT_TYPES)[number];

export const QUOTATION_ITEM_TYPES = [
  'PRODUCT',
  'SERVICE',
  'CUSTOM',
  'LABOR',
] as const;
export type QuotationItemType = (typeof QUOTATION_ITEM_TYPES)[number];

export interface QuotationItem {
  id?: string;
  quotationId?: string;
  productId?: string | null;
  itemType: QuotationItemType;
  itemCode?: string | null;
  itemName: string;
  description?: string | null;
  quantity: number;
  unit: string;
  unitCost: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
  sortOrder: number;
}

export interface QuotationUserSummary {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

export interface QuotationListItem {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  projectId?: string | null;
  projectName?: string | null;
  status: QuotationStatus;
  issueDate: string;
  validUntil: string;
  validDays: number;
  subtotal: number;
  discountAmount: number;
  totalAfterDiscount: number;
  vatAmount: number;
  grandTotal: number;
  itemCount: number;
  seller?: QuotationUserSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationDetail extends QuotationListItem {
  customerAddress?: string | null;
  customerPhone?: string | null;
  customerTaxId?: string | null;
  customerContact?: string | null;
  discountType: QuotationDiscountType;
  discountRate: number;
  vatRate: number;
  totalCost: number;
  estimatedProfit: number;
  profitMarginPercent: number;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  warrantyTerms?: string | null;
  notes?: string | null;
  rejectionReason?: string | null;
  approvedBy?: QuotationUserSummary | null;
  items: QuotationItem[];
}

export interface QuotationStats {
  totalQuotations: number;
  pendingCount: number;
  approvedCount: number;
  totalValue: number;
}

export interface QuotationListResponseData {
  items: QuotationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: QuotationStats;
}

export const STATUS_CONFIG: Record<
  QuotationStatus,
  { label: string; badgeClass: string; borderClass: string; dotClass: string }
> = {
  DRAFT: {
    label: 'แบบร่าง',
    badgeClass: 'bg-muted text-muted-foreground border border-border',
    borderClass: 'border-border',
    dotClass: 'bg-muted-foreground',
  },
  PENDING_REVIEW: {
    label: 'รอตรวจสอบ',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    borderClass: 'border-amber-300 dark:border-amber-800',
    dotClass: 'bg-amber-400',
  },
  PENDING_APPROVAL: {
    label: 'รออนุมัติ',
    badgeClass: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
    borderClass: 'border-orange-300 dark:border-orange-800',
    dotClass: 'bg-orange-400',
  },
  APPROVED: {
    label: 'อนุมัติแล้ว',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    borderClass: 'border-emerald-300 dark:border-emerald-800',
    dotClass: 'bg-emerald-500',
  },
  SENT: {
    label: 'ส่งลูกค้าแล้ว',
    badgeClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    borderClass: 'border-sky-300 dark:border-sky-800',
    dotClass: 'bg-sky-500',
  },
  ACCEPTED: {
    label: 'ลูกค้ายอมรับ',
    badgeClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
    borderClass: 'border-teal-300 dark:border-teal-800',
    dotClass: 'bg-teal-500',
  },
  REJECTED: {
    label: 'ลูกค้าปฏิเสธ',
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    borderClass: 'border-rose-300 dark:border-rose-800',
    dotClass: 'bg-rose-500',
  },
  EXPIRED: {
    label: 'หมดอายุ',
    badgeClass: 'bg-muted text-muted-foreground border border-border',
    borderClass: 'border-border',
    dotClass: 'bg-muted-foreground',
  },
  CANCELLED: {
    label: 'ยกเลิกแล้ว',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    borderClass: 'border-red-300 dark:border-red-800',
    dotClass: 'bg-red-500',
  },
};

export const ITEM_TYPE_CONFIG: Record<
  QuotationItemType,
  { label: string; badgeClass: string }
> = {
  PRODUCT: {
    label: 'สินค้า/วัสดุ',
    badgeClass: 'bg-primary/10 text-primary border border-primary/20',
  },
  SERVICE: {
    label: 'บริการติดตั้ง',
    badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
  },
  CUSTOM: {
    label: 'สั่งผลิตพิเศษ',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  },
  LABOR: {
    label: 'ค่าแรงช่าง',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
};

export function formatCurrency(amount: number | null | undefined): string {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatNumber(amount: number | null | undefined): string {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatDateThai(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate().toString().padStart(2, '0');
    const months = [
      'ม.ค.',
      'ก.พ.',
      'มี.ค.',
      'เม.ย.',
      'พ.ค.',
      'มิ.ย.',
      'ก.ค.',
      'ส.ค.',
      'ก.ย.',
      'ต.ค.',
      'พ.ย.',
      'ธ.ค.',
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Standard Thai Baht text reading function
 * Converts numeric amount (e.g. 112350.00) into Thai words
 * Example: "หนึ่งแสนหนึ่งหมื่นสองพันสามร้อยห้าสิบบาทถ้วน"
 */
export function bahttext(number: number): string {
  if (isNaN(number) || number < 0) return 'ศูนย์บาทถ้วน';

  const numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  function readGroup(groupStr: string): string {
    let result = '';
    const len = groupStr.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(groupStr[i], 10);
      const pos = len - i - 1;
      if (digit === 0) continue;

      if (pos === 0 && digit === 1 && len > 1 && groupStr[len - 2] !== '0') {
        result += 'เอ็ด';
      } else if (pos === 1 && digit === 2) {
        result += 'ยี่' + units[pos];
      } else if (pos === 1 && digit === 1) {
        result += units[pos];
      } else {
        result += numbers[digit] + units[pos];
      }
    }
    return result;
  }

  const rounded = (Math.round(number * 100) / 100).toFixed(2);
  const [bahtPart, satangPart] = rounded.split('.');

  if (parseInt(bahtPart, 10) === 0 && parseInt(satangPart, 10) === 0) {
    return 'ศูนย์บาทถ้วน';
  }

  let text = '';
  if (parseInt(bahtPart, 10) > 0) {
    // Process groups of 6 digits (millions)
    let b = bahtPart;
    const groups: string[] = [];
    while (b.length > 6) {
      groups.unshift(b.slice(-6));
      b = b.slice(0, -6);
    }
    groups.unshift(b);

    for (let i = 0; i < groups.length; i++) {
      const groupText = readGroup(groups[i]);
      text += groupText;
      if (i < groups.length - 1 && groupText !== '') {
        text += 'ล้าน';
      }
    }
    text += 'บาท';
  }

  if (parseInt(satangPart, 10) > 0) {
    text += readGroup(satangPart) + 'สตางค์';
  } else {
    text += 'ถ้วน';
  }

  return text;
}
