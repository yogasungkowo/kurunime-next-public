'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Heart, X, Coffee, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

const COOKIE_NAME = 'kurunime_saweria_popup';
const STORAGE_KEY = 'kurunime_saweria_closed_at';
const ONE_DAY_SECONDS = 86400; // 24 jam (1 hari)
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface SaweriaData {
  username?: string;
  text1?: string;
  text2?: string;
}

export default function SaweriaModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [saweriaInfo, setSaweriaInfo] = useState<SaweriaData>({
    username: 'kurumitokisaki',
    text1: 'Kurunime Saweria',
    text2: 'DONASIKAN UNTUK MENDUKUNG KURUNIME',
  });

  // Fetch dynamic metadata from server-side proxy
  useEffect(() => {
    fetch('/api/saweria')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.username) {
          setSaweriaInfo(data);
        }
      })
      .catch(() => {
        // fallback already set in default state
      });
  }, []);

  useEffect(() => {
    // Only auto-show on the home page (halaman depan)
    if (pathname !== '/') return;

    // Check if dismissed in cookie
    const hasCookie =
      typeof document !== 'undefined' &&
      document.cookie.split(';').some((item) => item.trim().startsWith(`${COOKIE_NAME}=`));

    // Check if dismissed in localStorage fallback
    let hasStorage = false;
    try {
      const storedTime = localStorage.getItem(STORAGE_KEY);
      if (storedTime) {
        const timePassed = Date.now() - parseInt(storedTime, 10);
        if (timePassed < ONE_DAY_MS) {
          hasStorage = true;
        }
      }
    } catch {
      // ignore storage error
    }

    // Only show if not dismissed in the last 24 hours
    if (!hasCookie && !hasStorage) {
      // Delay slightly (1.5 seconds) so initial page render feels fluid
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Listen for manual open trigger (e.g. from footer)
  useEffect(() => {
    const handleManualOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('kurunime:open-saweria-modal', handleManualOpen);
    return () => window.removeEventListener('kurunime:open-saweria-modal', handleManualOpen);
  }, []);

  const handleClose = () => {
    // Save cookie with 1-day expiration (86400 seconds)
    if (typeof document !== 'undefined') {
      document.cookie = `${COOKIE_NAME}=dismissed; max-age=${ONE_DAY_SECONDS}; path=/; SameSite=Lax`;
    }
    // Save localStorage timestamp
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }

    setIsOpen(false);
  };

  if (!isOpen) return null;

  const username = saweriaInfo.username || 'kurumitokisaki';
  const saweriaUrl = `https://saweria.co/${username}`;
  // Generate high-resolution clean QR code pointing to user's Saweria page
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&data=${encodeURIComponent(
    saweriaUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Dark Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-sm rounded-3xl border-2 border-neutral-700/80 bg-[#121212]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(225,29,72,0.3)] backdrop-blur-2xl ring-1 ring-white/10 z-10 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">

        {/* Close Button Top Right */}
        <button
          onClick={handleClose}
          aria-label="Tutup pop-up Saweria"
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Icon & Badges */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
            <Coffee className="h-6 w-6" />
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600/20 text-rose-500 border border-rose-500/30 shadow-inner">
            <Heart className="h-6 w-6 fill-rose-500" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-600/15 border border-rose-500/30 px-3 py-1 text-[11px] font-bold text-rose-400 mb-2">
          <Sparkles className="h-3 w-3" />
          <span>{saweriaInfo.text1 || 'Kurunime Saweria'}</span>
        </div>

        <h3 className="text-lg font-black text-white tracking-tight">
          Bantu Kurunime Tetap Aktif!
        </h3>

        <p className="mt-1 text-xs text-neutral-300 leading-relaxed max-w-xs">
          {saweriaInfo.text2 || 'Dukung operasional server, update episode anime cepat & baca komik tanpa iklan!'}
        </p>

        {/* QR Code Container */}
        <div className="mt-4 relative p-3 bg-white rounded-2xl border-2 border-neutral-700 shadow-xl flex flex-col items-center justify-center">
          <div className="relative">
            <img
              src={qrImageUrl}
              alt={`QR Code Saweria ${username}`}
              width={220}
              height={220}
              className="rounded-lg object-contain"
            />
            {/* Center Logo Badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-amber-500 text-neutral-950 font-black text-[11px] px-2 py-0.5 rounded-md shadow-md border-2 border-white tracking-wider uppercase">
                Saweria
              </div>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-[11px] font-bold text-neutral-800">
              @{username}
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1 text-[10px] text-neutral-400">
          <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-semibold">QRIS</span>
          <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-semibold">GoPay</span>
          <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-semibold">OVO</span>
          <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-semibold">DANA</span>
          <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-semibold">ShopeePay</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 w-full flex flex-col gap-2">
          {/* Direct Link to Saweria */}
          <a
            href={saweriaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Buka Halaman Saweria</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {/* Close button with 1-day cookie */}
          <button
            onClick={handleClose}
            className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white font-semibold text-xs transition-all active:scale-95"
          >
            Tutup
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-500 mt-0.5">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>Cookie disimpan: pop-up hanya akan muncul 1 kali sehari.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
