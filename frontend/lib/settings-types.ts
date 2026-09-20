import { z } from 'zod';

export const systemSettingsSchema = z.object({
  siteName: z.string().min(1, 'กรุณากรอกชื่อเว็บ').max(160, 'ชื่อเว็บต้องไม่เกิน 160 ตัวอักษร'),
  siteDescription: z.string().max(500, 'รายละเอียดเว็บต้องไม่เกิน 500 ตัวอักษร'),
  iconUrl: z.string().nullable(),
  companyName: z.string().max(200, 'ชื่อบริษัทต้องไม่เกิน 200 ตัวอักษร'),
  taxId: z.string().max(32, 'เลขประจำตัวผู้เสียภาษีต้องไม่เกิน 32 ตัวอักษร'),
  address: z.string().max(500, 'ที่อยู่บริษัทต้องไม่เกิน 500 ตัวอักษร'),
  website: z.string().max(300, 'เว็บไซต์ต้องไม่เกิน 300 ตัวอักษร'),
  email: z.string().max(160, 'อีเมลต้องไม่เกิน 160 ตัวอักษร'),
  phone: z.string().max(40, 'เบอร์โทรศัพท์ต้องไม่เกิน 40 ตัวอักษร'),
});

export interface SystemSettingsData {
  siteName: string;
  siteDescription: string;
  iconUrl: string | null;
  companyName: string;
  taxId: string;
  address: string;
  website: string;
  email: string;
  phone: string;
  updatedAt?: string;
}

export const DEFAULT_SETTINGS: SystemSettingsData = {
  siteName: '',
  siteDescription: '',
  iconUrl: null,
  companyName: '',
  taxId: '',
  address: '',
  website: '',
  email: '',
  phone: '',
};
