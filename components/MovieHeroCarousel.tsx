'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  Info,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Film,
  Tv,
  Flame,
} from 'lucide-react';
import { MovieItem } from '@/lib/api/types';

interface MovieHeroCarouselProps {
  items: MovieItem[];
}

export default function MovieHeroCarousel({ items }: MovieHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const slideCount = Math.min(items.length, 6);
  const displayItems = items.slice(0, slideCount);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
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

  if (displayItems.length === 0) return null;

  const currentItem = displayItems[currentIndex];
  const isTv = currentItem.type === 'tv';
  const backdropUrl = currentItem.backdrop || currentItem.poster || '/placeholder.svg';

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
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 50) nextSlide();
        else if (diff < -50) prevSlide();
        touchStartX.current = null;
      }}
    >
      {/* Background Layers with Cross-Fade Transition */}
      <div className="relative min-h-[440px] sm:min-h-[500px] md:min-h-[560px] w-full">
        {displayItems.map((item, idx) => {
          const isActive = idx === currentIndex;
          const bgImg = item.backdrop || item.poster || '/placeholder.svg';
          return (
            <div
              key={`bg-${item.type}-${item.id}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-0 scale-100' : 'opacity-0 -z-10 scale-105'
              } transition-transform duration-[6000ms]`}
            >
              <img
                src={bgImg}
                alt={item.title}
                className="h-full w-full object-cover object-[center_25%]"
              />
            </div>
          );
        })}

        {/* Ambient Gradient Overlays for Cinematic Readability */}
        {/* Left Dark Gradient for Text */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/85 to-transparent sm:w-4/5 lg:w-3/5 z-10" />
        {/* Bottom Fade into the page background */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent z-10" />
        {/* Top Header Vignette */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent z-10" />

        {/* Main Slide Content Area */}
        <div className="relative z-20 flex h-full min-h-[440px] sm:min-h-[500px] md:min-h-[560px] flex-col justify-end p-6 sm:p-10 md:p-14 max-w-3xl">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
            <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-rose-600/40">
              <Flame className="h-3.5 w-3.5 fill-white" />
              <span>#{currentIndex + 1} Trending</span>
            </span>

            <span className="flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 text-xs font-semibold text-neutral-200">
              {isTv ? <Tv className="h-3 w-3 text-blue-400" /> : <Film className="h-3 w-3 text-rose-400" />}
              <span>{isTv ? 'Serial TV' : 'Film Box Office'}</span>
            </span>

            {currentItem.year && (
              <span className="rounded-full bg-white/10 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-neutral-300">
                {currentItem.year}
              </span>
            )}

            {currentItem.rating && currentItem.rating > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/30 px-2.5 py-1 text-xs font-bold shadow-sm">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{currentItem.rating.toFixed(1)}</span>
              </span>
            )}

            <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-neutral-400 tracking-wider">
              HD • SUB INDO
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-md line-clamp-2">
            {currentItem.title}
          </h1>

          {/* Synopsis / Excerpt */}
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base text-neutral-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl drop-shadow-sm font-normal">
            {currentItem.overview ||
              `Tonton ${currentItem.title} subtitle Indonesia kualitas HD gratis dengan 7 pilihan server streaming anti-buffering dan unduh subtitle .SRT langsung di Kurunime.`}
          </p>

          {/* Action CTAs */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={`/movie/${currentItem.type || 'movie'}/${currentItem.id}`}
              className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-600 to-rose-700 px-6 sm:px-8 py-3 text-sm font-extrabold text-white shadow-xl shadow-rose-600/40 transition-all hover:scale-105 hover:shadow-rose-600/60 active:scale-95"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Tonton Sekarang</span>
            </Link>

            <Link
              href={`/movie/${currentItem.type || 'movie'}/${currentItem.id}`}
              className="flex items-center gap-2 rounded-xl bg-neutral-900/80 backdrop-blur-md px-5 py-3 text-sm font-semibold text-neutral-200 border border-white/15 hover:bg-neutral-800 hover:text-white transition-all active:scale-95"
            >
              <Info className="h-4 w-4 text-neutral-400" />
              <span>Detail & Server</span>
            </Link>
          </div>
        </div>

        {/* Thumbnail Navigation Bar (Right bottom preview strip on desktop) */}
        <div className="hidden lg:flex absolute right-8 bottom-8 z-20 items-center gap-2.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 shadow-2xl">
          {displayItems.map((item, idx) => {
            const isActive = idx === currentIndex;
            const thumbImg = item.poster || item.backdrop || '/placeholder.svg';
            return (
              <button
                key={`thumb-${item.type}-${item.id}`}
                onClick={() => setCurrentIndex(idx)}
                className={`relative group/thumb rounded-xl overflow-hidden transition-all duration-300 text-left ${
                  isActive
                    ? 'w-36 ring-2 ring-rose-500 shadow-lg shadow-rose-600/30'
                    : 'w-16 opacity-60 hover:opacity-100 hover:w-24'
                }`}
              >
                <div className="relative aspect-[16/10] w-full bg-neutral-900">
                  <img
                    src={thumbImg}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  {isActive && (
                    <div className="absolute inset-x-0 bottom-0 p-1.5">
                      <p className="text-[10px] font-bold text-white truncate leading-tight">
                        {item.title}
                      </p>
                    </div>
                  )}

                  {/* Progress Indicator for Active Slide */}
                  {isActive && !isPaused && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-white/20 overflow-hidden">
                      <div className="h-full bg-rose-500 animate-[progress_6s_linear_infinite]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile Slide Dot Indicators */}
        <div className="flex lg:hidden absolute bottom-4 inset-x-0 justify-center items-center gap-1.5 z-20">
          {displayItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-6 bg-rose-500 shadow-sm shadow-rose-500/50'
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Arrow Navigation Controls (Previous & Next) */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/15 opacity-0 group-hover:opacity-100 hover:bg-rose-600 hover:border-rose-500 transition-all duration-300 shadow-xl"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/15 opacity-0 group-hover:opacity-100 hover:bg-rose-600 hover:border-rose-500 transition-all duration-300 shadow-xl"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>
    </div>
  );
}
