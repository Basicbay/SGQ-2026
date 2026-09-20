import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp',
  'image/x-icon',
  'image/vnd.microsoft.icon',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string' || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: 'กรุณาเลือกไฟล์รูปภาพที่ต้องการอัปโหลด' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'รูปแบบไฟล์ไม่ถูกต้อง รองรับเฉพาะ PNG, JPG, JPEG, SVG, WebP และ ICO',
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'ขนาดไฟล์เกินกำหนด (สูงสุด 5 MB)' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:4000';
    const backendRes = await fetch(`${backendUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!backendRes.ok) {
      const errText = await backendRes.text();
      let errMsg = 'อัปโหลดรูปภาพไปยังระบบไม่สำเร็จ';
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.message || errJson.error || errMsg;
      } catch {
        // ignore json parse error
      }
      return NextResponse.json(
        { success: false, error: errMsg },
        { status: backendRes.status }
      );
    }

    const json = await backendRes.json();
    const resData = json?.data || json;

    return NextResponse.json({
      success: true,
      url: resData.url,
      filename: resData.filename,
      size: resData.size,
      type: resData.mimetype,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์สำหรับอัปโหลดไฟล์',
      },
      { status: 500 }
    );
  }
}
