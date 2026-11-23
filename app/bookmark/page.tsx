'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Play, BookOpen, Trash2, Search, ArrowRight, Film } from 'lucide-react';
import { BookmarkItem, getBookmarks, removeBookmark, clearBookmarks } from '@/lib/history';

export default function BookmarkPage() {
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'anime' | 'comic'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  const loadBookmarks = () => {
    setItems(getBookmarks());
  };

  useEffect(() => {
    setMounted(true);
    loadBookmarks();

    const handleUpdate = () => {
      loadBookmarks();
    };

    window.addEventListener('kurunime:bookmarks-updated', handleUpdate);
    return () => window.removeEventListener('kurunime:bookmarks-updated', handleUpdate);
  }, []);

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeBookmark(id);
    setItems((prev) => prev.filter((b) => b.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua bookmark?')) {
      clearBookmarks();
      setItems([]);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-10 w-48 bg-neutral-900 rounded-xl animate-pulse mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-neutral-900/60 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredItems = items.filter((item) => {
    // Type filter
    if (filter === 'anime' && item.type !== 'anime') return false;
    if (filter === 'comic' && item.type !== 'comic') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSub = item.subTitle?.toLowerCase().includes(q);
      return matchTitle || matchSub;
    }

    return true;
  });

  const animeCount = items.filter((i) => i.type === 'anime').length;
  const comicCount = items.filter((i) => i.type === 'comic').length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Breadcrumb & Title */}
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3">
            <Link href="/" className="hover:text-rose-400">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-neutral-200">Bookmark</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600/20 text-rose-500 border border-rose-500/30">
                  <Bookmark className="h-5 w-5 fill-rose-500" />
                </span>
                <span>Bookmark Saya</span>
                <span className="rounded-full bg-rose-600/20 px-2.5 py-0.5 text-xs font-bold text-rose-400">
                  {items.length}
                </span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-400">
                Daftar anime dan komik favorit yang Anda simpan untuk ditonton dan dibaca kembali.
              </p>
            </div>

            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl border border-rose-900/40 bg-rose-950/20 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-900/30 hover:border-rose-800 transition-all active:scale-95"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Semua</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-800 pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-[#141414] p-1 rounded-xl border border-neutral-800/80">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Semua ({items.length})
            </button>
            <button
              onClick={() => setFilter('anime')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filter === 'anime'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Anime ({animeCount})</span>
            </button>
            <button
              onClick={() => setFilter('comic')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filter === 'comic'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BookOpen className="h-3 w-3" />
              <span>Komik ({comicCount})</span>
            </button>
          </div>

          {/* Quick Search */}
          {items.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Cari dalam bookmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          )}
        </div>

        {/* Grid Content */}
        {filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-neutral-800/80 bg-[#121212]/80 p-12 text-center max-w-lg mx-auto backdrop-blur-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-600 mb-4">
              <Bookmark className="h-8 w-8 text-neutral-500" />
            </div>

            <h3 className="text-base font-bold text-white">
              {items.length === 0 ? 'Belum Ada Bookmark Tersimpan' : 'Tidak Ada Bookmark yang Cocok'}
            </h3>

            <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
              {items.length === 0
                ? 'Jelajahi berbagai judul anime dan komik favorit Anda, lalu klik tombol Bookmark untuk menyimpannya di sini.'
                : 'Tidak ada anime atau komik yang sesuai dengan pencarian atau filter yang dipilih.'}
            </p>

            {items.length === 0 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link
                  href="/"
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-all active:scale-95"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Jelajahi Anime</span>
                </Link>

                <Link
                  href="/komik"
                  className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-200 hover:border-neutral-600 hover:text-white transition-all active:scale-95"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Jelajahi Komik</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-2xl border border-neutral-800 bg-[#141414] overflow-hidden shadow-lg hover:border-rose-500/50 hover:shadow-rose-600/10 transition-all duration-300"
              >
                {/* Poster Container */}
                <Link href={item.url} className="relative aspect-[2/3] w-full overflow-hidden bg-black">
                  <img
                    src={item.poster || '/placeholder.svg'}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Type Badge Top Left */}
                  <div className="absolute top-2 left-2">
                    {item.type === 'anime' ? (
                      <span className="flex items-center gap-1 rounded-md bg-rose-600/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        <Play className="h-2.5 w-2.5 fill-current" />
                        Anime
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-md bg-black/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-neutral-200 border border-white/10">
                        <BookOpen className="h-2.5 w-2.5" />
                        Komik
                      </span>
                    )}
                  </div>

                  {/* Remove Button Top Right */}
                  <button
                    onClick={(e) => handleRemove(e, item.id)}
                    title="Hapus bookmark"
                    aria-label="Hapus bookmark"
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/80 backdrop-blur-sm text-neutral-400 hover:text-rose-400 hover:bg-neutral-900 border border-white/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  {/* SubTitle Bottom */}
                  {item.subTitle && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="rounded bg-black/70 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-rose-300 border border-white/10 truncate block">
                        {item.subTitle}
                      </span>
                    </div>
                  )}
                </Link>

                {/* Info & Action Bottom */}
                <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                  <Link href={item.url}>
                    <h3
                      title={item.title}
                      className="text-xs sm:text-sm font-bold text-neutral-200 group-hover:text-rose-400 line-clamp-2 transition-colors"
                    >
                      {item.title}
                    </h3>
                  </Link>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-500">
                      {new Date(item.timestamp).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>

                    <Link
                      href={item.url}
                      className="flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <span>{item.type === 'anime' ? 'Nonton' : 'Baca'}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
