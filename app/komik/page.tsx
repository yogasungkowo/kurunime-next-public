import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ComicCard from '@/components/ComicCard';
import { getComicList } from '@/lib/api/comic';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    type?: string;
    order?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Baca Komik Manga Manhwa Bahasa Indonesia Terlengkap - Kurunime',
  description:
    'Tempat baca komik manga manhwa Bahasa Indonesia terlengkap dan terupdate setiap hari: Manhwa Korea, Manga Jepang, Manhua China gratis tanpa iklan mengganggu di Kurunime.',
  keywords: [
    'Komik Manga manhwa bahasa indonesia',
    'baca komik sub indo',
    'baca manga bahasa indonesia',
    'baca manhwa sub indo',
    'manhwa indo',
    'manga sub indo',
    'manhua bahasa indonesia',
    'komikcast',
    'westmanga',
    'kiryuu',
    'komikindo',
    'kurunime komik',
  ],
  alternates: {
    canonical: '/komik',
  },
  openGraph: {
    title: 'Baca Komik Manga Manhwa Bahasa Indonesia Terlengkap - Kurunime',
    description:
      'Tempat baca komik online Bahasa Indonesia terlengkap: Manhwa Korea, Manga Jepang, Manhua China update setiap hari.',
    url: '/komik',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Baca Komik Manga Manhwa Bahasa Indonesia Terlengkap - Kurunime',
    description:
      'Tempat baca komik online Bahasa Indonesia terlengkap: Manhwa Korea, Manga Jepang, Manhua China update setiap hari.',
  },
};

export default async function KomikIndexPage({ searchParams }: PageProps) {
  const { page: rawPage, type, order } = await searchParams;
  const page = parseInt(rawPage || '1', 10) || 1;

  const { list, pagination } = await getComicList({
    page,
    type: type || undefined,
    order: order || undefined,
  });

  const types = [
    { label: 'Semua', value: '' },
    { label: 'Manhwa (Korea)', value: 'manhwa' },
    { label: 'Manga (Jepang)', value: 'manga' },
    { label: 'Manhua (China)', value: 'manhua' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-2 rounded-full bg-rose-600 shadow-sm shadow-rose-600/50" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Koleksi Komik & Manga
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Baca ribuan judul Manhwa, Manga, dan Manhua subtitle Indonesia gratis.
              </p>
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {types.map((t) => {
              const isActive = (type || '') === t.value;
              return (
                <Link
                  key={t.label}
                  href={`/komik${t.value ? `?type=${t.value}` : ''}`}
                  className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Comics Grid */}
        {list.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-400">
            Tidak ada komik ditemukan untuk filter ini.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {list.map((comic) => (
              <ComicCard key={comic.slug} comic={comic} />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-neutral-800">
          {pagination.hasPrev ? (
            <Link
              href={`/komik?page=${page - 1}${type ? `&type=${type}` : ''}`}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-200 hover:border-neutral-700 hover:text-rose-400 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Sebelumnya</span>
            </Link>
          ) : (
            <button
              disabled
              className="flex items-center gap-1.5 rounded-xl bg-neutral-900/40 border border-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-600 cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Sebelumnya</span>
            </button>
          )}

          <span className="rounded-xl bg-rose-600/20 px-4 py-2 text-xs font-bold text-rose-300 border border-rose-500/30">
            Halaman {page} dari {pagination.lastPage}
          </span>

          {pagination.hasNext ? (
            <Link
              href={`/komik?page=${page + 1}${type ? `&type=${type}` : ''}`}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-200 hover:border-neutral-700 hover:text-rose-400 transition-colors"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              disabled
              className="flex items-center gap-1.5 rounded-xl bg-neutral-900/40 border border-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-600 cursor-not-allowed"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
