import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url');
    if (!url) {
      return new NextResponse('URL parameter is required', { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://odvidhide.com/',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return new NextResponse('Failed to fetch master playlist from CDN', { status: res.status });
    }

    const masterText = await res.text();

    // Rewrite relative sub-playlist and iframe URIs to absolute URLs
    const lines = masterText.split('\n');
    const rewritten = lines
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return line;

        if (trimmed.startsWith('#')) {
          if (trimmed.startsWith('#EXT-X-I-FRAME-STREAM-INF') && trimmed.includes('URI="')) {
            return trimmed.replace(/URI="([^"]+)"/, (_m, uri) => `URI="${new URL(uri, url).href}"`);
          }
          return line;
        }

        // Convert relative playlist lines (e.g. index-v1-a1.m3u8?...) to absolute CDN URLs
        try {
          return new URL(trimmed, url).href;
        } catch {
          return line;
        }
      })
      .join('\n');

    return new NextResponse(rewritten, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('Error in /api/stream/m3u8:', err);
    return new NextResponse('Server Error', { status: 500 });
  }
}
