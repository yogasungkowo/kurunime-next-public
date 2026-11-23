'use client';

import React, { useEffect, useRef, useState } from 'react';
import { unmaskSiteKey } from '@/lib/turnstile-crypto';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

export default function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  theme = 'dark',
  className = '',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initTurnstile() {
      try {
        setIsLoading(true);
        setErrorState(null);

        // 1. Dapatkan challenge ter-enkripsi dari server (kunci tidak terlihat plaintext di network tab)
        const res = await fetch('/api/turnstile/challenge', {
          headers: { credentials: 'same-origin' },
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Gagal mengambil konfigurasi keamanan');
        }

        const data = await res.json();
        if (!data.required) {
          // Jika Turnstile tidak diaktifkan/tidak required di server
          if (isMounted) setIsLoading(false);
          return;
        }

        // 2. Load script Cloudflare Turnstile explicit mode jika belum ada
        if (!window.turnstile) {
          await new Promise<void>((resolve, reject) => {
            const existingScript = document.querySelector(
              'script[src*="challenges.cloudflare.com/turnstile/v0/api.js"]'
            );
            if (existingScript) {
              existingScript.addEventListener('load', () => resolve());
              existingScript.addEventListener('error', () => reject(new Error('Gagal memuat Cloudflare Turnstile')));
              return;
            }

            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Gagal mengunduh script keamanan Cloudflare Turnstile'));
            document.head.appendChild(script);
          });
        }

        if (!isMounted || !containerRef.current) return;

        // Bersihkan widget lama jika ada
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // Abaikan jika sudah dibersihkan
          }
          widgetIdRef.current = null;
        }

        // 3. Dekripsi site key sementara di memori internal client (tidak tersimpan di DOM/Global)
        const dynamicSiteKey = unmaskSiteKey(data.payload, data.seed);

        if (!dynamicSiteKey) {
          throw new Error('Kunci verifikasi tidak valid');
        }

        // 4. Render Turnstile secara explicit (tidak ada atribut data-sitekey di DOM)
        if (window.turnstile && containerRef.current) {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: dynamicSiteKey,
            theme,
            callback: (token: string) => {
              if (isMounted) {
                onSuccess(token);
              }
            },
            'error-callback': () => {
              if (isMounted) {
                setErrorState('Verifikasi keamanan bermasalah. Silakan coba lagi.');
                onError?.();
              }
            },
            'expired-callback': () => {
              if (isMounted) {
                onExpire?.();
              }
            },
          });

          widgetIdRef.current = id;
          if (isMounted) setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('[Turnstile Error]', err);
          setErrorState(
            err instanceof Error ? err.message : 'Gagal memuat proteksi keamanan'
          );
          setIsLoading(false);
          onError?.();
        }
      }
    }

    initTurnstile();

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [theme, onSuccess, onError, onExpire]);

  return (
    <div className={`relative flex flex-col items-center justify-center min-h-[65px] ${className}`}>
      {isLoading && (
        <div className="flex items-center gap-2.5 py-3 text-xs text-neutral-400 animate-pulse">
          <div className="w-4 h-4 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
          <span>Memuat sistem keamanan Cloudflare...</span>
        </div>
      )}

      {errorState && (
        <div className="text-center py-2 px-3 text-xs text-red-400 bg-red-950/40 border border-red-800/60 rounded-lg">
          {errorState}
        </div>
      )}

      {/* Kontainer Turnstile murni tanpa atribut data-sitekey */}
      <div
        ref={containerRef}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}
      />
    </div>
  );
}

