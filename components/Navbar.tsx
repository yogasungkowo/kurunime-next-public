'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Search,
  History,
  Menu,
  X,
  Calendar,
  BookOpen,
  Film,
  Sparkles,
  Layers,
  Play,
  Bookmark,
  Clapperboard,
  Flame,
} from 'lucide-react';
import SearchModal from './SearchModal';
import HistoryDrawer from './HistoryDrawer';
import BookmarkDrawer from './BookmarkDrawer';
import DramaComingSoonModal from './DramaComingSoonModal';
import { getBookmarks } from '@/lib/history';

export default function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);
  const [isDramaSoonOpen, setIsDramaSoonOpen] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Sync bookmark count
  useEffect(() => {
    const updateCount = () => {
      setBookmarkCount(getBookmarks().length);
    };
    updateCount();
    window.addEventListener('kurunime:bookmarks-updated', updateCount);
    return () => window.removeEventListener('kurunime:bookmarks-updated', updateCount);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { label: 'Beranda', href: '/', icon: Sparkles },
    { label: 'Movie', href: '/movie', icon: Clapperboard },
    { label: 'Drama', href: '/drama', icon: Flame, isComingSoon: true },
    { label: 'Ongoing', href: '/list/ongoing', icon: Play },
    { label: 'Tamat', href: '/list/completed', icon: Film },
    { label: 'Jadwal Rilis', href: '/jadwal', icon: Calendar },
    { label: 'Komik', href: '/komik', icon: BookOpen },
    { label: 'Genre', href: '/genre', icon: Layers },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'kuru-glass shadow-lg shadow-black/60'
            : 'bg-black/90 border-b border-white/5 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left: Brand Logo & Main Nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="Kurunime"
                width={32}
                height={32}
                className="rounded-lg transition-transform group-hover:scale-105"
                priority
              />
              <span className="text-lg font-black tracking-tight text-white">
                KURU<span className="text-rose-500">NIME</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                if (item.isComingSoon) {
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => setIsDramaSoonOpen(true)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-neutral-400 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 leading-none">
                        Soon
                      </span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-rose-600/15 text-rose-400'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, History, Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-neutral-500 ring-1 ring-white/8 hover:bg-white/8 hover:text-neutral-300 transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cari...</span>
              <kbd className="hidden lg:inline-block rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-mono text-neutral-500">
                ⌘K
              </kbd>
            </button>

            {/* Bookmark Button with Badge */}
            <button
              onClick={() => setIsBookmarkOpen(true)}
              title="Daftar Bookmark"
              className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-neutral-400 ring-1 ring-white/8 hover:bg-white/8 hover:text-rose-400 transition-colors"
            >
              <Bookmark className="h-3.5 w-3.5" />
              {bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-black text-white shadow-sm shadow-rose-600/50">
                  {bookmarkCount > 99 ? '99+' : bookmarkCount}
                </span>
              )}
            </button>

            {/* History Button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              title="Riwayat Tonton & Baca"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-neutral-400 ring-1 ring-white/8 hover:bg-white/8 hover:text-rose-400 transition-colors"
            >
              <History className="h-3.5 w-3.5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-8 w-8 md:hidden items-center justify-center rounded-lg bg-white/5 text-neutral-400 ring-1 ring-white/8 hover:bg-white/8 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl px-4 py-3 space-y-0.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              if (item.isComingSoon) {
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsDramaSoonOpen(true);
                    }}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-amber-400" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Coming Soon
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-rose-600/15 text-rose-400'
                      : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Mobile Bookmark Link */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsBookmarkOpen(true);
              }}
              className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bookmark className="h-4 w-4 text-rose-500" />
                <span>Bookmark Saya</span>
              </div>
              {bookmarkCount > 0 && (
                <span className="rounded-full bg-rose-600/20 px-2 py-0.5 text-xs font-bold text-rose-400">
                  {bookmarkCount}
                </span>
              )}
            </button>
          </div>
        )}
      </header>

      {/* Modals & Drawers */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <BookmarkDrawer isOpen={isBookmarkOpen} onClose={() => setIsBookmarkOpen(false)} />
      <DramaComingSoonModal isOpen={isDramaSoonOpen} onClose={() => setIsDramaSoonOpen(false)} />
    </>
  );
}
