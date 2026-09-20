import { z } from 'zod';

export const PROJECT_TYPES = [
  { value: 'CONSTRUCTION', label: 'งานก่อสร้างทั่วไป (Construction)', desc: 'งานโครงสร้าง อาคาร โรงงาน คลังสินค้า' },
  { value: 'RESIDENTIAL', label: 'บ้านพักอาศัย (Residential)', desc: 'บ้านเดี่ยว ทาวน์โฮม คอนโดมิเนียม' },
  { value: 'INTERIOR', label: 'งานตกแต่งภายใน (Interior)', desc: 'บิวท์อิน เฟอร์นิเจอร์ งานสถาปัตยกรรมภายใน' },
  { value: 'RENOVATION', label: 'งานรีโนเวทและปรับปรุง (Renovation)', desc: 'ต่อเติม ปรับปรุง รีโนเวทอาคารเก่า' },
  { value: 'INFRASTRUCTURE', label: 'งานระบบและสาธารณูปโภค (Infrastructure)', desc: 'งานถนน ระบบระบายน้ำ ไฟฟ้า ประปา' },
] as const;

export const PROJECT_STATUSES = [
  { value: 'PLANNING', label: 'วางแผน (Planning)', desc: 'อยู่ในขั้นตอนสำรวจ ออกแบบ วางแผน' },
  { value: 'IN_PROGRESS', label: 'กำลังดำเนินการ (In Progress)', desc: 'อยู่ระหว่างการก่อสร้างหรือดำเนินการ' },
  { value: 'COMPLETED', label: 'เสร็จสิ้น (Completed)', desc: 'ส่งมอบงานเรียบร้อยแล้ว' },
  { value: 'ON_HOLD', label: 'พักโครงการ (On Hold)', desc: 'ระงับหรือชะลอการดำเนินการชั่วคราว' },
  { value: 'CANCELLED', label: 'ยกเลิก (Cancelled)', desc: 'ยกเลิกโครงการ' },
] as const;

export type ProjectTypeValue = (typeof PROJECT_TYPES)[number]['value'];
export type ProjectStatusValue = (typeof PROJECT_STATUSES)[number]['value'];

const optionalCode = z.union([
  z.literal(''),
  z
    .string()
    .min(3, 'รหัสโครงการต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(32, 'รหัสโครงการต้องไม่เกิน 32 ตัวอักษร')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'รหัสโครงการใช้ได้เฉพาะตัวอักษร ตัวเลข และ _ . -'),
]);

const optionalBudget = z.union([
  z.literal(''),
  z.number().min(0, 'งบประมาณต้องไม่น้อยกว่า 0'),
  z.string().regex(/^\d*(\.\d{1,2})?$/, 'งบประมาณต้องเป็นตัวเลขที่ถูกต้อง'),
]);

export const projectSchema = z.object({
  projectCode: optionalCode.optional(),
  name: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกชื่อโครงการ')
    .max(200, 'ชื่อโครงการต้องไม่เกิน 200 ตัวอักษร'),
  customerId: z.string().optional().nullable(),
  projectType: z.string().optional().default('CONSTRUCTION'),
  location: z.string().max(300, 'สถานที่ตั้งต้องไม่เกิน 300 ตัวอักษร').optional().nullable(),
  budget: optionalBudget.optional(),
  startDate: z.string().max(20, 'วันที่เริ่มต้นไม่ถูกต้อง').optional().nullable(),
  endDate: z.string().max(20, 'วันที่สิ้นสุดไม่ถูกต้อง').optional().nullable(),
  status: z.string().optional().default('PLANNING'),
  description: z.string().max(1000, 'รายละเอียดต้องไม่เกิน 1,000 ตัวอักษร').optional().nullable(),
  note: z.string().max(1000, 'หมายเหตุต้องไม่เกิน 1,000 ตัวอักษร').optional().nullable(),
});

export const createProjectSchema = projectSchema;
export const updateProjectSchema = projectSchema;

export interface ProjectCustomerSummary {
  id: string;
  customerCode: string;
  name: string;
  customerType: string;
  phone: string | null;
  email: string | null;
}

export interface ProjectItem {
  id: string;
  projectCode: string;
  name: string;
  customerId: string | null;
  customer: ProjectCustomerSummary | null;
  customerName: string | null;
  projectType: string;
  location: string | null;
  budget: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
  description: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  projectCode?: string;
  name: string;
  customerId?: string | null;
  projectType?: string;
  location?: string | null;
  budget?: number | string;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
  description?: string | null;
  note?: string | null;
}

export interface UpdateProjectInput {
  projectCode?: string;
  name?: string;
  customerId?: string | null;
  projectType?: string;
  location?: string | null;
  budget?: number | string;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
  description?: string | null;
  note?: string | null;
}

export interface ProjectListResponse {
  items: ProjectItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
