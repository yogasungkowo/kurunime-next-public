import { NextRequest, NextResponse } from 'next/server';

function unpackDeanEdwards(packed: string): string {
  const match = packed.match(/}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
  if (!match) return '';
  const [, p, aStr, cStr, kStr] = match;
  const a = parseInt(aStr, 10);
  let c = parseInt(cStr, 10);
  const k = kStr.split('|');

  const dict: Record<string, string> = {};
  while (c--) {
    const key = c.toString(a);
    dict[key] = k[c] || key;
  }

  return p.replace(/\b\w+\b/g, (token) => {
    return dict[token] !== undefined ? dict[token] : token;
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const embedUrl = body?.embedUrl;

    if (!embedUrl || typeof embedUrl !== 'string') {
      return NextResponse.json({ success: false, error: 'embedUrl is required' }, { status: 400 });
    }

    // 1. Vidhide family (odvidhide, vidhide, earnvids, etc.)
    if (/vidhide|earnvids/i.test(embedUrl)) {
      const res = await fetch(embedUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://otakudesu.blog/',
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        return NextResponse.json({ success: false, error: 'Failed to fetch embed page' }, { status: 502 });
      }

      const html = await res.text();
      const match = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?\.split\('\|'\)\)\)/);

      if (match) {
        const unpacked = unpackDeanEdwards(match[0]);
        // Extract master.m3u8
        const m3u8Match = unpacked.match(/https?:\/\/[^\s"'<>]+\.(?:m3u8)[^\s"'<>]*/);
        if (m3u8Match) {
          const rawM3u8 = m3u8Match[0];
          // Wrap with our lightweight CORS master proxy so browser avoids CORS block
          const proxiedUrl = `/api/stream/m3u8?url=${encodeURIComponent(rawM3u8)}`;
          return NextResponse.json({
            success: true,
            streamUrl: proxiedUrl,
            rawUrl: rawM3u8,
            type: 'hls',
            provider: 'vidhide',
          });
        }
      }
    }

    // 2. Desustream / Odcloud direct MP4
    if (/desustream\.net/i.test(embedUrl)) {
      try {
        const res = await fetch(embedUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://otakudesu.blog/',
          },
          cache: 'no-store',
        });
        if (res.ok) {
          const html = await res.text();
          const mp4Match =
            html.match(/videoURL\s*=\s*["']([^"']+\.mp4[^"']*)["']/i) ||
            html.match(/<source\s+src=["']([^"']+\.mp4[^"']*)["']/i);
          if (mp4Match && mp4Match[1]) {
            return NextResponse.json({
              success: true,
              streamUrl: mp4Match[1],
              type: 'mp4',
              provider: 'desustream',
            });
          }
        }
      } catch (e) {
        console.error('Desustream extraction error:', e);
      }
    }

    // If provider is not extractable (e.g. Mega or encrypted blob)
    return NextResponse.json({
      success: false,
      message: 'Direct stream not available for this provider, fallback to sandboxed iframe',
    });
  } catch (err: any) {
    console.error('Error in /api/stream/extract:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
