'use client';

const CONSENT_COOKIE_KEY = 'kurunime_cookie_consent';
const CONSENT_STORAGE_KEY = 'kurunime_consent_status_v1';
const CONSENT_EXPIRY_DAYS = 365; // 1 Tahun (365 Hari)

export type ConsentStatus = 'accepted' | 'declined' | null;

/**
 * Get cookie value by name in browser
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Set cookie with expiration days
 */
function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

/**
 * Remove a cookie
 */
function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
}

/**
 * Check whether user has accepted or declined cookie consent
 * Returns: 'accepted' | 'declined' | null (null means not decided yet)
 */
export function getConsentStatus(): ConsentStatus {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Check Cookie first
    const cookieVal = getCookie(CONSENT_COOKIE_KEY);
    if (cookieVal === 'accepted' || cookieVal === 'declined') {
      return cookieVal;
    }

    // 2. Check localStorage fallback
    const storageVal = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (storageVal === 'accepted' || storageVal === 'declined') {
      return storageVal;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if storage operations (history & bookmark) are permitted
 */
export function canUseStorage(): boolean {
  return getConsentStatus() === 'accepted';
}

/**
 * Save user cookie consent decision (valid for 365 days / 1 year)
 */
export function saveConsent(accepted: boolean) {
  if (typeof window === 'undefined') return;

  const status: ConsentStatus = accepted ? 'accepted' : 'declined';

  try {
    // Write cookie with 365 days duration
    setCookie(CONSENT_COOKIE_KEY, status, CONSENT_EXPIRY_DAYS);
    // Write localStorage
    localStorage.setItem(CONSENT_STORAGE_KEY, status);

    // Notify all active tabs and components
    window.dispatchEvent(
      new CustomEvent('kurunime:consent-changed', {
        detail: { status, accepted },
      })
    );
  } catch (e) {
    console.error('Failed to save consent', e);
  }
}

/**
 * Reset consent decision so banner reappears
 */
export function resetConsent() {
  if (typeof window === 'undefined') return;

  try {
    deleteCookie(CONSENT_COOKIE_KEY);
    localStorage.removeItem(CONSENT_STORAGE_KEY);

    window.dispatchEvent(
      new CustomEvent('kurunime:consent-changed', {
        detail: { status: null, accepted: false },
      })
    );
  } catch (e) {
    console.error('Failed to reset consent', e);
  }
}

/**
 * Open the cookie consent modal on demand
 */
export function openConsentSettings() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('kurunime:open-consent-banner'));
}
