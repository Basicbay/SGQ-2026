import { z } from 'zod';

export const USER_ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', desc: 'จัดการทุกส่วนของระบบ' },
  { value: 'ADMIN', label: 'Admin', desc: 'จัดการข้อมูลและผู้ใช้งาน' },
  { value: 'SALES', label: 'Sales', desc: 'จัดการลูกค้าและใบเสนอราคา' },
  { value: 'ESTIMATOR', label: 'Estimator', desc: 'จัดการวัสดุ ปริมาณ และต้นทุน' },
] as const;

export const USER_STATUSES = [
  { value: 'ACTIVE', label: 'ใช้งาน (Active)', desc: 'ผู้ใช้งานปกติ สามารถเข้าสู่ระบบได้' },
  { value: 'INACTIVE', label: 'ไม่ใช้งาน (Inactive)', desc: 'ระงับการใช้งานชั่วคราว' },
] as const;

const optionalEmail = z.union([
  z.literal(''),
  z.string().email('รูปแบบอีเมลไม่ถูกต้อง').max(160, 'อีเมลต้องไม่เกิน 160 ตัวอักษร'),
]);

const userProfileSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'SALES', 'ESTIMATOR'], {
    error: 'กรุณาเลือกบทบาทผู้ใช้งาน',
  }),
  status: z.string().optional().default('ACTIVE'),
  fullName: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกชื่อเต็ม')
    .max(160, 'ชื่อเต็มต้องไม่เกิน 160 ตัวอักษร'),
  nickname: z.string().max(64, 'ชื่อเล่นต้องไม่เกิน 64 ตัวอักษร').optional(),
  phone: z.string().max(40, 'เบอร์โทรศัพท์ต้องไม่เกิน 40 ตัวอักษร').optional(),
  email: optionalEmail,
  citizenId: z.string().max(20, 'เลขบัตรประชาชนต้องไม่เกิน 20 ตัวอักษร').optional(),
  lineId: z.string().max(100, 'Line ID ต้องไม่เกิน 100 ตัวอักษร').optional(),
});

export const createUserSchema = userProfileSchema.extend({
  username: z
    .string()
    .min(3, 'ชื่อผู้ใช้งานต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(64, 'ชื่อผู้ใช้งานต้องไม่เกิน 64 ตัวอักษร')
    .regex(/^[a-z0-9_.-]+$/, 'ชื่อผู้ใช้งานใช้ได้เฉพาะตัวพิมพ์เล็ก ตัวเลข และ _ . -'),
  password: z
    .string()
    .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
    .max(128, 'รหัสผ่านต้องไม่เกิน 128 ตัวอักษร'),
});

export const updateUserSchema = userProfileSchema.extend({
  password: z.union([
    z.literal(''),
    z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร').max(128, 'รหัสผ่านต้องไม่เกิน 128 ตัวอักษร'),
  ]),
});

export type UserRoleType = (typeof USER_ROLES)[number]['value'];
export type UserStatusType = (typeof USER_STATUSES)[number]['value'];

export interface UserItem {
  id: string;
  username: string;
  role: string;
  status: string;
  fullName: string | null;
  nickname: string | null;
  phone: string | null;
  email: string | null;
  citizenId: string | null;
  lineId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  username: string;
  password: string;
  role: string;
  status?: string;
  fullName: string;
  nickname?: string;
  phone?: string;
  email?: string;
  citizenId?: string;
  lineId?: string;
}

export interface UpdateUserInput {
  role?: string;
  status?: string;
  fullName?: string;
  nickname?: string;
  phone?: string;
  email?: string;
  citizenId?: string;
  lineId?: string;
  password?: string;
}

export interface UserListResponse {
  items: UserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
