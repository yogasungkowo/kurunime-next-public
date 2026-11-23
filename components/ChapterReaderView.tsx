'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { ComicChapterReader, ComicChapterItem, ComicDetail } from '@/lib/api/types';
import { saveHistory } from '@/lib/history';
import FloatingReaderToolbar, { ReaderSettings } from './FloatingReaderToolbar';

interface ChapterBlock {
  chapterNumber: string;
  title: string;
  images: string[];
  prevChapter: string | null;
  nextChapter: string | null;
}

const MANGA_API_BASE =
  process.env.NEXT_PUBLIC_MANGA_API_URL || 'https://manga-api.prasunk.my.id';

interface ChapterReaderViewProps {
  data: ComicChapterReader;
  mangaSlug: string;
  chapters?: ComicChapterItem[];
  comicDetail?: ComicDetail;
}

export default function ChapterReaderView({
  data,
  mangaSlug,
  chapters: initialChapters = [],
  comicDetail,
}: ChapterReaderViewProps) {
  const [chapters, setChapters] = useState<ComicChapterItem[]>(initialChapters);

  // Settings State: width and panel gap
  const [settings, setSettings] = useState<ReaderSettings>({
    maxWidth: '3xl',
    imageGap: 'none',
  });

  // Multi-chapter continuous reading state
  const [chapterBlocks, setChapterBlocks] = useState<ChapterBlock[]>([
    {
      chapterNumber: String(data.chapterNumber ?? '1'),
      title: data.title || `Chapter ${data.chapterNumber ?? '1'}`,
      images: data.images || [],
      prevChapter: data.prevChapter ? String(data.prevChapter) : null,
      nextChapter: data.nextChapter ? String(data.nextChapter) : null,
    },
  ]);

  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [loadingNextChapter, setLoadingNextChapter] = useState(false);
  const [reachedLatestChapter, setReachedLatestChapter] = useState(!data.nextChapter);

  // Auto Scroll States
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(2.0);

  // Container and Page Image Refs
  const readerContainerRef = useRef<HTMLDivElement | null>(null);
  const chapterBlockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

  // Active chapter block helper
  const activeBlock = chapterBlocks[activeChapterIndex] || chapterBlocks[0];

  // Record History and URL when active chapter changes
  useEffect(() => {
    if (!activeBlock) return;

    // 1. Update Watch/Read History
    saveHistory({
      type: 'comic',
      id: `${mangaSlug}-${activeBlock.chapterNumber}`,
      title: data.comicTitle || comicDetail?.title || mangaSlug,
      poster: activeBlock.images[0] || comicDetail?.poster || '',
      subTitle: `Chapter ${activeBlock.chapterNumber}`,
      url: `/komik/chapter/${mangaSlug}-${activeBlock.chapterNumber}`,
    });

    // 2. Update Browser URL seamlessly without page reload
    if (typeof window !== 'undefined' && window.history) {
      const targetUrl = `/komik/chapter/${mangaSlug}-${activeBlock.chapterNumber}`;
      if (window.location.pathname !== targetUrl) {
        window.history.replaceState(null, '', targetUrl);
      }
      document.title = `${activeBlock.title || 'Chapter ' + activeBlock.chapterNumber} - Kurunime`;
    }
  }, [activeBlock, mangaSlug, data.comicTitle, comicDetail]);

  // If chapters list was not passed in SSR, fetch client-side as fallback
  useEffect(() => {
    if (initialChapters.length > 0) {
      setChapters(initialChapters);
      return;
    }

    let active = true;
    fetch(`${MANGA_API_BASE}/manga/${mangaSlug}`)
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        const rawChapters = json?.data?.chapters || [];
        const mapped: ComicChapterItem[] = rawChapters.map((ch: any) => ({
          title: ch.title || `Chapter ${ch.number}`,
          slug: ch.slug || '',
          number: ch.number,
          date: ch.date || '',
        }));
        setChapters(mapped);
      })
      .catch((err) => {
        console.error('Failed to fetch chapters fallback', err);
      });

    return () => {
      active = false;
    };
  }, [mangaSlug, initialChapters]);

  // Function to load the next chapter seamlessly
  const loadNextChapter = useCallback(async () => {
    const lastBlock = chapterBlocks[chapterBlocks.length - 1];
    if (!lastBlock?.nextChapter || loadingNextChapter || reachedLatestChapter) {
      return;
    }

    const nextChNum = lastBlock.nextChapter;
    setLoadingNextChapter(true);

    try {
      const res = await fetch(
        `${MANGA_API_BASE}/manga/${mangaSlug}/chapter/${nextChNum}`
      );
      if (!res.ok) throw new Error('Gagal memuat chapter berikutnya');
      const json = await res.json();
      const chData = json?.data;

      if (chData && Array.isArray(chData.images) && chData.images.length > 0) {
        const sortedImages: string[] = chData.images
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          .map((img: any) => img.url);

        const newBlock: ChapterBlock = {
          chapterNumber: String(chData.chapter_number || nextChNum),
          title: chData.title || `Chapter ${nextChNum}`,
          images: sortedImages,
          prevChapter: chData.prev?.chapter_number
            ? String(chData.prev.chapter_number)
            : lastBlock.chapterNumber,
          nextChapter: chData.next?.chapter_number
            ? String(chData.next.chapter_number)
            : null,
        };

        setChapterBlocks((prev) => [...prev, newBlock]);
        if (!newBlock.nextChapter) {
          setReachedLatestChapter(true);
        }
      } else {
        setReachedLatestChapter(true);
      }
    } catch (err) {
      console.error('Error auto loading next chapter', err);
      setReachedLatestChapter(true);
    } finally {
      setLoadingNextChapter(false);
    }
  }, [chapterBlocks, loadingNextChapter, reachedLatestChapter, mangaSlug]);

  // IntersectionObserver to auto-trigger loading next chapter when user reaches bottom
  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextChapter();
        }
      },
      { rootMargin: '1200px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextChapter]);

  // Detect which chapter block is currently in the reading viewport
  useEffect(() => {
    let ticking = false;

    const handleScrollDetectActiveChapter = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const viewportMid = window.scrollY + window.innerHeight * 0.45;
          let bestIdx = 0;

          for (let i = 0; i < chapterBlockRefs.current.length; i++) {
            const el = chapterBlockRefs.current[i];
            if (!el) continue;
            const top = window.scrollY + el.getBoundingClientRect().top;
            const bottom = top + el.offsetHeight;
            if (viewportMid >= top && viewportMid <= bottom) {
              bestIdx = i;
              break;
            } else if (viewportMid > bottom) {
              bestIdx = i;
            }
          }

          setActiveChapterIndex((prev) => (prev !== bestIdx ? bestIdx : prev));
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', handleScrollDetectActiveChapter, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollDetectActiveChapter);
  }, [chapterBlocks.length]);

  // --- AUTO SCROLL ENGINE ---
  const toggleAutoScroll = useCallback(() => {
    setIsAutoScrolling((prev) => !prev);
  }, []);

  // Main Auto-scroll Animation Loop
  useEffect(() => {
    if (!isAutoScrolling) return;

    let rafId: number | null = null;
    let lastTime = performance.now();
    let scrollSubpixel = 0;

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;

      // Accumulate scroll subpixels for smooth frame-independent scroll
      scrollSubpixel += autoScrollSpeed * dt;
      const pixelsToScroll = Math.floor(scrollSubpixel);

      if (pixelsToScroll > 0) {
        scrollSubpixel -= pixelsToScroll;
        if (document.scrollingElement) {
          document.scrollingElement.scrollTop += pixelsToScroll;
        } else {
          window.scrollBy(0, pixelsToScroll);
        }
      }

      // Check if reached the very bottom of document
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const currentBottom = window.innerHeight + window.scrollY;
      if (currentBottom >= scrollHeight - 10) {
        if (!loadingNextChapter && reachedLatestChapter) {
          setIsAutoScrolling(false);
          return;
        }
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isAutoScrolling, autoScrollSpeed, loadingNextChapter, reachedLatestChapter]);

  // Cancel auto scroll when user manually scrolls via wheel/touch or presses Esc/Space
  useEffect(() => {
    if (!isAutoScrolling) return;

    const handleUserInterrupt = () => {
      setIsAutoScrolling(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        setIsAutoScrolling(false);
      }
    };

    window.addEventListener('wheel', handleUserInterrupt, { passive: true });
    window.addEventListener('touchmove', handleUserInterrupt, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleUserInterrupt);
      window.removeEventListener('touchmove', handleUserInterrupt);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAutoScrolling]);

  const handleUpdateSettings = (newSettings: Partial<ReaderSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleJumpToPage = (pageIndex: number) => {
    const targetEl = imageRefs.current[pageIndex];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Resolve URLs for current active chapter
  const prevUrl = activeBlock.prevChapter
    ? `/komik/chapter/${mangaSlug}-${activeBlock.prevChapter}`
    : null;
  const nextUrl = activeBlock.nextChapter
    ? `/komik/chapter/${mangaSlug}-${activeBlock.nextChapter}`
    : null;

  // Resolve container width class based on settings
  const containerWidthClass =
    settings.maxWidth === 'full'
      ? 'max-w-full px-2 sm:px-4'
      : settings.maxWidth === '5xl'
      ? 'max-w-5xl px-2 sm:px-4'
      : 'max-w-3xl px-1 sm:px-2';

  // Resolve gap class based on settings
  const imageGapClass = settings.imageGap === 'small' ? 'space-y-4' : 'space-y-0';

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center">
      {/* Top Floating Sticky Control Bar */}
      <div className="sticky top-16 z-30 w-full bg-[#121212]/95 border-b border-neutral-800 backdrop-blur-md px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="mx-auto max-w-4xl flex items-center justify-between gap-2">
          {/* Back Button */}
          <Link
            href={`/komik/${mangaSlug}`}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-rose-400 transition-colors p-1 -ml-1 rounded-lg"
            title="Kembali ke Detail Komik"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Kembali ke Detail</span>
          </Link>

          {/* Title & Chapter Details (Centered, min-w-0 for clean truncation) */}
          <div className="flex-1 min-w-0 text-center px-1">
            <h1 className="text-xs sm:text-sm font-bold text-white truncate" title={data.comicTitle || comicDetail?.title || 'Komik'}>
              {data.comicTitle || comicDetail?.title || 'Komik'}
            </h1>
            <p className="text-[10px] sm:text-[11px] font-semibold text-rose-500 truncate">
              Chapter {activeBlock.chapterNumber} <span className="text-neutral-500 font-normal">•</span> {activeBlock.images.length} Halaman
            </p>
          </div>

          {/* Quick Nav Prev/Next Buttons */}
          <div className="shrink-0 flex items-center gap-1.5">
            {prevUrl ? (
              <Link
                href={prevUrl}
                className="flex h-7 w-7 sm:h-8 sm:w-auto items-center justify-center gap-1 rounded-lg bg-neutral-900 border border-neutral-800 sm:px-2.5 sm:py-1 text-xs text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
                title="Chapter Sebelumnya"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </Link>
            ) : (
              <span className="flex h-7 w-7 sm:h-8 sm:w-auto items-center justify-center gap-1 rounded-lg bg-neutral-900/40 border border-neutral-900/50 text-neutral-600 text-xs sm:px-2 cursor-not-allowed">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </span>
            )}

            {nextUrl ? (
              <Link
                href={nextUrl}
                className="flex h-7 w-7 sm:h-8 sm:w-auto items-center justify-center gap-1 rounded-lg bg-rose-600 sm:px-3 sm:py-1 text-xs font-bold text-white hover:bg-rose-500 transition-colors shadow-sm"
                title="Chapter Selanjutnya"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="flex h-7 w-7 sm:h-8 sm:w-auto items-center justify-center gap-1 rounded-lg bg-neutral-900/40 border border-neutral-900/50 text-neutral-600 text-xs sm:px-2 cursor-not-allowed">
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reader Body (Webtoon Vertical Continuous Images across Chapters) */}
      <div
        ref={readerContainerRef}
        className={`w-full ${containerWidthClass} my-6 flex flex-col items-center transition-all duration-300`}
      >
        {chapterBlocks.map((block, blockIdx) => (
          <div
            key={block.chapterNumber}
            id={`chapter-block-${block.chapterNumber}`}
            ref={(el) => {
              chapterBlockRefs.current[blockIdx] = el;
            }}
            className="w-full flex flex-col items-center"
          >
            {/* Seamless Chapter Transition Header Divider */}
            {blockIdx > 0 && (
              <div className="w-full my-12 py-5 border-y-2 border-neutral-800 bg-[#121212]/95 rounded-2xl px-6 text-center shadow-2xl backdrop-blur-md">
                <span className="inline-flex items-center gap-1 rounded bg-rose-600/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-300 mb-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Bersambung Otomatis
                </span>
                <h3 className="text-base sm:text-xl font-black text-white tracking-tight">
                  {block.title || `Chapter ${block.chapterNumber}`}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {block.images.length} Halaman
                </p>
              </div>
            )}

            {/* Images in this chapter */}
            <div className={`w-full ${imageGapClass} flex flex-col items-center`}>
              {block.images.map((imgUrl, imgIdx) => {
                const globalImageIndex = blockIdx === 0 ? imgIdx : undefined;
                return (
                  <div
                    key={`${block.chapterNumber}-${imgIdx}`}
                    ref={(el) => {
                      if (globalImageIndex !== undefined) {
                        imageRefs.current[globalImageIndex] = el;
                      }
                    }}
                    className="relative w-full flex justify-center bg-black"
                  >
                    <img
                      src={imgUrl}
                      alt={`Ch ${block.chapterNumber} - Halaman ${imgIdx + 1}`}
                      loading={blockIdx === 0 && imgIdx < 3 ? 'eager' : 'lazy'}
                      className="w-full h-auto object-contain block"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Loading Indicator for Next Chapter */}
        {loadingNextChapter && (
          <div className="w-full my-12 py-8 flex flex-col items-center justify-center gap-3 bg-[#121212]/80 border border-neutral-800 rounded-2xl text-rose-500 shadow-xl">
            <Loader2 className="h-7 w-7 animate-spin" />
            <span className="text-xs sm:text-sm font-semibold text-neutral-200">
              Memuat chapter berikutnya secara otomatis...
            </span>
          </div>
        )}

        {/* Bottom Sentinel to trigger auto-fetching next chapter */}
        <div ref={bottomSentinelRef} className="h-10 w-full" />

        {/* End of Chapters Indicator */}
        {reachedLatestChapter && (
          <div className="w-full my-12 p-8 rounded-2xl bg-[#141414] border border-neutral-800 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600/20 text-rose-400 mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                Kamu telah mencapai chapter terbaru!
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Chapter berikutnya akan hadir segera setelah dirilis.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href={`/komik/${mangaSlug}`}
                className="rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
              >
                Halaman Utama Komik
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Modern Floating Reader Toolbar */}
      <FloatingReaderToolbar
        comicSlug={mangaSlug}
        comicTitle={data.comicTitle || comicDetail?.title || mangaSlug}
        chapterNumber={activeBlock.chapterNumber}
        totalImages={activeBlock.images.length}
        prevUrl={prevUrl}
        nextUrl={nextUrl}
        chapters={chapters}
        containerRef={readerContainerRef}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onJumpToPage={handleJumpToPage}
        isAutoScrolling={isAutoScrolling}
        onToggleAutoScroll={toggleAutoScroll}
        autoScrollSpeed={autoScrollSpeed}
        onChangeAutoScrollSpeed={setAutoScrollSpeed}
      />
    </div>
  );
}
