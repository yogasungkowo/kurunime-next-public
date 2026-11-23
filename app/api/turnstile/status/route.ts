import { NextRequest, NextResponse } from 'next/server';
import { validateClearanceSignature, TURNSTILE_COOKIE_NAME } from '@/lib/turnstile';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get(TURNSTILE_COOKIE_NAME)?.value;
    const isCleared = validateClearanceSignature(cookie);

    return NextResponse.json({
      verified: isCleared,
    });
  } catch {
    return NextResponse.json({ verified: false });
  }
}

