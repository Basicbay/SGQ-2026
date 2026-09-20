import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const cleanName = encodeURIComponent(filename);
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:4000';

    const res = await fetch(`${backendUrl}/upload/${cleanName}`, {
      cache: 'force-cache',
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return new NextResponse('File not found', { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const cacheControl = res.headers.get('cache-control') || 'public, max-age=31536000, immutable';
    const etag = res.headers.get('etag');

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
    };
    if (etag) {
      headers['ETag'] = etag;
    }

    return new NextResponse(res.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
}
