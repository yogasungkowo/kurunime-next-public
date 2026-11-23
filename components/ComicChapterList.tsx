'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, ArrowRight } from 'lucide-react';
import { ComicChapterItem } from '@/lib/api/types';

interface ComicChapterListProps {
  comicSlug: string;
  chapters: ComicChapterItem[];
}

export default function ComicChapterList({
  comicSlug,
  chapters,
}: ComicChapterListProps) {
  const [search, setSearch] = useState('');

  const filtered = chapters.filter((ch) =>
    ch.title.toLowerCase().includes(search.toLowerCase()) ||
    (ch.number !== undefined && String(ch.number).includes(search))
  );

  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#141414] p-6 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-rose-500" />
          <h3 className="text-lg font-bold text-white">
            Daftar Chapter ({chapters.length})
          </h3>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor chapter..."
            className="w-full rounded-xl bg-black border border-neutral-800 pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Chapters Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400">
          Chapter tidak ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
          {filtered.map((ch) => {
            const chParam = ch.number !== undefined ? String(ch.number) : ch.slug;
            return (
              <Link
                key={ch.slug || ch.title}
                href={`/komik/chapter/${comicSlug}-${chParam}`}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-rose-500/50 hover:bg-[#1a1a1a] group transition-all"
              >
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-neutral-200 group-hover:text-rose-400 block truncate">
                    {ch.title}
                  </span>
                  {ch.date && (
                    <span className="text-[10px] text-neutral-400 block mt-0.5">
                      {ch.date}
                    </span>
                  )}
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-600 group-hover:text-rose-400 transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
