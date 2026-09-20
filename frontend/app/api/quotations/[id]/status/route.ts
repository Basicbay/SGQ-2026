import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const apiUrl = process.env.BACKEND_URL ?? 'http://localhost:4000';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = (await auth()) as { accessToken?: string } | null;
    const token =
      session?.accessToken ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    const internalSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET;

    const headers: Record<string, string> = {
      'content-type': 'application/json',
    };
    if (token) headers['authorization'] = `Bearer ${token}`;
    if (internalSecret) headers['x-internal-secret'] = internalSecret;

    const body = await request.json();
    const res = await fetch(`${apiUrl}/quotations/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });

    const json = await res.json();
    if (!res.ok) {
      const msg = Array.isArray(json?.message)
        ? json.message.join(', ')
        : json?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะใบเสนอราคา';
      return NextResponse.json(
        { success: false, error: msg },
        { status: res.status },
      );
    }

    return NextResponse.json({ success: true, data: json?.data || json });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update quotation status',
      },
      { status: 500 },
    );
  }
}
