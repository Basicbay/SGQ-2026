import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjects1789800007000 implements MigrationInterface {
  name = 'CreateProjects1789800007000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        project_code varchar(32) NOT NULL UNIQUE,
        name varchar(200) NOT NULL,
        customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
        project_type varchar(50) NOT NULL DEFAULT 'CONSTRUCTION',
        location varchar(300),
        budget numeric(15, 2) DEFAULT 0,
        start_date date,
        end_date date,
        status varchar(32) NOT NULL DEFAULT 'PLANNING',
        description text,
        note text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
      CREATE INDEX IF NOT EXISTS idx_projects_project_type ON projects(project_type);
    `);

    // Seed 5 realistic example projects if table is empty
    const countResult = await queryRunner.query(`SELECT COUNT(*)::int as count FROM projects;`);
    const count = countResult[0]?.count ?? 0;

    if (count === 0) {
      // Fetch existing customer IDs
      const customers = await queryRunner.query(`
        SELECT id, customer_code FROM customers ORDER BY customer_code ASC;
      `);
      const customerMap = new Map<string, string>();
      for (const c of customers) {
        customerMap.set(c.customer_code, c.id);
      }

      const c1 = customerMap.get('CUST-2026-0001') || null;
      const c2 = customerMap.get('CUST-2026-0002') || null;
      const c3 = customerMap.get('CUST-2026-0003') || null;
      const c4 = customerMap.get('CUST-2026-0004') || null;
      const c5 = customerMap.get('CUST-2026-0005') || null;

      await queryRunner.query(
        `
        INSERT INTO projects (
          project_code, name, customer_id, project_type, location, budget, start_date, end_date, status, description, note
        ) VALUES 
        (
          'PRJ-2026-0001',
          'งานก่อสร้างอาคารสำนักงานและโชว์รูม 3 ชั้น พราวด์ ทาวเวอร์',
          $1,
          'CONSTRUCTION',
          'ถนนบางนา-ตราด กม.14 ต.บางพลีใหญ่ อ.บางพลี จ.สมุทรปราการ',
          18500000.00,
          '2026-02-01',
          '2026-11-30',
          'IN_PROGRESS',
          'ก่อสร้างโครงสร้างอาคาร คสล. 3 ชั้น พื้นที่ใช้สอย 1,200 ตร.ม. งานสถาปัตยกรรมและวิศวกรรมอาคารครบวงจร',
          'โครงการเฟส 1 วางฐานรากและเทเสร็จเรียบร้อย อยู่ระหว่างก่อสร้างชั้น 2'
        ),
        (
          'PRJ-2026-0002',
          'โครงการบ้านพักอาศัยส่วนบุคคล 2 ชั้น สไตล์โมเดิร์นคลาสสิก',
          $2,
          'RESIDENTIAL',
          'โครงการเดอะแกรนด์ ถนนพระราม 2 แขวงท่าข้าม เขตบางขุนเทียน กรุงเทพมหานคร',
          6800000.00,
          '2026-03-15',
          '2026-10-31',
          'PLANNING',
          'ก่อสร้างบ้านพักอาศัย คสล. 2 ชั้น พื้นที่ 380 ตร.ม. พร้อมสระว่ายน้ำระบบเกลือและโรงจอดรถ 3 คัน',
          'ลูกค้ายื่นขอใบอนุญาตก่อสร้างเรียบร้อยแล้ว อยู่ระหว่างสรุปรายการวัสดุตกแต่ง'
        ),
        (
          'PRJ-2026-0003',
          'งานตกแต่งภายในสำนักงานและห้องประชุมผู้บริหาร',
          $3,
          'INTERIOR',
          'อาคารเอ็กเชน ทาวเวอร์ ชั้น 18 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร',
          3200000.00,
          '2026-01-10',
          '2026-04-30',
          'IN_PROGRESS',
          'งานตกแต่งภายในสำนักงาน 450 ตร.ม. ติดตั้งผนัง Acoustic ป้องกันเสียงรบกวน ระบบแสงสว่าง Smart Lighting และเฟอร์นิเจอร์ Built-in',
          'ส่งมอบงานงวดที่ 2 เรียบร้อยแล้ว กำลังติดตั้งงานระบบปรับอากาศและกระจก'
        ),
        (
          'PRJ-2026-0004',
          'งานรีโนเวทและต่อเติมอาคารพาณิชย์ 4 คูหา',
          $4,
          'RENOVATION',
          'ซอยลาดพร้าว 71 ถนนลาดพร้าว แขวงสะพานสอง เขตวังทองหลาง กรุงเทพมหานคร',
          2450000.00,
          '2025-10-01',
          '2026-01-20',
          'COMPLETED',
          'รีโนเวทปรับปรุงโครงสร้างอาคารพาณิชย์เดิม เสริมความแข็งแรงเสา-คาน และปรับเปลี่ยนระบบไฟฟ้า ประปา พร้อมทาสีกันซึมภายนอก',
          'ส่งมอบงานเรียบร้อยแล้ว ได้รับการตรวจรับงานและออกใบรับประกันโครงสร้าง 2 ปี'
        ),
        (
          'PRJ-2026-0005',
          'งานก่อสร้างโรงงานฝ่ายผลิตและคลังสินค้าโครงสร้างเหล็ก (Warehouse)',
          $5,
          'CONSTRUCTION',
          'นิคมอุตสาหกรรมปิ่นทอง 3 ต.บ่อวิน อ.ศรีราชา จ.ชลบุรี',
          32000000.00,
          '2026-04-01',
          '2027-01-15',
          'PLANNING',
          'ก่อสร้างอาคารโรงงานและคลังสินค้าโครงสร้างเหล็กสำเร็จรูป (Pre-Engineered Building) พื้นที่ 2,400 ตร.ม. พื้นรับน้ำหนัก 5 ตัน/ตร.ม.',
          'อยู่ระหว่างขั้นตอนการจัดทำใบเสนอราคาและแบบก่อสร้างขั้นสุดท้าย (Shop Drawing)'
        );
      `,
        [c1, c2, c3, c4, c5],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS projects;`);
  }
}
