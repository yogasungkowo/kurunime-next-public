'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  Info,
  ChevronLeft,
  ChevronRight,
  Flame,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DramaBanner } from '@/lib/api/types';

interface DramaHeroCarouselProps {
  banners: DramaBanner[];
}

export default function DramaHeroCarousel({ banners }: DramaHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const displayBanners = banners.slice(0, 6);
  const slideCount = displayBanners.length;

  const nextSlide = useCallback(() => {
    if (slideCount === 0) return;
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    if (slideCount === 0) return;
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  // Auto-play timer (6 seconds per slide)
  useEffect(() => {
    if (slideCount <= 1 || isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [slideCount, isPaused, nextSlide]);

  if (displayBanners.length === 0) return null;

  const current = displayBanners[currentIndex];
  const bookId = current.jump_param?.book_id || '';
  const title = current.jump_param?.book_title || current.title.replace(/^高清/, '') || 'Short Drama';
  const synopsis = current.jump_param?.special_desc || '';
  const chapterCount = current.jump_param?.chapter_count || 0;
  const startChapterId = current.jump_param?.start_play?.chapter_id;
  const tags = current.jump_param?.theme_list?.map((t) => t.tag_name) || [];

  // Watch URL: if startChapterId is known, go to watch; otherwise detail page
  const watchUrl = startChapterId
    ? `/drama/watch/${bookId}/${startChapterId}`
    : `/drama/${bookId}`;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-800/80 bg-neutral-950 shadow-2xl group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) nextSlide();
          else prevSlide();
        }
        touchStartX.current = null;
      }}
    >
      {/* Background Images with Cross-Fade */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] w-full min-h-[420px] sm:min-h-[460px] md:min-h-[500px]">
        {displayBanners.map((banner, idx) => {
          const isActive = idx === currentIndex;
          const bgPic = banner.pic || banner.jump_param?.book_pic || '/placeholder.svg';
          return (
            <div
              key={banner.b_id || idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={bgPic}
                alt={banner.title}
                className="h-full w-full object-cover object-center filter brightness-[0.75] contrast-[1.05]"
              />
            </div>
          );
        })}

        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10 max-w-2xl" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 md:p-12 z-20">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-rose-600/90 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-rose-600/30 backdrop-blur-md">
                <Flame className="h-3.5 w-3.5 fill-white" />
                DRAMA CINA TERBAIK
              </span>
              {chapterCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-neutral-200 border border-white/10 backdrop-blur-md">
                  <Layers className="h-3.5 w-3.5 text-rose-400" />
                  {chapterCount} Episode Lengkap
                </span>
              )}
              <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-rose-300 border border-white/10 backdrop-blur-md">
                Subtitle Indonesia
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2 drop-shadow-lg">
              {title}
            </h1>

            {/* Tag Pills */}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {tags.slice(0, 4).map((t, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-neutral-300 backdrop-blur-sm border border-white/5"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {synopsis && (
              <p className="text-xs sm:text-sm text-neutral-300/90 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl drop-shadow">
                {synopsis}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={watchUrl}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-rose-600/40 hover:bg-rose-500 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Tonton Sekarang</span>
              </Link>

              <Link
                href={`/drama/${bookId}`}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20 border border-white/15 transition-all duration-200"
              >
                <Info className="h-4 w-4" />
                <span>Detail & Semua Episode</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {slideCount > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-black/80 hover:scale-110 active:scale-95 transition-all duration-200 z-30"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-black/80 hover:scale-110 active:scale-95 transition-all duration-200 z-30"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </>
        )}

        {/* Slide Indicator Bar at Bottom Right */}
        {slideCount > 1 && (
          <div className="absolute right-4 sm:right-8 bottom-4 sm:bottom-6 flex items-center gap-2 z-30">
            {displayBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-7 bg-rose-500 shadow-sm shadow-rose-500/50'
                    : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

