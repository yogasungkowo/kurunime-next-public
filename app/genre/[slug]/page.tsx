import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AnimeCard from '@/components/AnimeCard';
import { getAnimeByGenre } from '@/lib/api/anime';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const formattedTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `Nonton Anime Genre ${formattedTitle} Subtitle Indonesia - Kurunime`,
    description: `Nonton streaming anime genre ${formattedTitle} subtitle Indonesia terbaru dan terlengkap gratis di Kurunime. Koleksi serial dan movie anime ${formattedTitle} kualitas HD.`,
    keywords: [
      `anime ${formattedTitle.toLowerCase()} sub indo`,
      `nonton anime ${formattedTitle.toLowerCase()}`,
      `anime genre ${formattedTitle.toLowerCase()} subtitle indonesia`,
      'nonton anime sub indo',
      'anime subtitle indonesia',
      'kurunime anime',
    ],
    alternates: {
      canonical: `/genre/${slug}`,
    },
    openGraph: {
      title: `Nonton Anime Genre ${formattedTitle} Subtitle Indonesia - Kurunime`,
      description: `Nonton streaming anime genre ${formattedTitle} subtitle Indonesia terbaru dan terlengkap gratis di Kurunime.`,
      url: `/genre/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Nonton Anime Genre ${formattedTitle} Subtitle Indonesia - Kurunime`,
      description: `Nonton streaming anime genre ${formattedTitle} subtitle Indonesia terbaru dan terlengkap gratis di Kurunime.`,
    },
  };
}

export default async function GenreDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: rawPage } = await searchParams;
  const page = parseInt(rawPage || '1', 10) || 1;

  const { list, pagination } = await getAnimeByGenre(slug, page);
  const formattedTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/" className="hover:text-rose-400">Beranda</Link>
          <span>/</span>
          <Link href="/genre" className="hover:text-rose-400">Genre</Link>
          <span>/</span>
          <span className="text-neutral-200 capitalize">{formattedTitle}</span>
        </div>

        {/* Header */}
        <div className="border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-2 rounded-full bg-rose-600 shadow-sm shadow-rose-600/50" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Genre: {formattedTitle}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Koleksi judul anime dengan genre {formattedTitle}.
              </p>
            </div>
          </div>
        </div>

        {/* Anime Grid */}
        {list.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-400">
            Belum ada anime untuk genre ini.
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
              href={`/genre/${slug}?page=${page - 1}`}
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
              href={`/genre/${slug}?page=${page + 1}`}
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
