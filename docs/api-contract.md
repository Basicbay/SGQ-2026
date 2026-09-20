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

## หมวดข้อมูลสินค้าและวัสดุ (Swagger Section: `products`)

| Method | Endpoint | คำอธิบาย | สิทธิ์ (Auth) |
|---|---|---|---|
| `GET` | `/products` | ดึงรายการข้อมูลสินค้าและวัสดุทั้งหมด (รองรับ ค้นหา, กรองหมวดหมู่/สต็อก/สถานะ, แบ่งหน้า) | Bearer JWT |
| `GET` | `/products/:id` | ดึงข้อมูลสินค้ารายชิ้นตาม ID | Bearer JWT |
| `POST` | `/products` | สร้างข้อมูลสินค้าใหม่ (รหัสจะถูกสร้างให้อัตโนมัติหากเว้นว่าง เช่น `PRD-2026-0001`) | Bearer JWT |
| `PUT` | `/products/:id` | แก้ไขข้อมูลสินค้าและวัสดุ | Bearer JWT |
| `DELETE` | `/products/:id` | ลบข้อมูลสินค้าและวัสดุ | Bearer JWT |
| `GET` | `/api/products` | Next.js API Route พร็อกซีดึงรายการสินค้า | Bearer JWT / NextAuth |
| `POST` | `/api/products` | Next.js API Route พร็อกซีสร้างสินค้าใหม่ | Bearer JWT / NextAuth |
| `GET` | `/api/products/:id` | Next.js API Route พร็อกซีดึงสินค้ารายชิ้น | Bearer JWT / NextAuth |
| `PUT` | `/api/products/:id` | Next.js API Route พร็อกซีแก้ไขข้อมูลสินค้า | Bearer JWT / NextAuth |
| `DELETE` | `/api/products/:id` | Next.js API Route พร็อกซีลบข้อมูลสินค้า | Bearer JWT / NextAuth |

### พารามิเตอร์ Query ของ `GET /products`:
- `search` (string, max 100): ค้นหารหัสสินค้า, ชื่อสินค้า, ยี่ห้อ/แบรนด์, สี, รายละเอียดสเปก
- `category` (string): กรองตามหมวดหมู่ (`CONSTRUCTION`, `INTERIOR`, `STRUCTURAL`, `ELECTRICAL`, `PLUMBING`, `PAINT_COATING`, `ROOFING_INSULATION`, `DOOR_WINDOW`, `OTHER`)
- `stockStatus` (string): กรองตามสถานะสต็อก (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`, `ORDER_ON_DEMAND`)
- `status` (string): กรองตามสถานะสินค้า (`ACTIVE`, `INACTIVE`)
- `page` (number, default 1): ลำดับหน้า
- `limit` (number, default 10, max 100): จำนวนรายการต่อหน้า

### ฟิลด์ข้อมูลของ `POST /products`:
- `productCode` (string, 3–32 ตัวอักษร, อักขระ `^[a-zA-Z0-9_.-]+$`, ระบบสร้างอัตโนมัติหากเว้นว่าง)
- `name` (string, 1–200 ตัวอักษร) *จำเป็น
- `category` (enum: `CONSTRUCTION`, `INTERIOR`, `STRUCTURAL`, `ELECTRICAL`, `PLUMBING`, `PAINT_COATING`, `ROOFING_INSULATION`, `DOOR_WINDOW`, `OTHER`, default `CONSTRUCTION`)
- `brand` (string, สูงสุด 100 ตัวอักษร)
- `color` (string, สูงสุด 60 ตัวอักษร)
- `unit` (string, สูงสุด 30 ตัวอักษร, default `'ชิ้น'`) *จำเป็น
- `costPrice` (number, ไม่น้อยกว่า 0, default 0)
- `sellingPrice` (number, ไม่น้อยกว่า 0, default 0)
- `stockQuantity` (number, ไม่น้อยกว่า 0, default 0)
- `stockStatus` (enum: `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`, `ORDER_ON_DEMAND`, default `IN_STOCK`)
- `status` (enum: `ACTIVE`, `INACTIVE`, default `ACTIVE`)
- `imageUrl` (string, รูปแบบ URL หรือ path ของรูปภาพ)
- `description` (string, รายละเอียดคุณลักษณะสินค้า)
- `note` (string, บันทึกหมายเหตุเพิ่มเติม)

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

## หมวดข้อมูลใบเสนอราคา (Swagger Section: `quotations`)

| Method | Endpoint | คำอธิบาย | สิทธิ์ (Auth) |
|---|---|---|---|
| `GET` | `/quotations` | ดึงรายการใบเสนอราคาทั้งหมด (รองรับ ค้นหา, กรองสถานะ/ลูกค้า/โครงการ/ช่วงวันที่, สถิติสรุปยอดรวม, แบ่งหน้า) | Bearer JWT |
| `GET` | `/quotations/:id` | ดึงรายละเอียดใบเสนอราคาและรายการสินค้าทั้งหมด (รวมข้อมูลลูกค้าและโครงการ Snapshot) | Bearer JWT |
| `POST` | `/quotations` | สร้างใบเสนอราคาใหม่ (ระบบออกเลขที่ `QT-YYYY-XXXX` อัตโนมัติหากเว้นว่าง, คำนวณยอดเงิน ส่วนลด และภาษี) | Bearer JWT |
| `PUT` | `/quotations/:id` | แก้ไขข้อมูลใบเสนอราคาและรายการสินค้า (คำนวณยอดเงินและกำไรใหม่) | Bearer JWT |
| `PATCH` | `/quotations/:id/status` | เปลี่ยนสถานะใบเสนอราคา เช่น อนุมัติ (APPROVED), ส่งมอบ (SENT), ลูกค้ายอมรับ (ACCEPTED), ปฏิเสธ (REJECTED) | Bearer JWT |
| `DELETE` | `/quotations/:id` | ลบใบเสนอราคา (สงวนสำหรับสถานะ DRAFT / CANCELLED หรือบทบาทผู้ดูแลระบบ) | Bearer JWT |
| `GET` | `/api/quotations` | Next.js API Route พร็อกซีดึงรายการใบเสนอราคา | Bearer JWT / NextAuth |
| `POST` | `/api/quotations` | Next.js API Route พร็อกซีสร้างใบเสนอราคาใหม่ | Bearer JWT / NextAuth |
| `GET` | `/api/quotations/:id` | Next.js API Route พร็อกซีดึงรายละเอียดใบเสนอราคา | Bearer JWT / NextAuth |
| `PUT` | `/api/quotations/:id` | Next.js API Route พร็อกซีแก้ไขข้อมูลใบเสนอราคา | Bearer JWT / NextAuth |
| `PATCH` | `/api/quotations/:id/status` | Next.js API Route พร็อกซีเปลี่ยนสถานะใบเสนอราคา | Bearer JWT / NextAuth |
| `DELETE` | `/api/quotations/:id` | Next.js API Route พร็อกซีลบใบเสนอราคา | Bearer JWT / NextAuth |

### พารามิเตอร์ Query ของ `GET /quotations`:
- `search` (string, max 100): ค้นหาเลขที่เอกสาร, ชื่อลูกค้า, ชื่อโครงการ
- `status` (string): กรองตามสถานะ (`DRAFT`, `PENDING_REVIEW`, `PENDING_APPROVAL`, `APPROVED`, `SENT`, `ACCEPTED`, `REJECTED`, `EXPIRED`, `CANCELLED`)
- `customerId` (uuid): กรองตามรหัสลูกค้า
- `projectId` (uuid): กรองตามรหัสโครงการ
- `startDate` (string, YYYY-MM-DD): วันที่ออกเอกสารเริ่มต้น
- `endDate` (string, YYYY-MM-DD): วันที่ออกเอกสารถึง
- `page` (number, default 1): ลำดับหน้า
- `limit` (number, default 10, max 100): จำนวนรายการต่อหน้า

### ฟิลด์ข้อมูลของ `POST /quotations`:
- `quotationNumber` (string, 3–32 ตัวอักษร, สร้างอัตโนมัติหากเว้นว่าง)
- `customerId` (uuid) *จำเป็น
- `projectId` (uuid, optional)
- `issueDate` (string, YYYY-MM-DD, default วันที่ปัจจุบัน)
- `validDays` (number, default 30)
- `validUntil` (string, YYYY-MM-DD, auto คำนวณจาก `issueDate + validDays`)
- `customerName` (string, optional - snapshot จากลูกค้า)
- `customerAddress` (string, optional)
- `customerPhone` (string, optional)
- `customerTaxId` (string, optional)
- `customerContact` (string, optional)
- `projectName` (string, optional)
- `discountType` (enum: `AMOUNT`, `PERCENT`, default `AMOUNT`)
- `discountRate` (number, default 0)
- `vatRate` (number, default 7.0)
- `paymentTerms` (string, optional)
- `deliveryTerms` (string, optional)
- `warrantyTerms` (string, optional)
- `notes` (string, optional)
- `items` (array of items):
  - `productId` (uuid, optional)
  - `itemType` (enum: `PRODUCT`, `SERVICE`, `CUSTOM`, `LABOR`, default `PRODUCT`)
  - `itemCode` (string, optional)
  - `itemName` (string, 1–250 ตัวอักษร) *จำเป็น
  - `description` (string, optional)
  - `quantity` (number, > 0) *จำเป็น
  - `unit` (string, default `'ชิ้น'`)
  - `unitCost` (number, default 0)
  - `unitPrice` (number, >= 0) *จำเป็น
  - `discountAmount` (number, default 0)
  - `sortOrder` (number, default 1)

## หมวดภาพรวมและสถิติระบบ (Dashboard Overview)

| Method | Endpoint | คำอธิบาย | สิทธิ์ (Auth) |
|---|---|---|---|
| `GET` | `/dashboard/overview` | สถิติภาพรวม มูลค่าใบเสนอราคา กราฟแนวโน้ม และรายการล่าสุดตามช่วงเวลาที่กำหนด | Bearer JWT |
| `GET` | `/api/dashboard/overview` | Next.js API Route พร็อกซีดึงข้อมูลภาพรวมระบบ | Bearer JWT / NextAuth |

### พารามิเตอร์ Query ของ `GET /dashboard/overview`:
- `period` (string, optional, default `TODAY`): ช่วงเวลาที่ต้องการกรองข้อมูล
  - `TODAY`: วันนี้ (Default)
  - `YESTERDAY`: เมื่อวาน
  - `THIS_WEEK`: สัปดาห์นี้
  - `LAST_7_DAYS`: 7 วันล่าสุด
  - `THIS_MONTH`: เดือนนี้
  - `THIS_QUARTER`: ไตรมาสนี้
  - `THIS_YEAR`: ปีนี้

### ผลลัพธ์ที่ส่งกลับ (Response Format):
```json
{
  "period": "TODAY",
  "periodLabel": "วันนี้",
  "summary": {
    "totalValue": 1250000.00,
    "totalValueFormatted": "฿1,250,000.00",
    "previousPeriodValue": 1000000.00,
    "valueChangePercent": "+25.0%",
    "valueChangeTrend": "up",
    "totalQuotations": 5,
    "approvedCount": 3,
    "pendingCount": 2,
    "winRate": "60.0%",
    "activeCustomers": 12,
    "activeProjects": 8,
    "totalProducts": 45
  },
  "trend": {
    "period": "TODAY",
    "dataPoints": [
      { "label": "09:00", "value": 0 },
      { "label": "12:00", "value": 500000 }
    ],
    "maxValue": 500000
  },
  "statusBreakdown": [
    { "status": "APPROVED", "label": "อนุมัติแล้ว", "count": 3, "percentage": "60%", "color": "#10b981", "bgClass": "bg-emerald-500" }
  ],
  "recentQuotations": [
    {
      "id": "uuid",
      "quotationNumber": "QT-2026-0001",
      "customerName": "บริษัท ตัวอย่าง จำกัด",
      "projectName": "โครงการคอนโดมิเนียม",
      "totalAmount": 1250000.00,
      "totalAmountFormatted": "฿1,250,000.00",
      "status": "APPROVED",
      "issueDate": "2026-09-20",
      "updatedAt": "2026-09-20T10:00:00.000Z"
    }
  ]
}
```