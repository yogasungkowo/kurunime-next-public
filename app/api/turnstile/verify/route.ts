import { NextRequest, NextResponse } from 'next/server';
import {
  verifyTurnstileToken,
  createClearanceSignature,
  TURNSTILE_COOKIE_NAME,
  TURNSTILE_COOKIE_MAX_AGE,
} from '@/lib/turnstile';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body?.token;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token turnstile tidak disertakan' },
        { status: 400 }
      );
    }

    const clientIp =
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      undefined;

    const result = await verifyTurnstileToken(token, clientIp);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validasi Cloudflare Turnstile gagal',
          errors: result.errorCodes,
        },
        { status: 403 }
      );
    }

    // Buat clearance signature cookie HTTP-only
    const cookieValue = createClearanceSignature();
    const isProduction = process.env.NODE_ENV === 'production';

    const response = NextResponse.json({
      success: true,
      message: 'Verifikasi keamanan berhasil',
    });

    response.cookies.set({
      name: TURNSTILE_COOKIE_NAME,
      value: cookieValue,
      maxAge: TURNSTILE_COOKIE_MAX_AGE,
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan internal pada verifikasi' },
      { status: 500 }
    );
  }
}

