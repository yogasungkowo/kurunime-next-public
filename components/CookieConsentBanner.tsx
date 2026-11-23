'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Check, X, Info } from 'lucide-react';
import { getConsentStatus, saveConsent } from '@/lib/consent';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check initial consent status
    const status = getConsentStatus();
    if (status === null) {
      // Delay slightly so it doesn't jarringly block initial render
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen to manual open requests (e.g. from footer or bookmark button when consent not granted)
  useEffect(() => {
    const handleOpen = () => {
      setIsVisible(true);
    };

    window.addEventListener('kurunime:open-consent-banner', handleOpen);
    return () => window.removeEventListener('kurunime:open-consent-banner', handleOpen);
  }, []);

  const handleAccept = () => {
    saveConsent(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    saveConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-lg z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-2xl border-2 border-neutral-700/80 bg-[#121212]/95 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.95),0_0_24px_rgba(225,29,72,0.25)] backdrop-blur-2xl ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600/20 text-rose-500 border border-rose-500/30">
              <Cookie className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Izin Cookie & Penyimpanan</span>
                <span className="rounded-md bg-rose-600/20 px-1.5 py-0.2 text-[10px] font-semibold text-rose-400 border border-rose-500/30">
                  1 Tahun
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Penyimpanan lokal untuk fitur Riwayat & Bookmark
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            aria-label="Tutup banner cookie"
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Description */}
        <p className="mt-3 text-xs text-neutral-300 leading-relaxed">
          Kami menggunakan cookie dan penyimpanan lokal untuk menyimpan data{' '}
          <strong className="text-white">Riwayat Tonton/Baca</strong> dan{' '}
          <strong className="text-rose-400">Daftar Bookmark Anime & Komik</strong> Anda selama{' '}
          <strong className="text-white">1 Tahun (365 hari)</strong> agar Anda dapat melanjutkan konten favorit kapan saja tanpa perlu login.
        </p>

        {/* Toggle Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-2 text-[11px] font-medium text-neutral-400 hover:text-neutral-200 flex items-center gap-1 underline underline-offset-2 transition-colors"
        >
          <Info className="h-3 w-3" />
          <span>{showDetails ? 'Sembunyikan rincian' : 'Rincian data yang disimpan'}</span>
        </button>

        {showDetails && (
          <div className="mt-2.5 rounded-xl bg-black/60 border border-neutral-800 p-3 text-[11px] text-neutral-400 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-neutral-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span><strong>Cookie:</strong> Token persetujuan durasi 365 hari.</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span><strong>Bookmark:</strong> Judul anime & komik favorit tersimpan di browser Anda.</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span><strong>Riwayat:</strong> Posisi episode terakhir & chapter terakhir yang dibaca.</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2 pt-2 border-t border-neutral-800/80">
          <button
            onClick={handleAccept}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-all active:scale-95"
          >
            <Check className="h-4 w-4" />
            <span>Setujui (1 Tahun)</span>
          </button>

          <button
            onClick={handleDecline}
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 text-xs font-medium text-neutral-400 hover:border-neutral-600 hover:text-white transition-all active:scale-95"
          >
            Tolak
          </button>
        </div>
      </div>
    </div>
  );
}
