import crypto from 'crypto';
import { generateKeyByte } from './turnstile-crypto';

// Server-only environment variables
const SITE_KEY = process.env.CLOUDFLARE_TURNSTILE_SITE_KEY || '';
const SECRET_KEY = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || '';

// Cookie configuration
export const TURNSTILE_COOKIE_NAME = 'kuru_turnstile_cleared';
export const TURNSTILE_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours (1 day)

/**
 * Encrypt / Mask the site key dynamically with a random seed
 * Runs exclusively on server-side.
 */
export function getMaskedSiteKey(): { payload: string; seed: string } | null {
  if (!SITE_KEY) return null;

  const seed = crypto.randomBytes(8).toString('hex');
  const buffer = Buffer.from(SITE_KEY, 'utf-8');
  const masked = Buffer.alloc(buffer.length);

  for (let i = 0; i < buffer.length; i++) {
    const maskByte = generateKeyByte(seed, i);
    masked[i] = buffer[i] ^ maskByte;
  }

  return {
    payload: masked.toString('hex'),
    seed,
  };
}

/**
 * Verifies Turnstile token with Cloudflare API
 * Uses CLOUDFLARE_TURNSTILE_SECRET_KEY exclusively server-side.
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<{ success: boolean; errorCodes?: string[] }> {
  if (!SECRET_KEY) {
    console.warn('[Turnstile] CLOUDFLARE_TURNSTILE_SECRET_KEY is not set. Bypassing in dev mode.');
    return { success: true };
  }

  if (!token) {
    return { success: false, errorCodes: ['missing-input-response'] };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', SECRET_KEY);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await response.json();
    return {
      success: !!data.success,
      errorCodes: data['error-codes'] || [],
    };
  } catch (error) {
    console.error('[Turnstile] Verification request failed:', error);
    return { success: false, errorCodes: ['internal-error'] };
  }
}

/**
 * Creates a cryptographically signed cookie payload
 */
export function createClearanceSignature(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', SECRET_KEY || 'kurunime-fallback-secret')
    .update(timestamp)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

/**
 * Validates the clearance cookie payload and ensures it has not expired
 */
export function validateClearanceSignature(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  if (!SECRET_KEY) return true; // bypass if not configured

  try {
    const [timestampStr, providedSignature] = cookieValue.split('.');
    if (!timestampStr || !providedSignature) return false;

    const timestamp = parseInt(timestampStr, 10);
    const ageSeconds = (Date.now() - timestamp) / 1000;

    if (ageSeconds < 0 || ageSeconds > TURNSTILE_COOKIE_MAX_AGE) {
      return false; // Expired
    }

    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(timestampStr)
      .digest('hex');

    if (providedSignature.length !== expectedSignature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(providedSignature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}
