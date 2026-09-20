# Entity และความสัมพันธ์ข้อมูล

## ตารางผู้ใช้งาน (`users`)

ตารางจัดเก็บข้อมูลบัญชีผู้ใช้และข้อมูลส่วนตัวของผู้ใช้งานในระบบ

| คอลัมน์ (Column) | ชนิดข้อมูล (Data Type) | Nullable | Default | คำอธิบาย |
|---|---|---|---|---|
| `id` | `uuid` | ไม่ว่าง (NO) | `gen_random_uuid()` | Primary Key รหัสผู้ใช้งาน |
| `username` | `varchar(64)` | ไม่ว่าง (NO) | - | ชื่อบัญชีผู้ใช้ (Unique, รูปแบบ `^[a-z0-9_.-]{3,64}$`) |
| `password_hash` | `text` | ไม่ว่าง (NO) | - | รหัสผ่านแฮชด้วย Argon2 (ซ่อนไม่ส่งออกใน query ทั่วไป) |
| `role` | `varchar(32)` | ไม่ว่าง (NO) | `'ADMIN'` | บทบาทผู้ใช้ (`SUPER_ADMIN`, `ADMIN`, `SALES`, `ESTIMATOR`) |
| `status` | `varchar(32)` | ไม่ว่าง (NO) | `'ACTIVE'` | สถานะการใช้งาน (`ACTIVE` ใช้งาน, `INACTIVE` ไม่ใช้งาน) |
| `full_name` | `varchar(160)` | ได้ (YES) | `NULL` | ชื่อ-นามสกุลจริง |
| `nickname` | `varchar(64)` | ได้ (YES) | `NULL` | ชื่อเล่น |
| `phone` | `varchar(40)` | ได้ (YES) | `NULL` | เบอร์โทรศัพท์ติดต่อ |
| `email` | `varchar(160)` | ได้ (YES) | `NULL` | อีเมล |
| `citizen_id` | `varchar(20)` | ได้ (YES) | `NULL` | เลขบัตรประจำตัวประชาชน |
| `line_id` | `varchar(100)` | ได้ (YES) | `NULL` | Line ID สำหรับติดต่อประสานงาน |
| `created_at` | `timestamptz` | ไม่ว่าง (NO) | `now()` | วันที่และเวลาที่สร้างข้อมูล |
| `updated_at` | `timestamptz` | ไม่ว่าง (NO) | `now()` | วันที่และเวลาที่อัปเดตล่าสุด |

## ตารางการตั้งค่าระบบ (`system_settings`)

ตารางจัดเก็บข้อมูลการตั้งค่าเว็บไซต์และข้อมูลบริษัท

| คอลัมน์ (Column) | ชนิดข้อมูล (Data Type) | Nullable | คำอธิบาย |
|---|---|---|---|
| `id` | `uuid` | ไม่ว่าง (NO) | Primary Key |
| `site_name` | `varchar(160)` | ไม่ว่าง (NO) | ชื่อเว็บไซต์ |
| `site_description` | `text` | ได้ (YES) | รายละเอียดเว็บไซต์ |
| `icon_url` | `text` | ได้ (YES) | URL ไอคอน/โลโก้เว็บไซต์ |
| `company_name` | `varchar(200)` | ได้ (YES) | ชื่อบริษัท |
| `tax_id` | `varchar(32)` | ได้ (YES) | เลขประจำตัวผู้เสียภาษี |
| `address` | `text` | ได้ (YES) | ที่อยู่บริษัท |
| `website` | `varchar(300)` | ได้ (YES) | เว็บไซต์บริษัท |
| `email` | `varchar(160)` | ได้ (YES) | อีเมลติดต่อ |
| `phone` | `varchar(40)` | ได้ (YES) | เบอร์โทรศัพท์ |
| `created_at` | `timestamptz` | ไม่ว่าง (NO) | วันที่สร้าง |
| `updated_at` | `timestamptz` | ไม่ว่าง (NO) | วันที่อัปเดตล่าสุด |

## ตารางข้อมูลลูกค้า (`customers`)

ตารางจัดเก็บข้อมูลลูกค้าและบริษัทคู่ค้า สำหรับออกใบเสนอราคาและโครงการก่อสร้าง

| คอลัมน์ (Column) | ชนิดข้อมูล (Data Type) | Nullable | Default | คำอธิบาย |
|---|---|---|---|---|
| `id` | `uuid` | ไม่ว่าง (NO) | `gen_random_uuid()` | Primary Key รหัสลูกค้าภายในระบบ |
| `customer_code` | `varchar(32)` | ไม่ว่าง (NO) | - | รหัสลูกค้าอ้างอิง (Unique, เช่น `CUST-2609-0001`) |
| `name` | `varchar(200)` | ไม่ว่าง (NO) | - | ชื่อลูกค้า หรือชื่อบริษัท/นิติบุคคล |
| `customer_type` | `varchar(32)` | ไม่ว่าง (NO) | `'COMPANY'` | ประเภทลูกค้า (`COMPANY` นิติบุคคล, `INDIVIDUAL` บุคคลธรรมดา) |
| `tax_id` | `varchar(32)` | ได้ (YES) | `NULL` | เลขประจำตัวผู้เสียภาษีอากร หรือเลขบัตรประชาชน |
| `contact_name` | `varchar(160)` | ได้ (YES) | `NULL` | ชื่อผู้ติดต่อประสานงาน |
| `phone` | `varchar(40)` | ได้ (YES) | `NULL` | เบอร์โทรศัพท์ติดต่อ |
| `email` | `varchar(160)` | ได้ (YES) | `NULL` | อีเมลติดต่อ |
| `line_id` | `varchar(100)` | ได้ (YES) | `NULL` | Line ID สำหรับติดต่อประสานงาน |
| `address` | `text` | ได้ (YES) | `NULL` | ที่อยู่สำหรับออกเอกสารและใบเสนอราคา |
| `note` | `text` | ได้ (YES) | `NULL` | บันทึกหมายเหตุเพิ่มเติม |
| `status` | `varchar(32)` | ไม่ว่าง (NO) | `'ACTIVE'` | สถานะลูกค้า (`ACTIVE` ใช้งาน, `INACTIVE` ไม่ใช้งาน) |
| `created_at` | `timestamptz` | ไม่ว่าง (NO) | `now()` | วันที่และเวลาที่สร้างข้อมูล |
| `updated_at` | `timestamptz` | ไม่ว่าง (NO) | `now()` | วันที่และเวลาที่อัปเดตล่าสุด |

## ตารางข้อมูลโครงการ (`projects`)

ตารางจัดเก็บข้อมูลโครงการก่อสร้าง ขอบเขตงาน งบประมาณ ระยะเวลาดำเนินงาน และสถานะโครงการ เชื่อมโยงกับลูกค้าผู้ว่าจ้าง

| คอลัมน์ (Column) | ชนิดข้อมูล (Data Type) | Nullable | Default | คำอธิบาย |
|---|---|---|---|---|
| `id` | `uuid` | ไม่ว่าง (NO) | `gen_random_uuid()` | Primary Key รหัสโครงการภายในระบบ |
| `project_code` | `varchar(32)` | ไม่ว่าง (NO) | - | รหัสโครงการอ้างอิง (Unique, เช่น `PRJ-2026-0001`) |
| `name` | `varchar(200)` | ไม่ว่าง (NO) | - | ชื่อโครงการก่อสร้าง |
| `customer_id` | `uuid` | ได้ (YES) | `NULL` | Foreign Key อ้างอิงไปยัง `customers(id)` (ON DELETE SET NULL) |
| `project_type` | `varchar(50)` | ไม่ว่าง (NO) | `'CONSTRUCTION'` | ประเภทโครงการ (`CONSTRUCTION`, `RESIDENTIAL`, `INTERIOR`, `RENOVATION`, `INFRASTRUCTURE`) |
| `location` | `varchar(300)` | ได้ (YES) | `NULL` | สถานที่ก่อสร้าง / ทำเลที่ตั้งโครงการ |
| `budget` | `numeric(14,2)` | ไม่ว่าง (NO) | `0` | งบประมาณโครงการ (บาท) |
| `start_date` | `date` | ได้ (YES) | `NULL` | วันที่เริ่มต้นโครงการ (YYYY-MM-DD) |
| `end_date` | `date` | ได้ (YES) | `NULL` | วันที่สิ้นสุดโครงการ (YYYY-MM-DD) |
| `status` | `varchar(32)` | ไม่ว่าง (NO) | `'PLANNING'` | สถานะโครงการ (`PLANNING`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`, `CANCELLED`) |
| `description` | `text` | ได้ (YES) | `NULL` | รายละเอียดขอบเขตงานโครงการ |
| `note` | `text` | ได้ (YES) | `NULL` | บันทึกหมายเหตุเพิ่มเติม |
| `created_at` | `timestamptz` | ไม่ว่าง (NO) | `now()` | วันที่และเวลาที่สร้างข้อมูล |
| `updated_at` | `timestamptz` | ไม่ว่าง (NO) | `now()` | วันที่และเวลาที่อัปเดตล่าสุด |