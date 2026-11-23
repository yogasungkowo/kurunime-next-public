import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AnimeCard from '@/components/AnimeCard';
import { getAnimeList } from '@/lib/api/anime';

interface PageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { type } = await params;
  const isOngoing = type === 'ongoing' || type === 'sedang-tayang';
  const title = isOngoing
    ? 'Daftar Anime Sedang Tayang (Ongoing) Sub Indo Terbaru'
    : 'Daftar Anime Tamat (Completed) Subtitle Indonesia Terlengkap';
  const description = isOngoing
    ? 'Kumpulan anime ongoing terbaru subtitle Indonesia yang sedang tayang dengan jadwal rilis update setiap hari kualitas HD gratis di Kurunime.'
    : 'Daftar maraton anime completed tamat subtitle Indonesia full episode kualitas HD gratis tanpa iklan mengganggu di Kurunime.';

  return {
    title,
    description,
    keywords: [
      isOngoing ? 'Anime Ongoing Sub Indo' : 'Anime Tamat Sub Indo',
      'Nonton Anime Sub Indo',
      'Anime Subtitle Indonesia',
      'Streaming Anime Sub Indo HD',
      'Download Anime Sub Indo Batch',
      'Kurunime Anime',
    ],
    alternates: {
      canonical: `/list/${type}`,
    },
    openGraph: {
      title: `${title} - Kurunime`,
      description,
      url: `/list/${type}`,
      images: ['/logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/logo.png'],
    },
  };
}

export default async function AnimeListPage({ params, searchParams }: PageProps) {
  const { type } = await params;
  const { page: rawPage } = await searchParams;
  const page = parseInt(rawPage || '1', 10) || 1;

  const validTypes = ['ongoing', 'completed', 'sedang-tayang', 'tamat'];
  if (!validTypes.includes(type)) {
    notFound();
  }

  const normalizedType = type === 'completed' || type === 'tamat' ? 'completed' : 'ongoing';
  const { list, pagination } = await getAnimeList(normalizedType, page);

  const isOngoing = normalizedType === 'ongoing';

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-2 rounded-full bg-rose-600 shadow-sm shadow-rose-600/50" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isOngoing ? 'Anime Sedang Tayang (Ongoing)' : 'Anime Tamat (Completed)'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                {isOngoing
                  ? 'Kumpulan anime yang masih tayang mingguan dengan jadwal rilis teratur.'
                  : 'Koleksi anime full episode yang sudah selesai tayang untuk maraton.'}
              </p>
            </div>
          </div>

          {/* Type Toggle Pills */}
          <div className="flex items-center gap-2">
            <Link
              href="/list/ongoing"
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isOngoing
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Ongoing
            </Link>
            <Link
              href="/list/completed"
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                !isOngoing
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Tamat
            </Link>
          </div>
        </div>

        {/* Anime Grid */}
        {list.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-400">
            Tidak ada anime ditemukan untuk halaman ini.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {list.map((anime) => (
              <AnimeCard key={anime.slug || anime.id} anime={anime} />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-neutral-800">
          {page > 1 ? (
            <Link
              href={`/list/${normalizedType}?page=${page - 1}`}
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
            Halaman {page}
          </span>

          {pagination?.hasNextPage ? (
            <Link
              href={`/list/${normalizedType}?page=${page + 1}`}
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
