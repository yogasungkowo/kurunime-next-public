import Link from 'next/link';
import { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { getAnimeGenres } from '@/lib/api/anime';

export const metadata: Metadata = {
  title: 'Daftar Genre Anime Subtitle Indonesia Terlengkap - Kurunime',
  description:
    'Temukan anime berdasarkan genre favoritmu: Action, Isekai, Romance, Fantasy, Comedy, Sci-Fi, Slice of Life, dan lainnya dengan subtitle Indonesia di Kurunime.',
  keywords: [
    'genre anime sub indo',
    'anime isekai sub indo',
    'anime action sub indo',
    'anime romance sub indo',
    'anime fantasy subtitle indonesia',
    'nonton anime sub indo',
    'kurunime genre',
  ],
  alternates: {
    canonical: '/genre',
  },
  openGraph: {
    title: 'Daftar Genre Anime Subtitle Indonesia Terlengkap - Kurunime',
    description:
      'Temukan anime berdasarkan genre favoritmu: Action, Isekai, Romance, Fantasy, Comedy, Sci-Fi, dan lainnya di Kurunime.',
    url: '/genre',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daftar Genre Anime Subtitle Indonesia Terlengkap - Kurunime',
    description:
      'Temukan anime berdasarkan genre favoritmu: Action, Isekai, Romance, Fantasy, Comedy, Sci-Fi, dan lainnya di Kurunime.',
  },
};

export default async function GenreIndexPage() {
  const genres = await getAnimeGenres();

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-2 rounded-full bg-rose-600 shadow-sm shadow-rose-600/50" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Daftar Genre Anime
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Pilih kategori dan genre yang ingin kamu tonton.
              </p>
            </div>
          </div>
        </div>

        {/* Genres Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {genres.map((g) => (
            <Link
              key={g.genreId}
              href={`/genre/${g.genreId}`}
              className="group flex items-center justify-between rounded-xl p-3.5 bg-[#141414] border border-neutral-800 hover:border-rose-500/50 hover:bg-[#1a1a1a] transition-all shadow-sm"
            >
              <span className="text-sm font-semibold text-neutral-200 group-hover:text-rose-400 transition-colors">
                {g.title}
              </span>
              <Sparkles className="h-3.5 w-3.5 text-neutral-600 group-hover:text-rose-400 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
