import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const apiUrl = process.env.BACKEND_URL ?? 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${apiUrl}/dashboard/overview${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: json?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลภาพรวม',
        },
        { status: res.status },
      );
    }

    return NextResponse.json({ success: true, data: json?.data || json });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch dashboard overview',
      },
      { status: 500 },
    );
  }
}
