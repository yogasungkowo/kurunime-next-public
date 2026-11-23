'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Film, Clapperboard, BookOpen, X, Sparkles, AlertCircle } from 'lucide-react';

export function openDramaComingSoon() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kurunime:open-drama-soon'));
  }
}

interface DramaComingSoonModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DramaComingSoonModal({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}: DramaComingSoonModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  useEffect(() => {
    const handleOpenEvent = () => {
      setInternalIsOpen(true);
    };

    window.addEventListener('kurunime:open-drama-soon', handleOpenEvent);
    return () => {
      window.removeEventListener('kurunime:open-drama-soon', handleOpenEvent);
    };
  }, []);

  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-200 text-left"
        role="dialog"
        aria-modal="true"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Status Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Coming Soon / Sedang Dibuat</span>
            </div>
            <h3 className="text-lg font-bold text-neutral-100 tracking-tight mt-0.5">
              Fitur Drama Cina & Short Drama
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-300 leading-relaxed">
          Mohon maaf, fitur streaming <strong className="text-white">Short Drama & Drama Cina</strong> saat ini masih dalam proses penyempurnaan integrasi player video dan server konten.
        </p>

        {/* Highlights Preview */}
        <div className="mt-4 p-3.5 bg-neutral-950/60 border border-neutral-800/80 rounded-xl space-y-2 text-xs text-neutral-400">
          <div className="flex items-center gap-2 text-neutral-300 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Yang sedang kami persiapkan untuk Anda:</span>
          </div>
          <ul className="pl-6 list-disc space-y-1 text-neutral-400">
            <li>Ribuan episode short drama vertikal (ReelShort & Drama China viral).</li>
            <li>Subtitle bahasa Indonesia dengan kualitas streaming HD.</li>
            <li>Player responsif yang dioptimalkan untuk perangkat mobile dan desktop.</li>
          </ul>
        </div>

        {/* Alternative Links */}
        <div className="mt-5 pt-4 border-t border-neutral-800/80">
          <p className="text-xs text-neutral-400 mb-3">
            Sambil menunggu, Anda tetap bisa menikmati ribuan konten hiburan lainnya di Kurunime:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-medium">
            <Link
              href="/list/ongoing"
              onClick={handleClose}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-neutral-800/80 hover:bg-rose-600/20 text-neutral-200 hover:text-rose-300 border border-neutral-700/60 hover:border-rose-500/40 transition-colors"
            >
              <Film className="w-4 h-4 text-rose-400" />
              <span>Nonton Anime</span>
            </Link>
            <Link
              href="/movie"
              onClick={handleClose}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-neutral-800/80 hover:bg-rose-600/20 text-neutral-200 hover:text-rose-300 border border-neutral-700/60 hover:border-rose-500/40 transition-colors"
            >
              <Clapperboard className="w-4 h-4 text-sky-400" />
              <span>Nonton Film</span>
            </Link>
            <Link
              href="/komik"
              onClick={handleClose}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-neutral-800/80 hover:bg-rose-600/20 text-neutral-200 hover:text-rose-300 border border-neutral-700/60 hover:border-rose-500/40 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Baca Komik</span>
            </Link>
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Nantikan peluncurannya segera!</span>
          </div>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

