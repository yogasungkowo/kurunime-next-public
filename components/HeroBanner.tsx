'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Anime } from '@/lib/api/types';

interface HeroBannerProps {
  featuredList: Anime[];
}

export default function HeroBanner({ featuredList }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto advance hero banner every 6s
  useEffect(() => {
    if (!featuredList.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [featuredList.length]);

  if (!featuredList.length) return null;

  const current = featuredList[currentIndex];
  const ratingText = current.rating && current.rating > 0 ? current.rating.toFixed(1) : '8.5';

  return (
    <div className="relative w-full overflow-hidden bg-black pb-4 pt-2">
      {/* Container */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative min-h-[360px] sm:min-h-[420px] md:min-h-[480px] w-full overflow-hidden rounded-xl bg-neutral-900">
          
          {/* Background image & Gradients */}
          <div className="absolute inset-0">
            <img
              key={current.poster || current.title}
              src={current.poster || '/placeholder.svg'}
              alt={current.title}
              className="h-full w-full object-cover object-[center_20%] opacity-80 sm:opacity-90 transition-opacity duration-500"
            />
            {/* Cinematic dark gradients - keeps text crystal clear while keeping artwork sharp & unblurred */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/85 to-transparent sm:w-3/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/30 via-transparent to-transparent" />
          </div>

          {/* Content Overlays */}
          <div className="relative z-10 flex min-h-[360px] sm:min-h-[420px] md:min-h-[480px] flex-col justify-end p-4 sm:p-8 md:p-10 pb-8 sm:pb-8 max-w-xl">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2.5 sm:mb-3">
              <span className="flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-400">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {ratingText}
              </span>
              <span className="rounded bg-rose-600/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-400">
                {current.quality || 'HD'}
              </span>
              <span className="rounded bg-white/8 px-2 py-0.5 text-[11px] font-medium text-neutral-300">
                {current.type || 'TV'}
              </span>
              {current.status && (
                <span className="rounded bg-emerald-600/20 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                  {current.status}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-lg sm:text-2xl md:text-4xl font-bold tracking-tight text-white leading-tight line-clamp-2">
              {current.title}
            </h1>

            {/* Japanese / Alt title */}
            {current.titleJapanese && (
              <p className="mt-1 text-xs sm:text-sm text-neutral-400 line-clamp-1">
                {current.titleJapanese}
              </p>
            )}

            {/* Synopsis snippet */}
            {current.synopsis && (
              <p className="mt-2 text-xs sm:text-sm text-neutral-400 line-clamp-2 leading-relaxed max-w-md hidden sm:block">
                {current.synopsis}
              </p>
            )}

            {/* Action Buttons */}
            <div className="mt-4 sm:mt-5 flex items-center gap-2 sm:gap-2.5">
              <Link
                href={`/anime/${current.slug || current.id}`}
                className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-rose-600 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition-all hover:bg-rose-500 active:scale-95"
              >
                <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white" />
                Tonton Sekarang
              </Link>

              <Link
                href={`/anime/${current.slug || current.id}`}
                className="rounded-lg bg-white/10 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-neutral-300 ring-1 ring-white/10 transition-all hover:bg-white/15 active:scale-95"
              >
                Detail
              </Link>
            </div>
          </div>

          {/* Navigation Arrows - Top-Right on Mobile to avoid button overlap, Bottom-Right on Desktop */}
          <div className="absolute top-3.5 right-3.5 sm:top-auto sm:bottom-4 sm:right-4 z-20 flex items-center gap-1 sm:gap-1.5 bg-black/60 backdrop-blur-md px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length)}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Previous featured anime"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-medium text-neutral-300 px-1 tabular-nums">
              {currentIndex + 1}/{featuredList.length}
            </span>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredList.length)}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Next featured anime"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Bottom Indicators */}
          <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
            {featuredList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-5 bg-rose-500' : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
