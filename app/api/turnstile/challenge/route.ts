import { NextResponse } from 'next/server';
import { getMaskedSiteKey } from '@/lib/turnstile';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const masked = getMaskedSiteKey();
    if (!masked) {
      return NextResponse.json({
        required: false,
      });
    }

    return NextResponse.json({
      required: true,
      payload: masked.payload,
      seed: masked.seed,
    });
  } catch (err) {
    console.error('Error generating challenge:', err);
    return NextResponse.json({ required: false }, { status: 500 });
  }
}

