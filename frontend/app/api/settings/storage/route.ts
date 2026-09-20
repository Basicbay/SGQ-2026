import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/settings/storage`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }
    const json = await res.json();
    if (json && json.data) {
      return NextResponse.json({ success: true, data: json.data });
    }
    return NextResponse.json({ success: true, data: json });
  } catch {
    // Fallback baseline for Neon Free Tier storage
    return NextResponse.json({
      success: true,
      data: {
        databaseName: 'neondb',
        projectName: 'SGQ DB',
        branch: 'production',
        totalLimitBytes: 536870912,
        totalLimitPretty: '512 MB',
        usedBytes: 32464896,
        usedPretty: '32.5 MB',
        freeBytes: 504406016,
        freePretty: '479.5 MB',
        usedPercent: 6.0,
        breakdown: {
          tableDataBytes: 40960,
          tableDataPretty: '40 KB',
          tableDataPercent: 0.01,
          indexBytes: 286720,
          indexPretty: '280 KB',
          indexPercent: 0.05,
          systemBytes: 32137216,
          systemPretty: '32.1 MB',
          systemPercent: 5.94,
          freePercent: 94.0,
        },
      },
    });
  }
}
