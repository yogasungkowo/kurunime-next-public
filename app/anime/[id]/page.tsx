import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';
import AnimePlayerSection from '@/components/AnimePlayerSection';
import AnimeCard from '@/components/AnimeCard';
import BookmarkButton from '@/components/BookmarkButton';
import { getAnimeDetail } from '@/lib/api/anime';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const anime = await getAnimeDetail(id);
  if (!anime) return { title: 'Anime Tidak Ditemukan - Kurunime' };

  const title = `Nonton ${anime.title} Sub Indo HD Gratis`;
  const description =
    anime.synopsis?.slice(0, 160) ||
    `Nonton anime ${anime.title} subtitle Indonesia kualitas HD gratis tanpa buffering di Kurunime. Lengkap dengan streaming server mirror dan download batch.`;

  return {
    title,
    description,
    keywords: [
      `${anime.title} Sub Indo`,
      `Nonton ${anime.title}`,
      `Streaming ${anime.title} Subtitle Indonesia`,
      `Download ${anime.title} Sub Indo`,
      `${anime.title} Episode Terbaru`,
      'Anime Subtitle Indonesia',
      'Nonton Anime Sub Indo',
      'Kurunime Anime',
    ],
    alternates: {
      canonical: `/anime/${id}`,
    },
    openGraph: {
      title: `${anime.title} Subtitle Indonesia - Kurunime`,
      description,
      url: `/anime/${id}`,
      type: anime.type === 'Movie' ? 'video.movie' : 'video.tv_show',
      images: [
        {
          url: anime.poster || '/logo.png',
          alt: anime.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${anime.title} Subtitle Indonesia`,
      description,
      images: [anime.poster || '/logo.png'],
    },
  };
}

export default async function AnimeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const anime = await getAnimeDetail(id);

  if (!anime) {
    notFound();
  }

  const initialEpisodeId = anime.episodesList?.[0]?.episodeId || '';

  // Structured Data (JSON-LD) for Google Search
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': anime.type === 'Movie' ? 'Movie' : 'TVSeries',
    name: anime.title,
    alternateName: anime.titleJapanese || undefined,
    description: anime.synopsis || `Nonton anime ${anime.title} subtitle Indonesia gratis di Kurunime.`,
    image: anime.poster || undefined,
    genre: anime.genres || [],
    numberOfEpisodes: anime.episodes || anime.episodesList.length || undefined,
    aggregateRating:
      anime.rating && anime.rating > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: anime.rating.toFixed(1),
            bestRating: '10',
            worstRating: '1',
            ratingCount: '150',
          }
        : undefined,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/" className="hover:text-rose-400">Beranda</Link>
          <span>/</span>
          <Link href="/list/ongoing" className="hover:text-rose-400">Anime</Link>
          <span>/</span>
          <span className="text-neutral-200 line-clamp-1">{anime.title}</span>
        </div>

        {/* 1. Main Player & Episode Section */}
        {anime.episodesList.length > 0 ? (
          <AnimePlayerSection anime={anime} initialEpisodeId={initialEpisodeId} />
        ) : (
          <div className="rounded-2xl border border-neutral-800 bg-[#141414] p-8 text-center text-neutral-400">
            Daftar episode belum tersedia untuk anime ini.
          </div>
        )}

        {/* 2. Metadata & Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 rounded-2xl border border-neutral-800 bg-[#141414] p-6 sm:p-8 backdrop-blur-md">
          {/* Poster Column */}
          <div className="md:col-span-1">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl ring-1 ring-white/10 shadow-xl bg-black">
              <img
                src={anime.poster || '/placeholder.svg'}
                alt={anime.title}
                className="h-full w-full object-cover"
              />
              {anime.rating && (
                <div className="absolute top-3 right-3 flex items-center gap-1 rounded bg-black/80 px-2 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{anime.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info Column */}
          <div className="md:col-span-3 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                  {anime.status || 'Ongoing'}
                </span>
                <span className="rounded bg-neutral-800 border border-neutral-700 px-2.5 py-0.5 text-xs font-medium text-neutral-200">
                  {anime.type || 'TV'}
                </span>
                {anime.quality && (
                  <span className="rounded bg-black border border-white/10 px-2.5 py-0.5 text-xs font-medium text-neutral-300">
                    {anime.quality}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {anime.title}
                  </h1>
                  {anime.titleJapanese && (
                    <p className="mt-1 text-sm font-medium text-neutral-400">
                      {anime.titleJapanese}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <BookmarkButton
                    id={`anime-${id}`}
                    type="anime"
                    slug={id}
                    title={anime.title}
                    poster={anime.poster}
                    subTitle={`${anime.type || 'Anime'} • ${anime.episodes || anime.episodesList.length || '?'} Ep`}
                    url={`/anime/${id}`}
                  />
                </div>
              </div>

              {/* Genre Pills */}
              {anime.genreList && anime.genreList.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {anime.genreList.map((g) => (
                    <Link
                      key={g.genreId || g.title}
                      href={`/genre/${g.genreId}`}
                      className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1 text-xs font-medium text-neutral-300 hover:border-rose-500/50 hover:text-rose-400 transition-colors"
                    >
                      {g.title}
                    </Link>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-2">
                  Sinopsis
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                  {anime.synopsis || 'Sinopsis belum tersedia.'}
                </p>
              </div>
            </div>

            {/* Quick Meta Grid */}
            <div className="mt-6 pt-6 border-t border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-neutral-300">
              <div>
                <span className="block text-neutral-500 text-[11px]">Studio</span>
                <span className="font-semibold">{anime.studio || '-'}</span>
              </div>
              <div>
                <span className="block text-neutral-500 text-[11px]">Musim / Rilis</span>
                <span className="font-semibold">{anime.season || anime.aired || '-'}</span>
              </div>
              <div>
                <span className="block text-neutral-500 text-[11px]">Total Episode</span>
                <span className="font-semibold">{anime.episodes || anime.episodesList.length || '-'} Ep</span>
              </div>
              <div>
                <span className="block text-neutral-500 text-[11px]">Durasi</span>
                <span className="font-semibold">{anime.duration || '24 min'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Recommendations Section */}
        {anime.recommendations && anime.recommendations.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-neutral-800">
              <div className="h-6 w-1.5 rounded-full bg-rose-600 shadow-sm shadow-rose-600/50" />
              <h3 className="text-xl font-bold text-white">
                Rekomendasi Anime Serupa
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {anime.recommendations.slice(0, 6).map((rec) => (
                <AnimeCard key={rec.slug || rec.id} anime={rec} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
