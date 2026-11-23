import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, Film, Tv, Calendar, Tag, Info, ArrowLeft, Video } from 'lucide-react';
import MoviePlayerSection from '@/components/MoviePlayerSection';
import MovieCard from '@/components/MovieCard';
import BookmarkButton from '@/components/BookmarkButton';
import { getMovieDetail, getTrendingMovies } from '@/lib/api/movie';

interface PageProps {
  params: Promise<{
    type: string;
    id: string;
  }>;
  searchParams: Promise<{
    season?: string;
    episode?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { type, id } = await params;
  const { season: rawSeason, episode: rawEpisode } = await searchParams;
  const season = parseInt(rawSeason || '1', 10) || 1;
  const episode = parseInt(rawEpisode || '1', 10) || 1;

  const validMediaType = type === 'tv' ? 'tv' : 'movie';
  const movie = await getMovieDetail(validMediaType, id, season, episode);

  if (!movie) {
    return { title: 'Film Tidak Ditemukan - Kurunime' };
  }

  const isTv = validMediaType === 'tv';
  const epSuffix = isTv ? ` Season ${season} Episode ${episode}` : '';
  const title = `Nonton ${movie.title}${epSuffix} Sub Indo HD - Kurunime`;
  const description =
    movie.overview?.slice(0, 160) ||
    `Nonton streaming ${movie.title}${epSuffix} subtitle Indonesia kualitas HD gratis tanpa buffering di Kurunime. Dilengkapi 7 server embed cadangan dan subtitle resmi .SRT.`;

  return {
    title,
    description,
    keywords: [
      `${movie.title} Sub Indo`,
      `Nonton ${movie.title}`,
      `Streaming ${movie.title} Subtitle Indonesia`,
      `Download ${movie.title} Sub Indo`,
      `${movie.title} LK21`,
      `${movie.title} IDLIX`,
      'Nonton Film Sub Indo',
      'Streaming Movie Subtitle Indonesia',
      'Kurunime Movie',
    ],
    alternates: {
      canonical: `/movie/${validMediaType}/${id}`,
    },
    openGraph: {
      title: `${movie.title} Subtitle Indonesia - Kurunime`,
      description,
      url: `/movie/${validMediaType}/${id}`,
      type: isTv ? 'video.tv_show' : 'video.movie',
      images: [
        {
          url: movie.backdrop || movie.poster || '/logo.png',
          alt: movie.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${movie.title} Sub Indo - Kurunime`,
      description,
      images: [movie.backdrop || movie.poster || '/logo.png'],
    },
  };
}

export default async function MovieWatchPage({ params, searchParams }: PageProps) {
  const { type: rawType, id } = await params;
  const { season: rawSeason, episode: rawEpisode } = await searchParams;

  const mediaType = rawType === 'tv' ? 'tv' : 'movie';
  const season = parseInt(rawSeason || '1', 10) || 1;
  const episode = parseInt(rawEpisode || '1', 10) || 1;

  const movie = await getMovieDetail(mediaType, id, season, episode);

  if (!movie) {
    notFound();
  }

  // Fetch recommendations (trending in same media type)
  const recommendations = await getTrendingMovies(mediaType);
  const relatedMovies = recommendations.filter((m) => String(m.id) !== String(movie.id)).slice(0, 12);

  const isTv = mediaType === 'tv';

  // JSON-LD Structured Data for Google Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': isTv ? 'TVSeries' : 'Movie',
    name: movie.title,
    description: movie.overview || `Nonton ${movie.title} subtitle Indonesia gratis di Kurunime.`,
    image: movie.poster || undefined,
    genre: movie.genres,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#0a0a0a] pb-24 pt-4 sm:pt-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Link href="/" className="hover:text-rose-400 transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/movie" className="hover:text-rose-400 transition-colors">
              Movie
            </Link>
            <span>/</span>
            <Link
              href={`/movie?type=${mediaType}`}
              className="hover:text-rose-400 transition-colors"
            >
              {isTv ? 'Serial TV' : 'Film'}
            </Link>
            <span>/</span>
            <span className="text-white truncate max-w-[200px] sm:max-w-xs">{movie.title}</span>
          </div>

          {/* Interactive Player Section */}
          <MoviePlayerSection
            movie={movie}
            initialSeason={season}
            initialEpisode={episode}
          />

          {/* Movie Metadata Details Box */}
          <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-[#121212] p-5 sm:p-8 backdrop-blur-md">
            {/* Ambient Backdrop Glow */}
            {movie.backdrop && (
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <img
                  src={movie.backdrop}
                  alt={movie.title}
                  className="h-full w-full object-cover filter blur-xl"
                />
              </div>
            )}

            <div className="relative z-10 flex flex-col md:flex-row gap-6 sm:gap-8">
              {/* Poster Art */}
              <div className="shrink-0 w-36 sm:w-48 mx-auto md:mx-0">
                <img
                  src={movie.poster || '/placeholder.svg'}
                  alt={movie.title}
                  className="w-full aspect-[2/3] rounded-xl object-cover shadow-2xl ring-1 ring-white/10"
                />
              </div>

              {/* Text Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="rounded bg-rose-600 px-2 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                      {isTv ? 'Serial TV' : 'Movie'}
                    </span>
                    <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs font-medium text-neutral-300 border border-white/10">
                      HD
                    </span>
                    <span className="rounded bg-emerald-600/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      Sub Indo
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {movie.title}
                  </h1>
                </div>

                {/* Genre Tags */}
                {movie.genres.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-lg bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-xs text-neutral-300"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Synopsis / Overview */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-rose-500" />
                    Sinopsis Film
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {movie.overview ||
                      'Sinopsis untuk film ini belum tersedia. Nikmati langsung streaming film dan serial TV kualitas HD dengan berbagai pilihan server di atas.'}
                  </p>
                </div>

                {/* Quick actions */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <BookmarkButton
                    id={isTv ? `tv-${movie.id}` : `movie-${movie.id}`}
                    type="movie"
                    slug={`${movie.type}/${movie.id}`}
                    title={movie.title}
                    poster={movie.poster || undefined}
                    subTitle={isTv ? 'Serial TV' : 'Film Box Office'}
                    url={`/movie/${movie.type}/${movie.id}`}
                  />

                  <Link
                    href="/movie"
                    className="flex items-center gap-1.5 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Katalog Film Lainnya
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Related / Trending Recommendations Section */}
          {relatedMovies.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1.5 rounded-full bg-rose-600" />
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {isTv ? 'Serial TV Rekomendasi Lainnya' : 'Film Bioskop Populer Lainnya'}
                  </h3>
                </div>

                <Link
                  href={`/movie?type=${mediaType}`}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-400"
                >
                  Lihat Semua →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
                {relatedMovies.map((item) => (
                  <MovieCard key={`${item.type}-${item.id}`} movie={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
