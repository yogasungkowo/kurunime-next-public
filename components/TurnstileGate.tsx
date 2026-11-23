'use client';

import React, { useEffect, useState } from 'react';
import TurnstileWidget from './TurnstileWidget';

export default function TurnstileGate() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkStatus() {
      try {
        const res = await fetch('/api/turnstile/status', {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.verified) {
            if (isMounted) setIsVerified(true);
            return;
          }
        }

        // Cek apakah challenge memang diwajibkan oleh server
        const challengeRes = await fetch('/api/turnstile/challenge', {
          cache: 'no-store',
        });
        if (challengeRes.ok) {
          const cData = await challengeRes.json();
          if (!cData.required) {
            if (isMounted) setIsVerified(true);
            return;
          }
        }

        if (isMounted) setIsVerified(false);
      } catch (err) {
        console.error('Check turnstile status error:', err);
        // Default allow jika terjadi network failure agar tidak menghambat user
        if (isMounted) setIsVerified(true);
      }
    }

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleVerify = async (token: string) => {
    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/turnstile/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.success) {
        setVerifySuccess(true);
        setTimeout(() => {
          setIsVerified(true);
          setIsVerifying(false);
        }, 600);
      } else {
        setErrorMessage(data.message || 'Verifikasi bot gagal, coba lagi.');
        setIsVerifying(false);
      }
    } catch (err) {
      console.error('Verify error:', err);
      setErrorMessage('Terjadi gangguan jaringan saat verifikasi.');
      setIsVerifying(false);
    }
  };

  // Jika sudah terverifikasi atau masih pengecekan awal, jangan tampilkan apa-apa
  if (isVerified === null || isVerified === true) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-neutral-900/95 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-7 text-center overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Security Shield Icon */}
        <div className="relative mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600/20 to-red-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-inner">
          {verifySuccess ? (
            <svg
              className="w-7 h-7 text-emerald-400 animate-in zoom-in-75 duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          )}
        </div>

        <h3 className="text-lg font-bold text-neutral-100 tracking-tight">
          {verifySuccess ? 'Verifikasi Berhasil!' : 'Pemeriksaan Keamanan'}
        </h3>
        <p className="mt-1.5 text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
          {verifySuccess
            ? 'Akses Anda telah dikonfirmasi. Mengalihkan ke konten...'
            : 'Situs ini dilindungi oleh Cloudflare Turnstile untuk memastikan integritas dan keamanan dari serangan bot.'}
        </p>

        {errorMessage && (
          <div className="mt-4 py-2 px-3 text-xs text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center justify-center min-h-[75px]">
          {isVerifying ? (
            <div className="flex items-center gap-2.5 text-xs text-neutral-400">
              <div className="w-4 h-4 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
              <span>Memvalidasi sertifikat keamanan...</span>
            </div>
          ) : verifySuccess ? (
            <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3.5 py-1.5 rounded-full">
              <span>Akses Terbuka</span>
            </div>
          ) : (
            <TurnstileWidget
              onSuccess={handleVerify}
              onError={() => setErrorMessage('Gagal menyelesaikan tantangan keamanan.')}
            />
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
          <span>Protected by</span>
          <span className="font-semibold text-neutral-400">Cloudflare</span>
          <span className="inline-block w-1 h-1 rounded-full bg-neutral-600 mx-0.5" />
          <span>Kurunime Security</span>
        </div>
      </div>
    </div>
  );
}

