import { NextRequest, NextResponse } from 'next/server';

import { getMovieApiBase } from '@/lib/api/movie';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const subPath = path.join('/');
    const search = request.nextUrl.search; // includes query string like ?type=movie&q=...

    const apiBase = getMovieApiBase();
    // Strip redundant leading v1/api/ if present
    const cleanSubPath = subPath.replace(/^v1\/api\//, '');
    const targetUrl = `${apiBase}/${cleanSubPath}${search}`;

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain, */*',
      },
      // Do not follow redirect if it's a subtitle download so we can redirect client directly
      redirect: cleanSubPath.startsWith('subtitles/download') ? 'manual' : 'follow',
      cache: 'no-store',
    });

    // If target returned 307 / 302 (like subtitle download endpoint)
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (location) {
        return NextResponse.redirect(location, 307);
      }
    }

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
    console.error('Movie API Proxy error:', error);
    return NextResponse.json(
      { error: 'Gagal terhubung ke Movie API server' },
      { status: 502 }
    );
  }
}
