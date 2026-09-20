import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSystemSettings, saveSystemSettings } from '@/lib/settings';

export async function GET() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = (await auth()) as { accessToken?: string } | null;
    const token = session?.accessToken || request.headers.get('authorization')?.replace('Bearer ', '');
    const body = await request.json();
    const updated = await saveSystemSettings(body, token || undefined);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update settings' },
      { status: 500 }
    );
  }
}
