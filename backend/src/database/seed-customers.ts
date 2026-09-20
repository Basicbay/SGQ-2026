import 'reflect-metadata';
import dataSource from './data-source.js';
import { Customer, CustomerStatus, CustomerType } from './customer.entity.js';

const exampleCustomers = [
  {
    customerCode: 'CUST-2026-0001',
    name: 'บริษัท พราวด์ บิลด์ดิ้ง จำกัด',
    customerType: CustomerType.COMPANY,
    taxId: '0105558012341',
    contactName: 'คุณศุภชัย วัฒนกุล (ผู้จัดการฝ่ายจัดซื้อ)',
    phone: '02-749-5566',
    email: 'contact@proudbuilding.co.th',
    address: '88/12 หมู่ 4 ถนนบางนา-ตราด แขวงบางนาใต้ เขตบางนา กรุงเทพมหานคร 10260',
    note: 'ลูกค้ารายใหญ่ โครงการบ้านพักอาศัยและอาคารพาณิชย์ เครดิตเทอม 30 วัน',
    status: CustomerStatus.ACTIVE,
  },
  {
    customerCode: 'CUST-2026-0002',
    name: 'คุณณัฐวุฒิ วัฒนานนท์',
    customerType: CustomerType.INDIVIDUAL,
    taxId: '1100400876543',
    contactName: 'คุณณัฐวุฒิ วัฒนานนท์',
    phone: '081-823-4567',
    email: 'nattawut.w@gmail.com',
    address: '45/8 ซอยสุขุมวิท 49 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพมหานคร 10110',
    note: 'เจ้าของโครงการรีโนเวทสำนักงาน 3 ชั้น สนใจงานตกแต่งภายในและงานกระจก',
    status: CustomerStatus.ACTIVE,
  },
  {
    customerCode: 'CUST-2026-0003',
    name: 'บริษัท เอสเค อินทีเรียร์ จำกัด',
    customerType: CustomerType.COMPANY,
    taxId: '0105561098762',
    contactName: 'คุณกมลพร สิทธิโชค (หัวหน้าฝ่ายประมาณราคา)',
    phone: '02-512-8899',
    email: 'procurement@skinterior.com',
    address: '120/5 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพมหานคร 10400',
    note: 'บริษัทรับเหมาตกแต่งภายใน โชว์รูมและห้างสรรพสินค้า ส่งใบเสนอราคาเป็นประจำ',
    status: CustomerStatus.ACTIVE,
  },
  {
    customerCode: 'CUST-2026-0004',
    name: 'คุณศศิธร พัฒนกิจ',
    customerType: CustomerType.INDIVIDUAL,
    taxId: '3101700981234',
    contactName: 'คุณศศิธร พัฒนกิจ',
    phone: '089-765-4321',
    email: 'sasithorn.p@outlook.com',
    address: '221/14 หมู่บ้านพฤกษาวิลล์ ถนนรามอินทรา แขวงคันนายาว เขตคันนายาว กรุงเทพมหานคร 10230',
    note: 'งานต่อเติมห้องครัวและพื้นที่ซักล้างหลังบ้าน ต้องการใบเสนอราคาพร้อม BOQ',
    status: CustomerStatus.ACTIVE,
  },
  {
    customerCode: 'CUST-2026-0005',
    name: 'ห้างหุ้นส่วนจำกัด สยาม คอนสตรัคชั่น กรุ๊ป',
    customerType: CustomerType.COMPANY,
    taxId: '0103554005432',
    contactName: 'คุณธนากร บวรเกียรติ',
    phone: '02-987-6543',
    email: 'info@siamconstruction.co.th',
    address: '999 หมู่ 1 ถนนแจ้งวัฒนะ ตำบลคลองเกลือ อำเภอปากเกร็ด จังหวัดนนทบุรี 11120',
    note: 'ผู้รับเหมาหลักงานโครงสร้างเหล็กและงานคอนกรีต',
    status: CustomerStatus.ACTIVE,
  },
];

async function seed() {
  try {
    await dataSource.initialize();
    const repo = dataSource.getRepository(Customer);

    for (const item of exampleCustomers) {
      const existing = await repo.findOne({ where: { customerCode: item.customerCode } });
      if (!existing) {
        const customer = repo.create(item);
        await repo.save(customer);
        console.log(`Created customer: ${item.customerCode} - ${item.name}`);
      } else {
        console.log(`Customer already exists: ${item.customerCode}`);
      }
    }
    console.log('Seed completed successfully.');
  } catch (error) {
    console.error('Error seeding customers:', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void seed();
