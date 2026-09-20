import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProducts1789800008000 implements MigrationInterface {
  name = 'CreateProducts1789800008000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS products (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        product_code varchar(32) NOT NULL UNIQUE,
        name varchar(200) NOT NULL,
        category varchar(50) NOT NULL DEFAULT 'aluminium-profiles',
        brand varchar(100),
        color varchar(50),
        unit varchar(32) NOT NULL DEFAULT 'ชิ้น',
        cost_price numeric(15, 2) NOT NULL DEFAULT 0,
        selling_price numeric(15, 2) NOT NULL DEFAULT 0,
        stock_quantity numeric(12, 2) NOT NULL DEFAULT 0,
        stock_status varchar(32) NOT NULL DEFAULT 'IN_STOCK',
        status varchar(32) NOT NULL DEFAULT 'ACTIVE',
        image_url varchar(500),
        description text,
        note text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
      CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);
      CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    `);

    // Seed realistic catalog products if empty
    const countResult = await queryRunner.query(
      `SELECT COUNT(*)::int as count FROM products;`,
    );
    const count = countResult[0]?.count ?? 0;

    if (count === 0) {
      await queryRunner.query(`
        INSERT INTO products (
          product_code, name, category, brand, color, unit, cost_price, selling_price, stock_quantity, stock_status, status, description, note
        ) VALUES
        (
          'PRD-2026-0001',
          'อลูมิเนียมกล่อง 2x1 นิ้ว หนา 1.2 มม. ชุบอโนไดซ์',
          'aluminium-profiles',
          'ORM',
          'อลูมิเนียมธรรมชาติ',
          'เส้น',
          320.00,
          450.00,
          150.00,
          'IN_STOCK',
          'ACTIVE',
          'อลูมิเนียมกล่องคุณภาพสูง ความยาวมาตรฐาน 6.0 เมตร ชุบผิวอโนไดซ์ป้องกันสนิมและการกัดกร่อน เหมาะสำหรับงานโครงสร้างประตูหน้าต่าง',
          'สินค้าขายดี สต็อกพร้อมส่งประจำสัปดาห์'
        ),
        (
          'PRD-2026-0002',
          'ชุดกรอบบานเลื่อนยูโรโกรฟ สลิมพรีเมียม (Euro Groove Slim)',
          'aluminium-profiles',
          'Fuji Eurotech',
          'ดำพาวเดอร์โค้ท',
          'ชุด',
          2850.00,
          3900.00,
          45.00,
          'IN_STOCK',
          'ACTIVE',
          'ระบบกรอบบานเลื่อนอลูมิเนียมมาตรฐานยูโร ร่อง Euro Groove รองรับระบบ Multi-point lock ระบบกันน้ำสองชั้น ทนแรงลมได้สูง',
          'สินค้านำเข้าเกรดสถาปัตยกรรมระดับพรีเมียม'
        ),
        (
          'PRD-2026-0003',
          'กระจกนิรภัยเทมเปอร์ใสพิเศษ หนา 10 มม. (Tempered Glass)',
          'architectural-glass',
          'SGQ Glass',
          'ใส',
          'ตร.ม.',
          750.00,
          1150.00,
          80.00,
          'IN_STOCK',
          'ACTIVE',
          'กระจกเทมเปอร์ผ่านการอบความร้อนสูง มีความแข็งแกร่งกว่ากระจกธรรมดา 4-5 เท่า แตกเป็นเม็ดข้าวโพดไม่คม ปลอดภัยตามมาตรฐาน มอก.',
          'สั่งตัดและเจียรขอบตามขนาดจริงหน้างาน'
        ),
        (
          'PRD-2026-0004',
          'กระจกลามิเนตเขียวตัดแสง 6+6 มม. ฟิล์ม PVB 0.76 (Laminated Glass)',
          'architectural-glass',
          'SGQ Glass',
          'เขียวตัดแสง',
          'ตร.ม.',
          1450.00,
          2100.00,
          30.00,
          'IN_STOCK',
          'ACTIVE',
          'กระจกลามิเนตสองชั้นประกบด้วยฟิล์ม PVB คุณภาพสูง กันเสียงรบกวน ป้องกันรังสี UV 99% และป้องกันการโจรกรรม',
          'เหมาะสำหรับผนังกระจกอาคารสูงและกระจกกันตก'
        ),
        (
          'PRD-2026-0005',
          'ชุดมือจับก้านโยกมัลติพอยท์ล็อค สำหรับประตูบานเลื่อน',
          'hardware-accessories',
          'CMECH',
          'ดำด้าน',
          'ชุด',
          620.00,
          950.00,
          60.00,
          'IN_STOCK',
          'ACTIVE',
          'ชุดมือจับก้านโยกมาตรฐานเยอรมัน ระบบล็อคหลายจุด Multi-point lock แข็งแรง ทนทาน เคลือบสีระบบ PVD ไม่ลอกล่อน',
          'รับประกันการใช้งาน 50,000 รอบเปิด-ปิด'
        ),
        (
          'PRD-2026-0006',
          'บานพับสแตนเลส SUS 304 ปรับ 3 ทิศทาง สำหรับประตูอลูมิเนียม',
          'hardware-accessories',
          'KINLONG',
          'สแตนเลสปัดเงา',
          'ตัว',
          280.00,
          420.00,
          120.00,
          'IN_STOCK',
          'ACTIVE',
          'บานพับประตูเกรด 304 ทนไอเกลือทะเลและกรดด่าง รับน้ำหนักบานได้สูงสุด 80 กก./คู่ สามารถปรับระดับได้ 3 มิติ',
          'ใช้งานกับกรอบอลูมิเนียมระบบ Euro Profile'
        ),
        (
          'PRD-2026-0007',
          'กลอนประตูดิจิทัล Smart Lock สแกนนิ้วมือ รหัส การ์ด และกุญแจกล',
          'digital-door-locks',
          'ELH',
          'ดำ/เงิน',
          'ชุด',
          4200.00,
          6500.00,
          18.00,
          'LOW_STOCK',
          'ACTIVE',
          'กลอนประตูดิจิทัลทรงสลิมสำหรับประตูอลูมิเนียม รองรับบลูทูธและแอปพลิเคชันมือถือ ปลดล็อคได้ 5 ระบบ พร้อมแจ้งเตือนงัดแงะ',
          'มีบริการติดตั้งพร้อมเซ็ตระบบแอพพลิเคชัน'
        ),
        (
          'PRD-2026-0008',
          'โครงหลังคาโรงจอดรถอลูมิเนียมสั่งพิเศษ รุ่น Modern Cantilever',
          'custom-aluminium',
          'SGQ Custom',
          'เทากราไฟต์',
          'ชุด',
          45000.00,
          68000.00,
          5.00,
          'MADE_TO_ORDER',
          'ACTIVE',
          'ชุดโครงสร้างโรงจอดรถอลูมิเนียมทรงยื่น ไร้เสากลาง รองรับรถ 2 คัน แข็งแรง ไร้สนิมตลอดอายุการใช้งาน แผ่นหลังคา Polycarbonate ตัน',
          'สั่งผลิตตามขนาดพื้นที่ 14-21 วันทำการ'
        ),
        (
          'PRD-2026-0009',
          'บันไดอลูมิเนียมทรง A สำหรับงานช่าง 6 ฟุต (1.8 ม.)',
          'additional-products',
          'Barco',
          'อลูมิเนียมธรรมชาติ',
          'ตัว',
          1150.00,
          1650.00,
          25.00,
          'IN_STOCK',
          'ACTIVE',
          'บันไดอลูมิเนียมเกรดช่างมืออาชีพ ขาตั้งมียางกันลื่น รับน้ำหนักได้ 150 กก. ขั้นเหยียบมีร่องกันลื่น พับเก็บสะดวก',
          'อุปกรณ์เสริมสำหรับทีมงานติดตั้งและช่างทั่วไป'
        ),
        (
          'PRD-2026-0010',
          'บริการติดตั้งประตู-หน้าต่างอลูมิเนียมพร้อมกระจก (มาตรฐาน SGQ)',
          'installation-service',
          'SGQ Service',
          null,
          'ตร.ม.',
          350.00,
          550.00,
          999.00,
          'IN_STOCK',
          'ACTIVE',
          'บริการติดตั้งโดยทีมช่างชำนาญการมาตรฐาน SGQ ยิงซิลิโคนกันน้ำ ซีลยาง EPDM ตรวจเช็คระดับน้ำ และทดสอบระบบการเปิด-ปิดครบถ้วน',
          'รับประกันงานติดตั้ง 1 ปีเต็ม'
        );
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS products;`);
  }
}
