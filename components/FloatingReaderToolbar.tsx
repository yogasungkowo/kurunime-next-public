'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  List,
  Bookmark,
  Settings2,
  X,
  Search,
  Check,
  Sliders,
  ChevronDown,
  Play,
  Pause,
} from 'lucide-react';
import { ComicChapterItem } from '@/lib/api/types';
import { isBookmarked, toggleBookmark } from '@/lib/history';

export interface ReaderSettings {
  maxWidth: '3xl' | '5xl' | 'full';
  imageGap: 'none' | 'small';
}

interface FloatingReaderToolbarProps {
  comicSlug: string;
  comicTitle: string;
  chapterNumber: string | number;
  totalImages: number;
  prevUrl: string | null;
  nextUrl: string | null;
  chapters?: ComicChapterItem[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
  onJumpToPage: (pageIndex: number) => void;
  isAutoScrolling: boolean;
  onToggleAutoScroll: () => void;
  autoScrollSpeed: number;
  onChangeAutoScrollSpeed: (speed: number) => void;
}

export default function FloatingReaderToolbar({
  comicSlug,
  comicTitle,
  chapterNumber,
  totalImages,
  prevUrl,
  nextUrl,
  chapters = [],
  containerRef,
  settings,
  onUpdateSettings,
  onJumpToPage,
  isAutoScrolling,
  onToggleAutoScroll,
  autoScrollSpeed,
  onChangeAutoScrollSpeed,
}: FloatingReaderToolbarProps) {
  const router = useRouter();

  // Scroll & Progress States
  const [progress, setProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Modals / Popovers
  const [isChapterListOpen, setIsChapterListOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chapterSearch, setChapterSearch] = useState('');

  // Bookmark State & Toast
  const [bookmarked, setBookmarked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Animation lock for scroll
  const ticking = useRef(false);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  // Chapter number as safe string
  const currentChapterStr = String(chapterNumber || '1');

  // Check initial bookmark status
  useEffect(() => {
    setBookmarked(isBookmarked(comicSlug, currentChapterStr));
  }, [comicSlug, currentChapterStr]);

  // Reading progress calculation using actual container element
  const updateProgress = useCallback(() => {
    if (!containerRef?.current) return;

    const el = containerRef.current;
    const rect = el.getBoundingClientRect();
    const containerTop = window.scrollY + rect.top;
    const containerHeight = el.scrollHeight || rect.height;
    const viewportHeight = window.innerHeight;

    const maxScroll = containerHeight - viewportHeight;
    if (maxScroll <= 0) {
      setProgress(100);
      return;
    }

    const currentScroll = window.scrollY - containerTop;
    const rawProgress = (currentScroll / maxScroll) * 100;
    const clamped = Math.min(100, Math.max(0, Math.round(rawProgress)));

    setProgress(clamped);
    setShowBackToTop(window.scrollY > 250);
  }, [containerRef]);

  // Setup scroll listener and ResizeObserver
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(() => {
          updateProgress();
          ticking.current = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress();

    // Resize observer to track dynamically loaded manga pages
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef?.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateProgress();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [updateProgress, containerRef]);

  // Smooth scroll to top
  const handleScrollToTop = () => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  // Toggle Bookmark
  const handleToggleBookmark = () => {
    const newState = toggleBookmark({
      id: `${comicSlug}-${currentChapterStr}`,
      comicSlug,
      title: comicTitle || comicSlug,
      chapterNumber: currentChapterStr,
      chapterTitle: `Chapter ${currentChapterStr}`,
      url: `/komik/chapter/${comicSlug}-${currentChapterStr}`,
    });

    setBookmarked(newState);

    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToastMessage(
      newState ? 'Chapter disimpan ke Bookmark' : 'Bookmark chapter dihapus'
    );
    toastTimeout.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Safe filtered chapters for chapter picker
  const safeChapters = chapters || [];
  const filteredChapters = safeChapters.filter((ch) => {
    if (!ch) return false;
    const q = (chapterSearch || '').toLowerCase();
    const title = (ch.title || `Chapter ${ch.number || ''}`).toLowerCase();
    const num = String(ch.number ?? '');
    return title.includes(q) || num.includes(q);
  });

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsChapterListOpen(false);
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] rounded-xl bg-neutral-900/95 border border-rose-500/50 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Bookmark className="h-4 w-4 text-rose-500 fill-rose-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* FLOATING READER TOOLBAR (Centered on Mobile, Bottom-Right on Desktop) */}
      <div
        aria-label="Toolbar Pembaca Komik"
        className="fixed bottom-3 sm:bottom-5 inset-x-0 mx-auto w-fit sm:inset-x-auto sm:mx-0 sm:right-6 md:right-8 z-50 flex flex-col items-center sm:items-end pointer-events-auto select-none max-w-[calc(100vw-16px)] pb-[env(safe-area-inset-bottom,0px)]"
      >
        {/* Floating Back To Top Button above Dock (Prevents dock resizing during scroll) */}
        {showBackToTop && (
          <button
            onClick={handleScrollToTop}
            title="Kembali ke Atas"
            aria-label="Kembali ke Atas"
            className="mb-2 self-end flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#141414]/90 border border-neutral-700 text-white shadow-xl backdrop-blur-md hover:bg-neutral-800 hover:border-rose-500/50 active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <ArrowUp className="h-4 w-4 text-rose-400" />
          </button>
        )}

        {isCollapsed ? (
          /* Minimized Floating FAB Button */
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Auto scroll indicator button when collapsed */}
            <button
              onClick={onToggleAutoScroll}
              title={isAutoScrolling ? 'Hentikan Auto Scroll (Stop)' : 'Mulai Auto Scroll'}
              className={`flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 transition-all shadow-xl backdrop-blur-xl ${
                isAutoScrolling
                  ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-rose-600/50'
                  : 'bg-[#141414] border-neutral-700 text-neutral-300 hover:text-white hover:border-rose-500/50'
              }`}
            >
              {isAutoScrolling ? (
                <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setIsCollapsed(false)}
              title="Buka Toolbar Pembaca"
              aria-label="Buka Toolbar Pembaca"
              className="group flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#141414] border-2 border-rose-500/70 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 shadow-[0_10px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(225,29,72,0.4)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-rose-400 hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {/* Circular Mini Progress */}
              <div className="relative flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-neutral-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-rose-500 transition-all duration-300 ease-out"
                    strokeDasharray={`${progress}, 100`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-rose-300">{progress}%</span>
              <Sliders className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-300 group-hover:text-white transition-colors ml-0.5" />
            </button>
          </div>
        ) : (
          /* Expanded Full Floating Dock */
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 rounded-2xl border-2 border-neutral-700/80 bg-[#121212]/95 p-1.5 sm:p-2 shadow-[0_12px_40px_rgba(0,0,0,0.95),0_0_22px_rgba(225,29,72,0.35)] backdrop-blur-2xl ring-1 ring-white/10 transition-all duration-200">
            {/* Progress Circular Badge */}
            <div
              title={`Progres Membaca: ${progress}%`}
              className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 bg-black/60 rounded-xl border border-neutral-800 shrink-0"
            >
              <div className="relative flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-neutral-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-rose-500 transition-all duration-300 ease-out"
                    strokeDasharray={`${progress}, 100`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight">
                {progress}%
              </span>
            </div>

            <div className="h-5 sm:h-6 w-[1px] bg-neutral-800 hidden sm:block shrink-0" />

            {/* Previous Chapter */}
            {prevUrl ? (
              <Link
                href={prevUrl}
                title="Chapter Sebelumnya"
                aria-label="Chapter Sebelumnya"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 hover:border-neutral-600 hover:text-white hover:bg-neutral-800 transition-all active:scale-95 shrink-0"
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            ) : (
              <button
                disabled
                title="Ini chapter pertama"
                aria-label="Chapter Sebelumnya (Tidak tersedia)"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-neutral-900/40 border border-neutral-900/60 text-neutral-600 cursor-not-allowed shrink-0"
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            )}

            {/* Chapter Selector Dropdown Trigger */}
            <button
              onClick={() => {
                setIsChapterListOpen(true);
                setIsSettingsOpen(false);
              }}
              title="Daftar Chapter"
              aria-label="Daftar Chapter"
              className={`flex items-center gap-1 sm:gap-1.5 h-8 sm:h-9 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 ${
                isChapterListOpen
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-200 hover:border-rose-500/50 hover:bg-neutral-800 active:scale-95'
              }`}
            >
              <List className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-rose-500" />
              <span className="truncate max-w-[65px] sm:max-w-[120px]">
                Ch. {currentChapterStr}
              </span>
            </button>

            {/* Next Chapter */}
            {nextUrl ? (
              <Link
                href={nextUrl}
                title="Chapter Selanjutnya"
                aria-label="Chapter Selanjutnya"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/30 hover:bg-rose-500 transition-all active:scale-95 shrink-0"
              >
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            ) : (
              <button
                disabled
                title="Ini chapter terbaru"
                aria-label="Chapter Selanjutnya (Tidak tersedia)"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-neutral-900/40 border border-neutral-900/60 text-neutral-600 cursor-not-allowed shrink-0"
              >
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            )}

            <div className="h-5 sm:h-6 w-[1px] bg-neutral-800 shrink-0" />

            {/* Auto Scroll Toggle Button */}
            <button
              onClick={onToggleAutoScroll}
              title={isAutoScrolling ? 'Hentikan Auto Scroll (Stop)' : 'Mulai Auto Scroll Otomatis'}
              aria-label={isAutoScrolling ? 'Hentikan Auto Scroll' : 'Mulai Auto Scroll'}
              className={`flex items-center justify-center sm:gap-1.5 h-8 w-8 sm:h-9 sm:w-auto sm:px-2.5 rounded-xl border font-semibold text-xs transition-all active:scale-95 shrink-0 ${
                isAutoScrolling
                  ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/50 animate-pulse'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:border-rose-500/50 hover:text-rose-400'
              }`}
            >
              {isAutoScrolling ? (
                <>
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span className="hidden sm:inline text-[11px]">Stop</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current ml-0.5 text-rose-500" />
                  <span className="hidden sm:inline text-[11px]">Auto</span>
                </>
              )}
            </button>

            {/* Bookmark Action */}
            <button
              onClick={handleToggleBookmark}
              title={bookmarked ? 'Hapus Bookmark' : 'Simpan Bookmark'}
              aria-label={bookmarked ? 'Hapus Bookmark' : 'Simpan Bookmark'}
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border transition-all shrink-0 ${
                bookmarked
                  ? 'bg-rose-600/20 border-rose-500/50 text-rose-500 shadow-sm'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-rose-400 active:scale-95'
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${bookmarked ? 'fill-rose-500' : ''}`} />
            </button>

            {/* Reader Settings */}
            <button
              onClick={() => {
                setIsSettingsOpen(!isSettingsOpen);
                setIsChapterListOpen(false);
              }}
              title="Pengaturan Tampilan Pembaca"
              aria-label="Pengaturan Tampilan Pembaca"
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border transition-all shrink-0 ${
                isSettingsOpen
                  ? 'bg-neutral-800 border-neutral-700 text-rose-400'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white active:scale-95'
              }`}
            >
              <Settings2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            {/* Minimize / Collapse */}
            <button
              onClick={() => setIsCollapsed(true)}
              title="Ciutkan Toolbar"
              aria-label="Ciutkan Toolbar"
              className="flex h-8 w-5 sm:h-9 sm:w-7 items-center justify-center text-neutral-500 hover:text-neutral-300 transition-colors shrink-0"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* CHAPTER SELECTOR MODAL / POPUP */}
      {isChapterListOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsChapterListOpen(false)}
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-lg rounded-2xl border-2 border-neutral-700 bg-[#121212] p-5 shadow-2xl ring-1 ring-white/10 z-10 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <List className="h-4 w-4 text-rose-500" />
                  <span>Pilih Chapter</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                  {comicTitle || comicSlug}
                </p>
              </div>
              <button
                onClick={() => setIsChapterListOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                aria-label="Tutup Dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari nomor chapter..."
                value={chapterSearch}
                onChange={(e) => setChapterSearch(e.target.value)}
                autoFocus
                className="w-full rounded-xl bg-black border border-neutral-800 pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Chapter Items Grid */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-96">
              {filteredChapters.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                  {safeChapters.length === 0
                    ? 'Daftar chapter lengkap dapat dilihat di halaman detail komik.'
                    : 'Chapter tidak ditemukan.'}
                </div>
              ) : (
                filteredChapters.map((ch) => {
                  const chParam = ch.number !== undefined ? String(ch.number) : ch.slug;
                  const isCurrent =
                    String(ch.number) === currentChapterStr || ch.slug === currentChapterStr;

                  return (
                    <button
                      key={ch.slug || ch.title}
                      onClick={() => {
                        setIsChapterListOpen(false);
                        router.push(`/komik/chapter/${comicSlug}-${chParam}`);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all ${
                        isCurrent
                          ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{ch.title || `Chapter ${ch.number}`}</span>
                      {isCurrent && (
                        <span className="flex items-center gap-1 text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-white font-semibold shrink-0 ml-2">
                          <Check className="h-3 w-3" />
                          Dibaca
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-between items-center text-xs text-neutral-400">
              <span>Total: {safeChapters.length} Chapter</span>
              <Link
                href={`/komik/${comicSlug}`}
                onClick={() => setIsChapterListOpen(false)}
                className="text-rose-500 hover:text-rose-400 font-medium"
              >
                Halaman Komik →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS POPOVER DIALOG */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsSettingsOpen(false)}
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-sm rounded-2xl border-2 border-neutral-700 bg-[#121212] p-5 shadow-2xl ring-1 ring-white/10 z-10 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-rose-500" />
                <span>Pengaturan Pembaca</span>
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white"
                aria-label="Tutup Pengaturan"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Auto Scroll Speed Setting */}
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-2">
                  Kecepatan Auto Scroll
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onChangeAutoScrollSpeed(1.0)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                      autoScrollSpeed <= 1.2
                        ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    Santai (1.0x)
                  </button>
                  <button
                    onClick={() => onChangeAutoScrollSpeed(2.0)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                      autoScrollSpeed > 1.2 && autoScrollSpeed <= 2.8
                        ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    Normal (2.0x)
                  </button>
                  <button
                    onClick={() => onChangeAutoScrollSpeed(3.5)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                      autoScrollSpeed > 2.8
                        ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    Cepat (3.5x)
                  </button>
                </div>
              </div>

              {/* Width Fit Control */}
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-2">
                  Lebar Tampilan Gambar
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onUpdateSettings({ maxWidth: '3xl' })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                      settings.maxWidth === '3xl'
                        ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    Standar
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ maxWidth: '5xl' })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                      settings.maxWidth === '5xl'
                        ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    Lebar
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ maxWidth: 'full' })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                      settings.maxWidth === 'full'
                        ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    Penuh
                  </button>
                </div>
              </div>

              {/* Panel Gap Control */}
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-2">
                  Jarak Antar Panel / Gambar
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateSettings({ imageGap: 'none' })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                      settings.imageGap === 'none'
                        ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    Seamless (Rapat)
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ imageGap: 'small' })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                      settings.imageGap === 'small'
                        ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    Berjarak (Manga)
                  </button>
                </div>
              </div>

              {/* Quick Jump to Page */}
              {totalImages > 0 && (
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-2">
                    Lompat ke Halaman (Total {totalImages} Halaman)
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      onChange={(e) => {
                        const idx = parseInt(e.target.value, 10);
                        if (!isNaN(idx)) {
                          onJumpToPage(idx);
                          setIsSettingsOpen(false);
                        }
                      }}
                      defaultValue=""
                      className="w-full rounded-xl bg-black border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="" disabled>
                        Pilih nomor halaman...
                      </option>
                      {Array.from({ length: totalImages }, (_, i) => (
                        <option key={i} value={i}>
                          Halaman {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
