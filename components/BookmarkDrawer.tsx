'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, X, Trash2, Play, BookOpen, ExternalLink, Film, Flame } from 'lucide-react';
import { BookmarkItem, getBookmarks, removeBookmark, clearBookmarks } from '@/lib/history';

interface BookmarkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookmarkDrawer({ isOpen, onClose }: BookmarkDrawerProps) {
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'anime' | 'comic' | 'movie' | 'drama'>('all');

  const reloadBookmarks = () => {
    setItems(getBookmarks());
  };

  useEffect(() => {
    if (isOpen) {
      reloadBookmarks();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleUpdate = () => {
      reloadBookmarks();
    };

    window.addEventListener('kurunime:bookmarks-updated', handleUpdate);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('kurunime:bookmarks-updated', handleUpdate);
    };
  }, [isOpen]);

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeBookmark(id);
    setItems((prev) => prev.filter((b) => b.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Yakin ingin menghapus semua bookmark?')) {
      clearBookmarks();
      setItems([]);
    }
  };

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    if (filter === 'anime') return item.type === 'anime';
    if (filter === 'comic') return item.type === 'comic';
    if (filter === 'movie') return item.type === 'movie';
    if (filter === 'drama') return item.type === 'drama';
    return true;
  });

  const animeCount = items.filter((i) => i.type === 'anime').length;
  const comicCount = items.filter((i) => i.type === 'comic').length;
  const movieCount = items.filter((i) => i.type === 'movie').length;
  const dramaCount = items.filter((i) => i.type === 'drama').length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-[#121212] border-l border-neutral-800 p-6 flex flex-col z-10 shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600/20 text-rose-500 border border-rose-500/30">
              <Bookmark className="h-4 w-4 fill-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Bookmark Saya</span>
                <span className="rounded-full bg-rose-600/20 px-2 py-0.5 text-xs font-bold text-rose-400">
                  {items.length}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                title="Hapus semua bookmark"
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        {items.length > 0 && (
          <div className="flex items-center gap-1 pt-3 pb-2 border-b border-neutral-800/60 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 min-w-[50px] rounded-lg py-1.5 text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              Semua ({items.length})
            </button>
            <button
              onClick={() => setFilter('anime')}
              className={`flex-1 min-w-[65px] rounded-lg py-1.5 text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                filter === 'anime'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Anime ({animeCount})</span>
            </button>
            <button
              onClick={() => setFilter('comic')}
              className={`flex-1 min-w-[65px] rounded-lg py-1.5 text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                filter === 'comic'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <BookOpen className="h-3 w-3" />
              <span>Komik ({comicCount})</span>
            </button>
            <button
              onClick={() => setFilter('movie')}
              className={`flex-1 min-w-[65px] rounded-lg py-1.5 text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                filter === 'movie'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Film className="h-3 w-3" />
              <span>Movie ({movieCount})</span>
            </button>
            <button
              onClick={() => setFilter('drama')}
              className={`flex-1 min-w-[65px] rounded-lg py-1.5 text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                filter === 'drama'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Flame className="h-3 w-3 fill-current" />
              <span>Drama ({dramaCount})</span>
            </button>
          </div>
        )}

        {/* Content List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center px-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 mb-4">
                <Bookmark className="h-7 w-7 text-neutral-600" />
              </div>
              <h4 className="text-sm font-bold text-neutral-300">
                {items.length === 0 ? 'Belum Ada Bookmark' : 'Tidak ada item dalam kategori ini'}
              </h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                {items.length === 0
                  ? 'Simpan anime dan komik favorit Anda dengan menekan tombol Bookmark pada halaman detail.'
                  : 'Coba ubah tab filter di atas untuk melihat bookmark lainnya.'}
              </p>
              {items.length === 0 && (
                <div className="flex items-center justify-center gap-2 mt-5">
                  <Link
                    href="/"
                    onClick={onClose}
                    className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-500 transition-colors"
                  >
                    Cari Anime
                  </Link>
                  <Link
                    href="/komik"
                    onClick={onClose}
                    className="rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
                  >
                    Cari Komik
                  </Link>
                </div>
              )}
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="relative flex items-center gap-3 rounded-xl p-2.5 bg-neutral-900/80 hover:bg-neutral-800 transition-all border border-neutral-800 group"
              >
                <Link
                  href={item.url}
                  onClick={onClose}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <img
                    src={item.poster || '/placeholder.svg'}
                    alt={item.title}
                    className="h-16 w-12 rounded-lg object-cover ring-1 ring-white/10 shrink-0 bg-black"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {item.type === 'anime' ? (
                        <span className="flex items-center gap-1 rounded bg-rose-600/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/20">
                          <Play className="h-2.5 w-2.5 fill-current" />
                          Anime
                        </span>
                      ) : item.type === 'movie' ? (
                        <span className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/20">
                          <Film className="h-2.5 w-2.5" />
                          Movie
                        </span>
                      ) : item.type === 'drama' ? (
                        <span className="flex items-center gap-1 rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          <Flame className="h-2.5 w-2.5 fill-white" />
                          Drama
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-bold text-neutral-300 border border-white/10">
                          <BookOpen className="h-2.5 w-2.5" />
                          Komik
                        </span>
                      )}
                      {item.subTitle && (
                        <span className="text-[11px] text-neutral-400 truncate">
                          {item.subTitle}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-neutral-100 group-hover:text-rose-400 truncate">
                      {item.title}
                    </h4>

                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      Ditambahkan {new Date(item.timestamp).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </Link>

                {/* Remove button */}
                <button
                  onClick={(e) => handleRemove(e, item.id)}
                  title="Hapus dari bookmark"
                  aria-label="Hapus bookmark"
                  className="p-2 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-700/50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Link to Dedicated Bookmark Page */}
        {items.length > 0 && (
          <div className="pt-3 border-t border-neutral-800">
            <Link
              href="/bookmark"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 hover:border-rose-500/40 hover:text-white hover:bg-neutral-800 transition-all"
            >
              <span>Buka Halaman Bookmark Lengkap</span>
              <ExternalLink className="h-3.5 w-3.5 text-rose-500" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
