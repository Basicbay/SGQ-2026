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

## ตารางข้อมูลสินค้าและวัสดุ (`products`)

ตารางจัดเก็บข้อมูลสินค้า วัสดุก่อสร้าง อุปกรณ์ และค่าแรง สำหรับนำไปใช้จัดทำใบเสนอราคา (Quotation) และคำนวณต้นทุนโครงการ

| คอลัมน์ (Column) | ชนิดข้อมูล (Data Type) | Nullable | Default | คำอธิบาย |
|---|---|---|---|---|
| `id` | `uuid` | ไม่ว่าง (NO) | `gen_random_uuid()` | Primary Key รหัสสินค้าภายในระบบ |
| `product_code` | `varchar(32)` | ไม่ว่าง (NO) | - | รหัสสินค้าอ้างอิง (Unique, เช่น `PRD-2026-0001`) |
| `name` | `varchar(200)` | ไม่ว่าง (NO) | - | ชื่อสินค้า วัสดุ หรือบริการ |
| `category` | `varchar(50)` | ไม่ว่าง (NO) | `'CONSTRUCTION'` | หมวดหมู่สินค้า (`CONSTRUCTION`, `INTERIOR`, `STRUCTURAL`, `ELECTRICAL`, `PLUMBING`, `PAINT_COATING`, `ROOFING_INSULATION`, `DOOR_WINDOW`, `OTHER`) |
| `brand` | `varchar(100)` | ได้ (YES) | `NULL` | ยี่ห้อ / ตราสินค้า / ผู้ผลิต |
| `color` | `varchar(60)` | ได้ (YES) | `NULL` | สี / ลวดลาย / รุ่น |
| `unit` | `varchar(30)` | ไม่ว่าง (NO) | `'ชิ้น'` | หน่วยนับ (เช่น ถุง, ตร.ม., เมตร, ท่อน, ชุด, ชิ้น) |
| `cost_price` | `numeric(12,2)` | ไม่ว่าง (NO) | `0` | ราคาต้นทุนต่อหน่วย (บาท) |
| `selling_price` | `numeric(12,2)` | ไม่ว่าง (NO) | `0` | ราคาขายมาตรฐานต่อหน่วย (บาท) |
| `stock_quantity` | `numeric(12,2)` | ไม่ว่าง (NO) | `0` | ปริมาณคงคลัง / ยอดสต็อก |
| `stock_status` | `varchar(32)` | ไม่ว่าง (NO) | `'IN_STOCK'` | สถานะสต็อก (`IN_STOCK` มีสินค้า, `LOW_STOCK` ใกล้หมด, `OUT_OF_STOCK` หมด, `ORDER_ON_DEMAND` สั่งพิเศษ) |
| `status` | `varchar(32)` | ไม่ว่าง (NO) | `'ACTIVE'` | สถานะสินค้า (`ACTIVE` ใช้งาน, `INACTIVE` ระงับจำหน่าย) |
| `image_url` | `text` | ได้ (YES) | `NULL` | URL รูปภาพสินค้า |
| `description` | `text` | ได้ (YES) | `NULL` | รายละเอียดสเปกและคุณสมบัติสินค้า |
| `note` | `text` | ได้ (YES) | `NULL` | บันทึกหมายเหตุเพิ่มเติม |
| `created_at` | `timestamptz` | ไม่ว่าง (NO) | `now()` | วันที่และเวลาที่สร้างข้อมูล |
| `updated_at` | `timestamptz` | ไม่ว่าง (NO) | `now()` | วันที่และเวลาที่อัปเดตล่าสุด |

## ตารางข้อมูลใบเสนอราคา (`quotations`)

ตารางจัดเก็บข้อมูลเอกสารใบเสนอราคา (Quotation Header) สำหรับเสนอราคาลูกค้า พร้อมบันทึก Snapshot รายละเอียดลูกค้าและโครงการ ณ เวลาที่ออกเอกสาร เพื่อป้องกันข้อมูลเดิมเปลี่ยนแปลงตามข้อมูลปัจจุบัน (อ้างอิงตาม `PROJECT.md`)

| คอลัมน์ (Column) | ชนิดข้อมูล (Data Type) | Nullable | Default | คำอธิบาย |
|---|---|---|---|---|
| `id` | `uuid` | ไม่ว่าง (NO) | `gen_random_uuid()` | Primary Key รหัสใบเสนอราคาภายในระบบ |
| `quotation_number` | `varchar(32)` | ไม่ว่าง (NO) | - | เลขที่เอกสารใบเสนอราคา (Unique, เช่น `QT-2026-0001`) |
| `customer_id` | `uuid` | ไม่ว่าง (NO) | - | Foreign Key อ้างอิงไปยัง `customers(id)` (ON DELETE RESTRICT) |
| `project_id` | `uuid` | ได้ (YES) | `NULL` | Foreign Key อ้างอิงไปยัง `projects(id)` (ON DELETE SET NULL) |
| `seller_id` | `uuid` | ได้ (YES) | `NULL` | Foreign Key อ้างอิงไปยัง `users(id)` ผู้จัดทำใบเสนอราคา |
| `approved_by_id` | `uuid` | ได้ (YES) | `NULL` | Foreign Key อ้างอิงไปยัง `users(id)` ผู้อนุมัติใบเสนอราคา |
| `status` | `varchar(32)` | ไม่ว่าง (NO) | `'DRAFT'` | สถานะใบเสนอราคา (`DRAFT`, `PENDING_REVIEW`, `PENDING_APPROVAL`, `APPROVED`, `SENT`, `ACCEPTED`, `REJECTED`, `EXPIRED`, `CANCELLED`) |
| `issue_date` | `date` | ไม่ว่าง (NO) | `CURRENT_DATE` | วันที่ออกเอกสารใบเสนอราคา (YYYY-MM-DD) |
| `valid_until` | `date` | ไม่ว่าง (NO) | `CURRENT_DATE + 30 days` | วันที่หมดอายุการยืนราคา (YYYY-MM-DD) |
| `valid_days` | `integer` | ไม่ว่าง (NO) | `30` | จำนวนวันยืนราคา (วัน) |
| `customer_name` | `varchar(200)` | ไม่ว่าง (NO) | - | Snapshot ชื่อลูกค้า ณ เวลาออกเอกสาร |
| `customer_address` | `text` | ได้ (YES) | `NULL` | Snapshot ที่อยู่ออกเอกสาร |
| `customer_phone` | `varchar(40)` | ได้ (YES) | `NULL` | Snapshot เบอร์โทรศัพท์ติดต่อ |
| `customer_tax_id` | `varchar(32)` | ได้ (YES) | `NULL` | Snapshot เลขประจำตัวผู้เสียภาษี |
| `customer_contact` | `varchar(160)` | ได้ (YES) | `NULL` | Snapshot ชื่อผู้ติดต่อ |
| `project_name` | `varchar(200)` | ได้ (YES) | `NULL` | Snapshot ชื่อโครงการก่อสร้าง |
| `subtotal` | `numeric(15,2)` | ไม่ว่าง (NO) | `0` | ยอดรวมก่อนส่วนลด (บาท) |
| `discount_type` | `varchar(20)` | ไม่ว่าง (NO) | `'AMOUNT'` | ประเภทส่วนลดรวม (`AMOUNT` บาท, `PERCENT` %) |
| `discount_rate` | `numeric(8,2)` | ไม่ว่าง (NO) | `0` | อัตราส่วนลดหรือจำนวนเงินส่วนลด |
| `discount_amount` | `numeric(15,2)` | ไม่ว่าง (NO) | `0` | มูลค่าส่วนลดรวมที่คำนวณได้ (บาท) |
| `total_after_discount` | `numeric(15,2)` | ไม่ว่าง (NO) | `0` | ยอดรวมหลังหักส่วนลด (บาท) |
| `vat_rate` | `numeric(5,2)` | ไม่ว่าง (NO) | `7.00` | อัตราภาษีมูลค่าเพิ่ม (%, ปกติ 7.00% หรือ 0% กรณีไม่คิดภาษี) |
| `vat_amount` | `numeric(15,2)` | ไม่ว่าง (NO) | `0` | ภาษีมูลค่าเพิ่ม (บาท) |
| `grand_total` | `numeric(15,2)` | ไม่ว่าง (NO) | `0` | ยอดสุทธิรวมภาษีทั้งสิ้น (บาท) |
| `total_cost` | `numeric(15,2)` | ไม่ว่าง (NO) | `0` | ยอดรวมต้นทุนสินค้าและบริการทั้งหมด (บาท) |
| `estimated_profit` | `numeric(15,2)` | ไม่ว่าง (NO) | `0` | ประมาณการกำไรขั้นต้น (บาท) |
| `profit_margin_percent` | `numeric(8,2)` | ไม่ว่าง (NO) | `0` | อัตรากำไรขั้นต้น (%) |
| `payment_terms` | `text` | ได้ (YES) | `NULL` | เงื่อนไขการชำระเงิน |
| `delivery_terms` | `text` | ได้ (YES) | `NULL` | กำหนดการส่งมอบและติดตั้ง |
| `warranty_terms` | `text` | ได้ (YES) | `NULL` | เงื่อนไขการรับประกันผลงานและวัสดุ |
| `notes` | `text` | ได้ (YES) | `NULL` | บันทึกหมายเหตุเพิ่มเติมในใบเสนอราคา |
| `rejection_reason` | `text` | ได้ (YES) | `NULL` | เหตุผลกรณีปฏิเสธหรือยกเลิกใบเสนอราคา |
| `created_at` | `timestamptz` | ไม่ว่าง (NO) | `now()` | วันที่และเวลาที่สร้างข้อมูล |
| `updated_at` | `timestamptz` | ไม่ว่าง (NO) | `now()` | วันที่และเวลาที่อัปเดตล่าสุด |

## ตารางรายการสินค้าในใบเสนอราคา (`quotation_items`)

ตารางจัดเก็บรายการสินค้า วัสดุ บริการติดตั้ง และค่าแรงในแต่ละใบเสนอราคา (Quotation Line Items) โดยบันทึก Snapshot ราคาขายและต้นทุน ณ เวลาออกเอกสาร

| คอลัมน์ (Column) | ชนิดข้อมูล (Data Type) | Nullable | Default | คำอธิบาย |
|---|---|---|---|---|
| `id` | `uuid` | ไม่ว่าง (NO) | `gen_random_uuid()` | Primary Key รหัสรายการภายในระบบ |
| `quotation_id` | `uuid` | ไม่ว่าง (NO) | - | Foreign Key อ้างอิงไปยัง `quotations(id)` (ON DELETE CASCADE) |
| `product_id` | `uuid` | ได้ (YES) | `NULL` | Foreign Key อ้างอิงไปยัง `products(id)` ในคลัง (ON DELETE SET NULL) |
| `item_type` | `varchar(32)` | ไม่ว่าง (NO) | `'PRODUCT'` | ประเภทรายการ (`PRODUCT`, `SERVICE`, `CUSTOM`, `LABOR`) |
| `item_code` | `varchar(50)` | ได้ (YES) | `NULL` | รหัสสินค้าอ้างอิง ณ เวลาออกเอกสาร |
| `item_name` | `varchar(250)` | ไม่ว่าง (NO) | - | ชื่อรายการสินค้า วัสดุ หรือบริการ |
| `description` | `text` | ได้ (YES) | `NULL` | สเปก ขนาด สี หรือรายละเอียดจำเพาะ |
| `quantity` | `numeric(12,2)` | ไม่ว่าง (NO) | `1` | จำนวนสินค้า |
| `unit` | `varchar(32)` | ไม่ว่าง (NO) | `'ชิ้น'` | หน่วยนับ (เช่น เส้น, ชุด, ตร.ม., ชิ้น, งาน) |
| `unit_cost` | `numeric(15,2)` | ไม่ว่าง (NO) | `0` | Snapshot ราคาต้นทุนต่อหน่วย (บาท) |
| `unit_price` | `numeric(15,2)` | ไม่ว่าง (NO) | `0` | Snapshot ราคาจำหน่ายต่อหน่วย (บาท) |
| `discount_amount` | `numeric(15,2)` | ไม่ว่าง (NO) | `0` | ส่วนลดต่อรายการ (บาท) |
| `line_total` | `numeric(15,2)` | ไม่ว่าง (NO) | `0` | ยอดรวมของรายการ `(quantity * unit_price) - discount_amount` |
| `sort_order` | `integer` | ไม่ว่าง (NO) | `0` | ลำดับการแสดงผลในเอกสาร |
| `created_at` | `timestamptz` | ไม่ว่าง (NO) | `now()` | วันที่และเวลาที่สร้างข้อมูล |
| `updated_at` | `timestamptz` | ไม่ว่าง (NO) | `now()` | วันที่และเวลาที่อัปเดตล่าสุด |