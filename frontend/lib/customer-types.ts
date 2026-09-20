import { z } from 'zod';

export const CUSTOMER_TYPES = [
  { value: 'COMPANY', label: 'นิติบุคคล (Company)', desc: 'บริษัท, ห้างหุ้นส่วน, องค์กร' },
  { value: 'INDIVIDUAL', label: 'บุคคลธรรมดา (Individual)', desc: 'ลูกค้าทั่วไป, บุคคลธรรมดา' },
] as const;

export const CUSTOMER_STATUSES = [
  { value: 'ACTIVE', label: 'ใช้งาน (Active)', desc: 'ลูกค้าปกติ' },
  { value: 'INACTIVE', label: 'ไม่ใช้งาน (Inactive)', desc: 'ระงับการใช้งานชั่วคราว' },
] as const;

const optionalEmail = z.union([
  z.literal(''),
  z.string().email('รูปแบบอีเมลไม่ถูกต้อง').max(160, 'อีเมลต้องไม่เกิน 160 ตัวอักษร'),
]);

const optionalCode = z.union([
  z.literal(''),
  z
    .string()
    .min(3, 'รหัสลูกค้าต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(32, 'รหัสลูกค้าต้องไม่เกิน 32 ตัวอักษร')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'รหัสลูกค้าใช้ได้เฉพาะตัวอักษร ตัวเลข และ _ . -'),
]);

export const customerSchema = z.object({
  customerCode: optionalCode,
  name: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกชื่อลูกค้าหรือชื่อบริษัท')
    .max(200, 'ชื่อลูกค้าหรือชื่อบริษัทต้องไม่เกิน 200 ตัวอักษร'),
  customerType: z.string().optional().default('COMPANY'),
  taxId: z.string().max(32, 'เลขผู้เสียภาษีต้องไม่เกิน 32 ตัวอักษร').optional(),
  contactName: z.string().max(160, 'ชื่อผู้ติดต่อต้องไม่เกิน 160 ตัวอักษร').optional(),
  phone: z.string().max(40, 'เบอร์โทรศัพท์ต้องไม่เกิน 40 ตัวอักษร').optional(),
  email: optionalEmail,
  lineId: z.string().max(100, 'Line ID ต้องไม่เกิน 100 ตัวอักษร').optional(),
  address: z.string().max(500, 'ที่อยู่ต้องไม่เกิน 500 ตัวอักษร').optional(),
  note: z.string().max(500, 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร').optional(),
  status: z.string().optional().default('ACTIVE'),
});

export const createCustomerSchema = customerSchema;
export const updateCustomerSchema = customerSchema;

export type CustomerTypeOption = (typeof CUSTOMER_TYPES)[number]['value'];
export type CustomerStatusOption = (typeof CUSTOMER_STATUSES)[number]['value'];

export interface CustomerItem {
  id: string;
  customerCode: string;
  name: string;
  customerType: string;
  taxId: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  lineId: string | null;
  address: string | null;
  note: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  customerCode?: string;
  name: string;
  customerType: string;
  taxId?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  lineId?: string;
  address?: string;
  note?: string;
  status?: string;
}

export interface UpdateCustomerInput {
  customerCode?: string;
  name?: string;
  customerType?: string;
  taxId?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  lineId?: string;
  address?: string;
  note?: string;
  status?: string;
}

export interface CustomerListResponse {
  items: CustomerItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
