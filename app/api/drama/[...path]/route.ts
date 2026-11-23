import { NextRequest, NextResponse } from 'next/server';
import { getDramaApiBase } from '@/lib/api/drama';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const subPath = path.join('/');
    const search = request.nextUrl.search;

    const apiBase = getDramaApiBase();
    // Strip redundant leading api/ if present
    const cleanSubPath = subPath.replace(/^api\//, '');
    const targetUrl = `${apiBase}/api/${cleanSubPath}${search}`;

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain, */*',
      },
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type') || 'application/json';
    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Drama API Proxy error:', error);
    return NextResponse.json(
      { error: 'Gagal terhubung ke Drama API server' },
      { status: 502 }
    );
  }
}

