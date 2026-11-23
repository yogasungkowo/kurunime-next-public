import { Metadata } from 'next';
import Link from 'next/link';
import {
  Film,
  Sparkles,
  Search,
  TrendingUp,
  Tv,
  Flame,
  Award,
  Clapperboard,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import MovieCard from '@/components/MovieCard';
import MovieHeroCarousel from '@/components/MovieHeroCarousel';
import TopRankedRow from '@/components/TopRankedRow';
import { getFilmList, searchMovies } from '@/lib/api/movie';
import { MovieItem } from '@/lib/api/types';

interface PageProps {
  searchParams: Promise<{
    type?: string;
    category?: string;
    q?: string;
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Nonton Film Sub Indo Gratis - Streaming Movie & Serial TV Terlengkap - Kurunime',
  description:
    'Nonton film dan serial TV subtitle Indonesia terlengkap dan terupdate gratis tanpa buffering di Kurunime. Koleksi film bioskop Hollywood, drama Asia, dan serial TV barat dengan 7 server streaming HD.',
  keywords: [
    'Nonton Film Sub Indo',
    'Streaming Movie Subtitle Indonesia',
    'Film Bioskop Sub Indo',
    'Serial TV Sub Indo',
    'Download Film Sub Indo',
    'Nonton Movie Gratis',
    'Kurunime Movie',
    'IDLIX Film',
    'LK21 Reborn',
  ],
  alternates: {
    canonical: '/movie',
  },
  openGraph: {
    title: 'Nonton Film Sub Indo Gratis - Streaming Movie & Serial TV - Kurunime',
    description:
      'Streaming film bioskop dan serial TV subtitle Indonesia kualitas HD gratis dengan multi server embed cadangan dan subtitle resmi.',
    url: '/movie',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nonton Film Sub Indo Gratis - Kurunime',
    description:
      'Streaming film bioskop dan serial TV subtitle Indonesia kualitas HD gratis dengan multi server cadangan.',
  },
};

type ValidCategory = 'trending' | 'popular' | 'now-playing' | 'top-rated';

export default async function MovieIndexPage({ searchParams }: PageProps) {
  const {
    type: rawType,
    category: rawCategory,
    q: rawQuery,
    page: rawPage,
  } = await searchParams;

  const currentType = rawType === 'tv' ? 'tv' : 'movie';
  const query = (rawQuery || '').trim();
  const page = Math.max(1, parseInt(rawPage || '1', 10) || 1);

  // Validate category
  const validCategories: ValidCategory[] = ['trending', 'popular', 'now-playing', 'top-rated'];
  let currentCategory: ValidCategory = validCategories.includes(rawCategory as ValidCategory)
    ? (rawCategory as ValidCategory)
    : 'trending';

  // now-playing is only available for movies
  if (currentType === 'tv' && currentCategory === 'now-playing') {
    currentCategory = 'popular';
  }

  let movies: MovieItem[] = [];
  let totalPages = 1;
  let totalResults = 0;
  let isSearch = false;

  const LIMIT = 24;

  if (query) {
    isSearch = true;
    const searchRes = await searchMovies(query, currentType, page, LIMIT);
    movies = searchRes.results;
    totalPages = searchRes.totalPages;
    totalResults = searchRes.totalResults;
  } else {
    const filmRes = await getFilmList({
      category: currentCategory,
      type: currentType,
      page,
      limit: LIMIT,
    });
    movies = filmRes.results;
    totalPages = filmRes.totalPages;
    totalResults = filmRes.totalResults;
  }

  const isFirstPage = page === 1;
  const isDefaultView = !isSearch && isFirstPage && currentCategory === 'trending';

  // Sub-category options
  const categoryOptions = [
    { id: 'trending', label: 'Trending Pekan Ini', icon: Flame },
    { id: 'popular', label: 'Paling Populer', icon: TrendingUp },
    ...(currentType === 'movie'
      ? [{ id: 'now-playing', label: 'Sedang Tayang di Bioskop', icon: Clapperboard }]
      : []),
    { id: 'top-rated', label: 'Rating Tertinggi', icon: Award },
  ];

  // Helper to generate pagination URLs
  const buildPageUrl = (targetPage: number) => {
    const p = new URLSearchParams();
    if (currentType) p.set('type', currentType);
    if (query) {
      p.set('q', query);
    } else if (currentCategory && currentCategory !== 'trending') {
      p.set('category', currentCategory);
    }
    p.set('page', String(targetPage));
    return `/movie?${p.toString()}`;
  };

  // Generate page numbers to display
  const pageNumbers: number[] = [];
  const maxDisplayedPages = 5;
  let startPage = Math.max(1, page - 2);
  let endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);
  if (endPage - startPage + 1 < maxDisplayedPages) {
    startPage = Math.max(1, endPage - maxDisplayedPages + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 pt-4 sm:pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* 1. Cinematic Hero Carousel (Top 6 Trending on Page 1) */}
        {isDefaultView && movies.length > 0 && (
          <section className="space-y-4">
            <MovieHeroCarousel items={movies.slice(0, 6)} />
          </section>
        )}

        {/* 2. Top 10 Styled Ranking Shelf (Netflix-Style Giant Numbers) */}
        {isDefaultView && movies.length >= 5 && (
          <section className="pt-2 sm:pt-4">
            <TopRankedRow
              items={movies}
              title={`Top 10 ${currentType === 'tv' ? 'Serial TV' : 'Film Box Office'} Terpopuler Pekan Ini`}
            />
          </section>
        )}

        {/* 3. Catalog Controls Bar: Type Segmented Toggle & Search Form */}
        <section className="space-y-4 pt-2">
          <div className="rounded-2xl border border-neutral-800/90 bg-[#121212]/80 backdrop-blur-md p-3 sm:p-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Type Switcher (Segmented Control) */}
              <div className="flex items-center rounded-xl bg-neutral-900/90 p-1 border border-neutral-800 shrink-0">
                <Link
                  href={`/movie?type=movie${currentCategory !== 'trending' ? `&category=${currentCategory}` : ''}`}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                    currentType === 'movie'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Film className="h-4 w-4" />
                  <span>Film Bioskop</span>
                </Link>

                <Link
                  href={`/movie?type=tv${currentCategory !== 'trending' && currentCategory !== 'now-playing' ? `&category=${currentCategory}` : ''}`}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                    currentType === 'tv'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Tv className="h-4 w-4" />
                  <span>Serial TV</span>
                </Link>
              </div>

              {/* Search Box */}
              <form
                action="/movie"
                method="GET"
                className="relative flex items-center w-full md:w-96"
              >
                <input type="hidden" name="type" value={currentType} />
                <Search className="absolute left-3.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder={`Cari judul ${currentType === 'tv' ? 'serial TV' : 'film'}...`}
                  className="w-full rounded-xl bg-black/60 border border-neutral-800 pl-10 pr-20 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-500 active:scale-95 transition-all shadow-sm"
                >
                  Cari
                </button>
              </form>
            </div>

            {/* Category Filter Pills (When Not In Search Mode) */}
            {!isSearch && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-3 border-t border-neutral-800/80 mt-3 scrollbar-none">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 shrink-0 mr-1 font-semibold">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Kategori:</span>
                </div>
                {categoryOptions.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = currentCategory === cat.id;
                  return (
                    <Link
                      key={cat.id}
                      href={`/movie?type=${currentType}&category=${cat.id}`}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{cat.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 4. Section Title & Catalog Status */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-7 w-1.5 rounded-full bg-rose-600 shadow-sm shadow-rose-600/50" />
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-rose-500" />
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {isSearch
                    ? `Hasil Pencarian: "${query}"`
                    : currentCategory === 'popular'
                    ? `Daftar ${currentType === 'tv' ? 'Serial TV' : 'Film'} Paling Populer`
                    : currentCategory === 'now-playing'
                    ? 'Film Sedang Tayang di Bioskop'
                    : currentCategory === 'top-rated'
                    ? `${currentType === 'tv' ? 'Serial TV' : 'Film'} dengan Rating Tertinggi`
                    : `Koleksi ${currentType === 'tv' ? 'Serial TV' : 'Film'} Trending Pekan Ini`}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-400">
              {totalResults > 0 && (
                <span className="rounded-xl bg-neutral-900/90 border border-neutral-800 px-3 py-1.5 text-neutral-300 font-medium">
                  Halaman <strong className="text-white font-bold">{page}</strong> dari <strong className="text-white font-bold">{totalPages}</strong> ({totalResults.toLocaleString()} judul)
                </span>
              )}
              {isSearch && (
                <Link
                  href={`/movie?type=${currentType}`}
                  className="flex items-center gap-1.5 rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:border-neutral-700 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Pencarian</span>
                </Link>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {movies.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-[#121212] p-12 text-center space-y-3">
              <Film className="mx-auto h-12 w-12 text-neutral-600" />
              <h3 className="text-base font-bold text-white">Tidak ada judul ditemukan</h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
                {isSearch
                  ? `Pencarian kata kunci "${query}" tidak membuahkan hasil. Coba gunakan kata kunci judul lainnya.`
                  : 'Daftar film sedang dimuat atau server API belum merespons.'}
              </p>
              {isSearch && (
                <Link
                  href={`/movie?type=${currentType}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition-colors"
                >
                  Kembali ke Katalog Lengkap
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-5">
              {movies.map((movie) => (
                <MovieCard key={`${movie.type}-${movie.id}`} movie={movie} />
              ))}
            </div>
          )}

          {/* Enhanced Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-neutral-800/80">
              {/* Info text */}
              <span className="text-xs text-neutral-400 order-2 sm:order-1">
                Menampilkan halaman <strong className="text-white font-bold">{page}</strong> dari <strong className="text-white font-bold">{totalPages}</strong>
              </span>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1.5 order-1 sm:order-2">
                {/* Prev Button */}
                {page > 1 ? (
                  <Link
                    href={buildPageUrl(page - 1)}
                    className="flex items-center gap-1 rounded-xl bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-1 rounded-xl bg-neutral-900/40 border border-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-600 cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>
                )}

                {/* Numbered Page Buttons */}
                {startPage > 1 && (
                  <>
                    <Link
                      href={buildPageUrl(1)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
                    >
                      1
                    </Link>
                    {startPage > 2 && (
                      <span className="px-1 text-xs text-neutral-500">...</span>
                    )}
                  </>
                )}

                {pageNumbers.map((pNum) => {
                  const isCurrent = pNum === page;
                  return (
                    <Link
                      key={pNum}
                      href={buildPageUrl(pNum)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      {pNum}
                    </Link>
                  );
                })}

                {endPage < totalPages && (
                  <>
                    {endPage < totalPages - 1 && (
                      <span className="px-1 text-xs text-neutral-500">...</span>
                    )}
                    <Link
                      href={buildPageUrl(totalPages)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
                    >
                      {totalPages}
                    </Link>
                  </>
                )}

                {/* Next Button */}
                {page < totalPages ? (
                  <Link
                    href={buildPageUrl(page + 1)}
                    className="flex items-center gap-1 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/30 hover:bg-rose-500 active:scale-95 transition-all"
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-1 rounded-xl bg-neutral-900/40 border border-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-600 cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
