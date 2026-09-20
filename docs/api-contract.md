# รูปแบบ API และการเชื่อมต่อ

## โครงสร้าง Response มาตรฐาน

ทุก API ตอบกลับด้วยรูปแบบ Response Envelope มาตรฐาน:

```json
{
  "statusCode": 200,
  "error": null,
  "message_code": "SUCCESS",
  "message": "Success",
  "data": {},
  "metadata": {}
}
```

## หมวดการตั้งค่าระบบ (Swagger Section: `settings`)

| Method | Endpoint | คำอธิบาย | สิทธิ์ (Auth) |
|---|---|---|---|
| `GET` | `/settings/system` | ดึงข้อมูลการตั้งค่าระบบและเว็บไซต์ | Public |
| `GET` | `/settings/storage` | ดึงข้อมูลสถิติพื้นที่จัดเก็บ Neon DB (ความจุที่ใช้, โควต้า 512 MB, พื้นที่คงเหลือ) | Public / JWT |
| `PUT` | `/settings/system` | แก้ไขข้อมูลการตั้งค่าระบบและเว็บไซต์ | Bearer JWT |
| `GET` | `/api/settings/storage` | Next.js API Route พร็อกซีดึงข้อมูลพื้นที่จัดเก็บ Neon DB | Public / JWT |

## หมวดการจัดการผู้ใช้งาน (Swagger Section: `users`)

| Method | Endpoint | คำอธิบาย | สิทธิ์ (Auth) |
|---|---|---|---|
| `GET` | `/settings/users` | ดึงรายการข้อมูลผู้ใช้งานทั้งหมด (รองรับ ค้นหา, กรอง Role/Status, แบ่งหน้า) | Bearer JWT |
| `GET` | `/settings/users/:id` | ดึงข้อมูลผู้ใช้งานตาม ID | Bearer JWT |
| `POST` | `/settings/users` | สร้างผู้ใช้งานใหม่ในระบบ | Bearer JWT |
| `PUT` | `/settings/users/:id` | แก้ไขข้อมูลผู้ใช้งาน และ/หรือ เปลี่ยนรหัสผ่าน | Bearer JWT |
| `DELETE` | `/settings/users/:id` | ลบผู้ใช้งาน (ห้ามลบบัญชีตนเองที่กำลังเข้าสู่ระบบ) | Bearer JWT |

### พารามิเตอร์ Query ของ `GET /settings/users`:
- `search` (string, max 100): ค้นหาชื่อเต็ม, ชื่อเล่น, username, email, phone, lineId หรือ citizenId
- `role` (string): กรองตามบทบาท (`SUPER_ADMIN`, `ADMIN`, `SALES`, `ESTIMATOR`)
- `status` (string): กรองตามสถานะ (`ACTIVE`, `INACTIVE`)
- `page` (number, default 1): ลำดับหน้า
- `limit` (number, default 10, max 100): จำนวนรายการต่อหน้า

### ฟิลด์ข้อมูลของ `POST /settings/users`:
- `username` (string, 3–64 ตัวอักษร, อักขระ `^[a-z0-9_.-]+$`) *จำเป็น
- `password` (string, 8–128 ตัวอักษร) *จำเป็น
- `role` (enum: `SUPER_ADMIN`, `ADMIN`, `SALES`, `ESTIMATOR`) *จำเป็น
- `status` (enum: `ACTIVE`, `INACTIVE`, default `ACTIVE`)
- `fullName` (string, สูงสุด 160 ตัวอักษร) *จำเป็น
- `nickname` (string, สูงสุด 64 ตัวอักษร)
- `phone` (string, สูงสุด 40 ตัวอักษร)
- `email` (string, รูปแบบอีเมล, สูงสุด 160 ตัวอักษร)
- `lineId` (string, สูงสุด 100 ตัวอักษร)
- `citizenId` (string, สูงสุด 20 ตัวอักษร)

## หมวดข้อมูลลูกค้า (Swagger Section: `customers`)

| Method | Endpoint | คำอธิบาย | สิทธิ์ (Auth) |
|---|---|---|---|
| `GET` | `/customers` | ดึงรายการข้อมูลลูกค้าทั้งหมด (รองรับ ค้นหา, กรองประเภท/สถานะ, แบ่งหน้า) | Bearer JWT |
| `GET` | `/customers/:id` | ดึงข้อมูลลูกค้ารายคนตาม ID | Bearer JWT |
| `POST` | `/customers` | สร้างข้อมูลลูกค้าใหม่ | Bearer JWT |
| `PUT` | `/customers/:id` | แก้ไขข้อมูลลูกค้า | Bearer JWT |
| `DELETE` | `/customers/:id` | ลบข้อมูลลูกค้า | Bearer JWT |
| `GET` | `/api/customers` | Next.js API Route พร็อกซีดึงรายการลูกค้า | Bearer JWT / NextAuth |
| `POST` | `/api/customers` | Next.js API Route พร็อกซีสร้างลูกค้าใหม่ | Bearer JWT / NextAuth |
| `GET` | `/api/customers/:id` | Next.js API Route พร็อกซีดึงลูกค้ารายคน | Bearer JWT / NextAuth |
| `PUT` | `/api/customers/:id` | Next.js API Route พร็อกซีแก้ไขข้อมูลลูกค้า | Bearer JWT / NextAuth |
| `DELETE` | `/api/customers/:id` | Next.js API Route พร็อกซีลบข้อมูลลูกค้า | Bearer JWT / NextAuth |

### พารามิเตอร์ Query ของ `GET /customers`:
- `search` (string, max 100): ค้นหารหัสลูกค้า, ชื่อลูกค้า/บริษัท, ชื่อผู้ติดต่อ, เลขผู้เสียภาษี, เบอร์โทร, อีเมล, Line ID
- `customerType` (string): กรองตามประเภทลูกค้า (`COMPANY`, `INDIVIDUAL`)
- `status` (string): กรองตามสถานะ (`ACTIVE`, `INACTIVE`)
- `page` (number, default 1): ลำดับหน้า
- `limit` (number, default 10, max 100): จำนวนรายการต่อหน้า

### ฟิลด์ข้อมูลของ `POST /customers`:
- `customerCode` (string, 3–32 ตัวอักษร, อักขระ `^[a-zA-Z0-9_.-]+$`, ระบบสร้างอัตโนมัติหากเว้นว่าง)
- `name` (string, 1–200 ตัวอักษร) *จำเป็น
- `customerType` (enum: `COMPANY`, `INDIVIDUAL`, default `COMPANY`)
- `taxId` (string, สูงสุด 32 ตัวอักษร)
- `contactName` (string, สูงสุด 160 ตัวอักษร)
- `phone` (string, สูงสุด 40 ตัวอักษร)
- `email` (string, รูปแบบอีเมล, สูงสุด 160 ตัวอักษร)
- `lineId` (string, สูงสุด 100 ตัวอักษร)
- `address` (string, สูงสุด 500 ตัวอักษร)
- `note` (string, สูงสุด 500 ตัวอักษร)
- `status` (enum: `ACTIVE`, `INACTIVE`, default `ACTIVE`)

## หมวดข้อมูลโครงการ (Swagger Section: `projects`)

| Method | Endpoint | คำอธิบาย | สิทธิ์ (Auth) |
|---|---|---|---|
| `GET` | `/projects` | ดึงรายการข้อมูลโครงการทั้งหมด (รองรับ ค้นหา, กรองประเภท/สถานะ/ลูกค้า, แบ่งหน้า) | Bearer JWT |
| `GET` | `/projects/:id` | ดึงข้อมูลโครงการรายโครงการตาม ID | Bearer JWT |
| `POST` | `/projects` | สร้างข้อมูลโครงการใหม่ (รหัสจะถูกสร้างให้อัตโนมัติหากเว้นว่าง เช่น `PRJ-2026-0006`) | Bearer JWT |
| `PUT` | `/projects/:id` | แก้ไขข้อมูลโครงการ | Bearer JWT |
| `DELETE` | `/projects/:id` | ลบข้อมูลโครงการ | Bearer JWT |
| `GET` | `/api/projects` | Next.js API Route พร็อกซีดึงรายการโครงการ | Bearer JWT / NextAuth |
| `POST` | `/api/projects` | Next.js API Route พร็อกซีสร้างโครงการใหม่ | Bearer JWT / NextAuth |
| `GET` | `/api/projects/:id` | Next.js API Route พร็อกซีดึงโครงการรายโครงการ | Bearer JWT / NextAuth |
| `PUT` | `/api/projects/:id` | Next.js API Route พร็อกซีแก้ไขข้อมูลโครงการ | Bearer JWT / NextAuth |
| `DELETE` | `/api/projects/:id` | Next.js API Route พร็อกซีลบข้อมูลโครงการ | Bearer JWT / NextAuth |

### พารามิเตอร์ Query ของ `GET /projects`:
- `search` (string, max 100): ค้นหารหัสโครงการ, ชื่อโครงการ, ทำเลที่ตั้ง, ชื่อลูกค้า
- `customerId` (uuid): กรองตามรหัสลูกค้า (Customer UUID)
- `projectType` (string): กรองตามประเภทโครงการ (`CONSTRUCTION`, `RESIDENTIAL`, `INTERIOR`, `RENOVATION`, `INFRASTRUCTURE`)
- `status` (string): กรองตามสถานะ (`PLANNING`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`, `CANCELLED`)
- `page` (number, default 1): ลำดับหน้า
- `limit` (number, default 10, max 100): จำนวนรายการต่อหน้า

### ฟิลด์ข้อมูลของ `POST /projects`:
- `projectCode` (string, 3–32 ตัวอักษร, อักขระ `^[a-zA-Z0-9_.-]+$`, ระบบสร้างอัตโนมัติหากเว้นว่าง)
- `name` (string, 1–200 ตัวอักษร) *จำเป็น
- `customerId` (uuid, optional, nullable)
- `projectType` (enum: `CONSTRUCTION`, `RESIDENTIAL`, `INTERIOR`, `RENOVATION`, `INFRASTRUCTURE`, default `CONSTRUCTION`)
- `location` (string, สูงสุด 300 ตัวอักษร)
- `budget` (number, ไม่น้อยกว่า 0, default 0)
- `startDate` (string, รูปแบบ YYYY-MM-DD)
- `endDate` (string, รูปแบบ YYYY-MM-DD)
- `status` (enum: `PLANNING`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`, `CANCELLED`, default `PLANNING`)
- `description` (string, รายละเอียดขอบเขตงาน)
- `note` (string, หมายเหตุเพิ่มเติม)

## หมวดอัปโหลดและจัดการไฟล์รูปภาพ (Swagger Section: `upload`)

ระบบใช้ MinIO / S3-Compatible Object Storage ในการจัดเก็บไฟล์รูปภาพ และให้บริการดึงรูปภาพผ่าน API สตรีมตรง ไม่บันทึกลง local directory ของ frontend หรือโปรเจกต์

| Method | Endpoint | คำอธิบาย | สิทธิ์ (Auth) |
|---|---|---|---|
| `POST` | `/upload` | อัปโหลดรูปภาพไปยัง MinIO (รองรับ PNG, JPG, JPEG, SVG, WebP, ICO ขนาดไม่เกิน 5MB) | Public / JWT |
| `POST` | `/upload/image` | Alias ของ `/upload` | Public / JWT |
| `GET` | `/upload/:filename` | ดึงและสตรีมรูปภาพจาก MinIO ตามชื่อไฟล์ พร้อม Content-Type และ Cache-Control | Public |
| `GET` | `/upload/file/:filename` | Alias ของ `/upload/:filename` | Public |
| `GET` | `/api/upload/:filename` | Next.js API Route สำหรับดึง/พร็อกซีรูปภาพจาก Backend API มาแสดงผลบนหน้าเว็บ | Public |

### โครงสร้าง Response ของ `POST /upload`:
```json
{
  "statusCode": 200,
  "error": null,
  "message_code": "SUCCESS",
  "message": "Success",
  "data": {
    "url": "/api/upload/site-icon-1789822204284-aazrhb.webp",
    "filename": "site-icon-1789822204284-aazrhb.webp",
    "size": 45678,
    "mimetype": "image/webp"
  },
  "metadata": {}
}
```