'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, X, Trash2, Play, BookOpen, Film, Flame } from 'lucide-react';
import { WatchHistoryItem } from '@/lib/api/types';
import { getHistory, clearHistory } from '@/lib/history';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryDrawer({ isOpen, onClose }: HistoryDrawerProps) {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setItems(getHistory());
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClear = () => {
    clearHistory();
    setItems([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-[#121212] border-l border-neutral-800 p-6 flex flex-col z-10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-rose-500" />
            <h3 className="text-lg font-bold text-white">Riwayat Terakhir</h3>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={handleClear}
                title="Hapus semua riwayat"
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {items.length === 0 ? (
            <div className="py-20 text-center text-sm text-neutral-400">
              Belum ada riwayat tonton atau baca tersimpan.
            </div>
          ) : (
            items.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl p-2.5 bg-neutral-900/80 hover:bg-neutral-800 transition-colors border border-neutral-800 group"
              >
                <img
                  src={item.poster || '/placeholder.svg'}
                  alt={item.title}
                  className="h-16 w-12 rounded-lg object-cover ring-1 ring-white/10 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    {item.type === 'anime' ? (
                      <span className="flex items-center gap-1 rounded bg-rose-600/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300">
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
                    <span className="text-xs text-neutral-400 truncate">{item.subTitle}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-100 group-hover:text-rose-400 truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {new Date(item.timestamp).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
