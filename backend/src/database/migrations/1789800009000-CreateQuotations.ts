import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuotations1789800009000 implements MigrationInterface {
  name = 'CreateQuotations1789800009000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS quotations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_number VARCHAR(32) NOT NULL UNIQUE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
        approved_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
        issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
        valid_until DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
        valid_days INTEGER NOT NULL DEFAULT 30,
        customer_name VARCHAR(200) NOT NULL,
        customer_address TEXT,
        customer_phone VARCHAR(40),
        customer_tax_id VARCHAR(32),
        customer_contact VARCHAR(160),
        project_name VARCHAR(200),
        subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
        discount_type VARCHAR(20) NOT NULL DEFAULT 'AMOUNT',
        discount_rate NUMERIC(8,2) NOT NULL DEFAULT 0,
        discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
        total_after_discount NUMERIC(15,2) NOT NULL DEFAULT 0,
        vat_rate NUMERIC(5,2) NOT NULL DEFAULT 7.00,
        vat_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
        grand_total NUMERIC(15,2) NOT NULL DEFAULT 0,
        total_cost NUMERIC(15,2) NOT NULL DEFAULT 0,
        estimated_profit NUMERIC(15,2) NOT NULL DEFAULT 0,
        profit_margin_percent NUMERIC(8,2) NOT NULL DEFAULT 0,
        payment_terms TEXT,
        delivery_terms TEXT,
        warranty_terms TEXT,
        notes TEXT,
        rejection_reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS quotation_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE SET NULL,
        item_type VARCHAR(32) NOT NULL DEFAULT 'PRODUCT',
        item_code VARCHAR(50),
        item_name VARCHAR(250) NOT NULL,
        description TEXT,
        quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
        unit VARCHAR(32) NOT NULL DEFAULT 'ชิ้น',
        unit_cost NUMERIC(15,2) NOT NULL DEFAULT 0,
        unit_price NUMERIC(15,2) NOT NULL DEFAULT 0,
        discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
        line_total NUMERIC(15,2) NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number);
      CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id);
      CREATE INDEX IF NOT EXISTS idx_quotations_project_id ON quotations(project_id);
      CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
      CREATE INDEX IF NOT EXISTS idx_quotations_issue_date ON quotations(issue_date);
      CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items(quotation_id);
      CREATE INDEX IF NOT EXISTS idx_quotation_items_product_id ON quotation_items(product_id);
    `);

    // Seed realistic initial quotations for demonstration & testing
    await queryRunner.query(`
      DO $$
      DECLARE
        v_cust1_id UUID;
        v_cust2_id UUID;
        v_cust3_id UUID;
        v_prj1_id UUID;
        v_prj2_id UUID;
        v_prj3_id UUID;
        v_user_sales UUID;
        v_user_admin UUID;
        v_prod1_id UUID;
        v_prod2_id UUID;
        v_prod3_id UUID;
        v_prod5_id UUID;
        v_q1_id UUID := gen_random_uuid();
        v_q2_id UUID := gen_random_uuid();
        v_q3_id UUID := gen_random_uuid();
        v_q4_id UUID := gen_random_uuid();
      BEGIN
        SELECT id INTO v_cust1_id FROM customers WHERE customer_code = 'CUST-2026-0001' LIMIT 1;
        SELECT id INTO v_cust2_id FROM customers WHERE customer_code = 'CUST-2026-0002' LIMIT 1;
        SELECT id INTO v_cust3_id FROM customers WHERE customer_code = 'CUST-2026-0003' LIMIT 1;

        SELECT id INTO v_prj1_id FROM projects WHERE project_code = 'PRJ-2026-0001' LIMIT 1;
        SELECT id INTO v_prj2_id FROM projects WHERE project_code = 'PRJ-2026-0002' LIMIT 1;
        SELECT id INTO v_prj3_id FROM projects WHERE project_code = 'PRJ-2026-0003' LIMIT 1;

        SELECT id INTO v_user_sales FROM users WHERE role = 'SALES' LIMIT 1;
        SELECT id INTO v_user_admin FROM users WHERE role IN ('SUPER_ADMIN', 'ADMIN') LIMIT 1;

        SELECT id INTO v_prod1_id FROM products WHERE product_code = 'PRD-2026-0001' LIMIT 1;
        SELECT id INTO v_prod2_id FROM products WHERE product_code = 'PRD-2026-0002' LIMIT 1;
        SELECT id INTO v_prod3_id FROM products WHERE product_code = 'PRD-2026-0003' LIMIT 1;
        SELECT id INTO v_prod5_id FROM products WHERE product_code = 'PRD-2026-0005' LIMIT 1;

        -- Quotation 1: APPROVED
        IF v_cust1_id IS NOT NULL THEN
          INSERT INTO quotations (
            id, quotation_number, customer_id, project_id, seller_id, approved_by_id,
            status, issue_date, valid_until, valid_days,
            customer_name, customer_address, customer_phone, customer_tax_id, customer_contact,
            project_name,
            subtotal, discount_type, discount_rate, discount_amount, total_after_discount,
            vat_rate, vat_amount, grand_total, total_cost, estimated_profit, profit_margin_percent,
            payment_terms, delivery_terms, warranty_terms, notes
          ) VALUES (
            v_q1_id, 'QT-2026-0001', v_cust1_id, v_prj1_id, v_user_sales, v_user_admin,
            'APPROVED', CURRENT_DATE - 5, CURRENT_DATE + 25, 30,
            'บริษัท พราวด์ บิลด์ดิ้ง จำกัด', '88/12 ถนนสุขุมวิท 21 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110', '02-123-4567', '0105565012345', 'คุณเกียรติศักดิ์ เจริญพร',
            'งานก่อสร้างอาคารสำนักงานและโชว์รูม 3 ชั้น พราวด์ ทาวเวอร์',
            110000.00, 'AMOUNT', 0, 5000.00, 105000.00,
            7.00, 7350.00, 112350.00, 77000.00, 28000.00, 26.67,
            'มัดจำ 40% เมื่อลงนามสัญญา, 40% เมื่อส่งมอบโครงสร้างอลูมิเนียม, 20% หลังติดตั้งและตรวจรับงาน',
            'จัดส่งและติดตั้งภายใน 21 วันทำการหลังได้รับเงินมัดจำ',
            'รับประกันผลงานติดตั้ง 1 ปี รับประกันคุณภาพอุปกรณ์และกระจกตามมาตรฐานโรงงานผู้ผลิต',
            'ราคานี้รวมค่าติดตั้ง นั่งร้าน และอุปกรณ์เซฟตี้เรียบร้อยแล้ว'
          ) ON CONFLICT (quotation_number) DO NOTHING;

          -- Items for QT-2026-0001
          INSERT INTO quotation_items (
            quotation_id, product_id, item_type, item_code, item_name, description,
            quantity, unit, unit_cost, unit_price, discount_amount, line_total, sort_order
          ) VALUES
          (v_q1_id, v_prod2_id, 'PRODUCT', 'PRD-2026-0002', 'ชุดกรอบบานเลื่อนยูโรโกรฟ สลิมพรีเมียม (Euro Groove Slim)', 'อลูมิเนียมเกรด 6063-T5 พร้อมระบบระบายน้ำและซีลยาง EPDM', 20, 'ชุด', 2850.00, 3900.00, 0, 78000.00, 1),
          (v_q1_id, v_prod3_id, 'PRODUCT', 'PRD-2026-0003', 'กระจกนิรภัยเทมเปอร์ใสพิเศษ หนา 10 มม. (Tempered Glass)', 'เจียรขอบเรียบร้อยพร้อมซีลซิลิโคนโครงสร้าง', 20, 'ตร.ม.', 750.00, 1150.00, 0, 23000.00, 2),
          (v_q1_id, NULL, 'SERVICE', 'SRV-INST-01', 'บริการติดตั้งชุดประตูหน้าต่างอลูมิเนียมและกระจก', 'รวมค่าแรงช่างผู้ชำนาญการและอุปกรณ์ยึดจับมาตรฐานวิศวกรรม', 1, 'งาน', 5000.00, 9000.00, 0, 9000.00, 3)
          ON CONFLICT DO NOTHING;
        END IF;

        -- Quotation 2: SENT
        IF v_cust2_id IS NOT NULL THEN
          INSERT INTO quotations (
            id, quotation_number, customer_id, project_id, seller_id, approved_by_id,
            status, issue_date, valid_until, valid_days,
            customer_name, customer_address, customer_phone, customer_tax_id, customer_contact,
            project_name,
            subtotal, discount_type, discount_rate, discount_amount, total_after_discount,
            vat_rate, vat_amount, grand_total, total_cost, estimated_profit, profit_margin_percent,
            payment_terms, delivery_terms, warranty_terms, notes
          ) VALUES (
            v_q2_id, 'QT-2026-0002', v_cust2_id, v_prj2_id, v_user_sales, v_user_admin,
            'SENT', CURRENT_DATE - 3, CURRENT_DATE + 27, 30,
            'คุณณัฐวุฒิ วัฒนานนท์', '142 หมู่บ้านพฤกษาวิลเลจ ถนนราชพฤกษ์ ตำบลบางกร่าง อำเภอเมือง นนทบุรี 11000', '081-987-6543', '1100500293812', 'คุณณัฐวุฒิ วัฒนานนท์',
            'โครงการบ้านพักอาศัยส่วนบุคคล 2 ชั้น สไตล์โมเดิร์นคลาสสิก',
            48500.00, 'PERCENT', 5.00, 2425.00, 46075.00,
            7.00, 3225.25, 49300.25, 33200.00, 12875.00, 27.94,
            'ชำระมัดจำ 50% เมื่องวดแรก และ 50% เมื่องานแล้วเสร็จตรวจรับ',
            'ส่งมอบภายใน 14 วัน',
            'รับประกัน 1 ปีเต็ม',
            'จัดส่งสินค้าพร้อมติดตั้งที่หน้างานนนทบุรี'
          ) ON CONFLICT (quotation_number) DO NOTHING;

          -- Items for QT-2026-0002
          INSERT INTO quotation_items (
            quotation_id, product_id, item_type, item_code, item_name, description,
            quantity, unit, unit_cost, unit_price, discount_amount, line_total, sort_order
          ) VALUES
          (v_q2_id, v_prod1_id, 'PRODUCT', 'PRD-2026-0001', 'อลูมิเนียมกล่อง 2x1 นิ้ว หนา 1.2 มม. ชุบอโนไดซ์', 'สีอลูมิเนียมธรรมชาติ ความยาว 6 เมตร', 30, 'เส้น', 320.00, 450.00, 0, 13500.00, 1),
          (v_q2_id, v_prod2_id, 'PRODUCT', 'PRD-2026-0002', 'ชุดกรอบบานเลื่อนยูโรโกรฟ สลิมพรีเมียม (Euro Groove Slim)', 'สำหรับประตูระเบียงชั้น 2', 5, 'ชุด', 2850.00, 3900.00, 0, 19500.00, 2),
          (v_q2_id, v_prod5_id, 'PRODUCT', 'PRD-2026-0005', 'ชุดมือจับก้านโยกมัลติพอยท์ล็อค สำหรับประตูบานเลื่อน', 'สีดำด้านพร้อมกุญแจคอมพิวเตอร์', 10, 'ชุด', 620.00, 950.00, 0, 9500.00, 3),
          (v_q2_id, NULL, 'LABOR', 'LBR-INST-02', 'ค่าบริการติดตั้งและซีลกันน้ำหน้างาน', 'งานติดตั้งหน้างาน 2 วัน', 1, 'งาน', 4000.00, 6000.00, 0, 6000.00, 4)
          ON CONFLICT DO NOTHING;
        END IF;

        -- Quotation 3: ACCEPTED
        IF v_cust3_id IS NOT NULL THEN
          INSERT INTO quotations (
            id, quotation_number, customer_id, project_id, seller_id, approved_by_id,
            status, issue_date, valid_until, valid_days,
            customer_name, customer_address, customer_phone, customer_tax_id, customer_contact,
            project_name,
            subtotal, discount_type, discount_rate, discount_amount, total_after_discount,
            vat_rate, vat_amount, grand_total, total_cost, estimated_profit, profit_margin_percent,
            payment_terms, delivery_terms, warranty_terms, notes
          ) VALUES (
            v_q3_id, 'QT-2026-0003', v_cust3_id, v_prj3_id, v_user_sales, v_user_admin,
            'ACCEPTED', CURRENT_DATE - 10, CURRENT_DATE + 20, 30,
            'บริษัท เอสเค อินทีเรียร์ จำกัด', '55/9 ซอยทองหล่อ 13 ถนนสุขุมวิท 55 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110', '02-712-8901', '0105562098765', 'คุณสุรชัย วงศ์สว่าง',
            'งานตกแต่งภายในสำนักงานและห้องประชุมผู้บริหาร',
            69000.00, 'AMOUNT', 0, 0.00, 69000.00,
            7.00, 4830.00, 73830.00, 45000.00, 24000.00, 34.78,
            'เครดิต 30 วันหลังวางบิลและตรวจรับงาน',
            'จัดส่งภายใน 10 วันทำการ',
            'รับประกันอุปกรณ์ 1 ปี',
            'ลูกค้าเซ็นอนุมัติสั่งทำเรียบร้อย'
          ) ON CONFLICT (quotation_number) DO NOTHING;

          -- Items for QT-2026-0003
          INSERT INTO quotation_items (
            quotation_id, product_id, item_type, item_code, item_name, description,
            quantity, unit, unit_cost, unit_price, discount_amount, line_total, sort_order
          ) VALUES
          (v_q3_id, v_prod3_id, 'PRODUCT', 'PRD-2026-0003', 'กระจกนิรภัยเทมเปอร์ใสพิเศษ หนา 10 มม. (Tempered Glass)', 'สำหรับผนังกระจกกั้นห้องประชุมผู้บริหาร', 40, 'ตร.ม.', 750.00, 1150.00, 0, 46000.00, 1),
          (v_q3_id, NULL, 'CUSTOM', 'CUST-ALUM-01', 'โครงอลูมิเนียมพ่นสีพิเศษ Black Sand Finish', 'สีพ่นอบแห้งพิเศษตามแบบสถาปนิก', 1, 'ชุด', 15000.00, 23000.00, 0, 23000.00, 2)
          ON CONFLICT DO NOTHING;
        END IF;

        -- Quotation 4: DRAFT
        IF v_cust1_id IS NOT NULL THEN
          INSERT INTO quotations (
            id, quotation_number, customer_id, project_id, seller_id, approved_by_id,
            status, issue_date, valid_until, valid_days,
            customer_name, customer_address, customer_phone, customer_tax_id, customer_contact,
            project_name,
            subtotal, discount_type, discount_rate, discount_amount, total_after_discount,
            vat_rate, vat_amount, grand_total, total_cost, estimated_profit, profit_margin_percent,
            payment_terms, delivery_terms, warranty_terms, notes
          ) VALUES (
            v_q4_id, 'QT-2026-0004', v_cust1_id, v_prj1_id, v_user_sales, NULL,
            'DRAFT', CURRENT_DATE, CURRENT_DATE + 30, 30,
            'บริษัท พราวด์ บิลด์ดิ้ง จำกัด', '88/12 ถนนสุขุมวิท 21 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110', '02-123-4567', '0105565012345', 'คุณเกียรติศักดิ์ เจริญพร',
            'งานก่อสร้างอาคารสำนักงานและโชว์รูม 3 ชั้น พราวด์ ทาวเวอร์',
            35100.00, 'AMOUNT', 0, 1000.00, 34100.00,
            7.00, 2387.00, 36487.00, 24340.00, 9760.00, 28.62,
            'มัดจำ 50% และ 50% เมื่องานติดตั้งแล้วเสร็จ',
            'จัดส่งภายใน 7-14 วัน',
            'รับประกัน 1 ปี',
            'แบบร่างเพิ่มเติมส่วนงานกันสาดกระจกลามิเนต'
          ) ON CONFLICT (quotation_number) DO NOTHING;

          -- Items for QT-2026-0004
          INSERT INTO quotation_items (
            quotation_id, product_id, item_type, item_code, item_name, description,
            quantity, unit, unit_cost, unit_price, discount_amount, line_total, sort_order
          ) VALUES
          (v_q4_id, v_prod1_id, 'PRODUCT', 'PRD-2026-0001', 'อลูมิเนียมกล่อง 2x1 นิ้ว หนา 1.2 มม. ชุบอโนไดซ์', 'สำหรับโครงยึดกันสาด', 18, 'เส้น', 320.00, 450.00, 0, 8100.00, 1),
          (v_q4_id, NULL, 'PRODUCT', 'PRD-2026-0004', 'กระจกลามิเนตเขียวตัดแสง 6+6 มม. ฟิล์ม PVB 0.76 (Laminated Glass)', 'กระจกกันสาดนิรภัยตัดแสง', 10, 'ตร.ม.', 1450.00, 2100.00, 0, 21000.00, 2),
          (v_q4_id, NULL, 'LABOR', 'LBR-INST-03', 'ค่าบริการติดตั้งและซีลโครงกันสาด', 'ค่าแรงช่างพร้อมอุปกรณ์', 1, 'งาน', 4500.00, 6000.00, 0, 6000.00, 3)
          ON CONFLICT DO NOTHING;
        END IF;

      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS quotation_items;`);
    await queryRunner.query(`DROP TABLE IF EXISTS quotations;`);
  }
}
