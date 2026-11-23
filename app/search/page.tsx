import Link from 'next/link';
import { Metadata } from 'next';
import { Play, BookOpen, Film, Flame, Search } from 'lucide-react';
import AnimeCard from '@/components/AnimeCard';
import ComicCard from '@/components/ComicCard';
import MovieCard from '@/components/MovieCard';
import DramaCard from '@/components/DramaCard';
import { searchAnime } from '@/lib/api/anime';
import { searchComic } from '@/lib/api/comic';
import { searchMovies } from '@/lib/api/movie';
import { searchDramas } from '@/lib/api/drama';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    tab?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Cari "${q}" - Anime, Komik & Movie - Kurunime` : 'Pencarian Multimedia - Kurunime',
    description: q
      ? `Hasil pencarian untuk film, serial TV, anime, dan komik manga manhwa "${q}" subtitle Indonesia di Kurunime.`
      : 'Cari film, serial TV, anime subtitle Indonesia dan komik manga manhwa bahasa Indonesia di Kurunime.',
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchResultsPage({ searchParams }: PageProps) {
  const { q, tab } = await searchParams;
  const query = q || '';
  const activeTab = tab || 'all';

  const [animeResults, comicResults, movieResults, dramaResults] = await Promise.all([
    query ? searchAnime(query) : Promise.resolve([]),
    query ? searchComic(query) : Promise.resolve([]),
    query ? searchMovies(query).then((r) => r.results).catch(() => []) : Promise.resolve([]),
    query ? searchDramas(query, 1, 24).then((r) => r.list).catch(() => []) : Promise.resolve([]),
  ]);

  const showAnime = activeTab === 'all' || activeTab === 'anime';
  const showComic = activeTab === 'all' || activeTab === 'comic';
  const showMovie = activeTab === 'all' || activeTab === 'movie';
  const showDrama = activeTab === 'all' || activeTab === 'drama';
  const totalCount =
    animeResults.length + comicResults.length + movieResults.length + dramaResults.length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-2 rounded-full bg-rose-600 shadow-sm shadow-rose-600/50" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Hasil Pencarian: &quot;{query}&quot;
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Ditemukan {dramaResults.length} drama cina, {movieResults.length} film/serial, {animeResults.length} anime, dan {comicResults.length} komik.
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Link
              href={`/search?q=${encodeURIComponent(query)}&tab=all`}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all shrink-0 ${
                activeTab === 'all'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Semua ({totalCount})
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&tab=movie`}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all shrink-0 ${
                activeTab === 'movie'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Film className="h-3 w-3" />
              Film & TV ({movieResults.length})
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&tab=drama`}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all shrink-0 ${
                activeTab === 'drama'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Flame className="h-3 w-3 fill-current" />
              Drama Cina ({dramaResults.length})
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&tab=anime`}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all shrink-0 ${
                activeTab === 'anime'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Play className="h-3 w-3 fill-current" />
              Anime ({animeResults.length})
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&tab=comic`}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all shrink-0 ${
                activeTab === 'comic'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <BookOpen className="h-3 w-3" />
              Komik ({comicResults.length})
            </Link>
          </div>
        </div>

        {/* Content */}
        {!query && (
          <div className="py-20 text-center text-sm text-neutral-400">
            Silakan masukkan kata kunci pencarian pada kotak pencarian.
          </div>
        )}

        {/* Film & Series section */}
        {showMovie && movieResults.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Film className="h-4 w-4 text-rose-500" />
              Film & Serial TV ({movieResults.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
              {movieResults.map((movie) => (
                <MovieCard key={`search-movie-${movie.type}-${movie.id}`} movie={movie} />
              ))}
            </div>
          </div>
        )}

        {/* Drama section */}
        {showDrama && dramaResults.length > 0 && (
          <div className={showMovie && movieResults.length > 0 ? 'mt-10' : ''}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Flame className="h-4 w-4 text-rose-500 fill-rose-500" />
              Drama Cina & Short Drama ({dramaResults.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
              {dramaResults.map((drama) => (
                <DramaCard key={`search-drama-${drama.book_id}`} drama={drama} />
              ))}
            </div>
          </div>
        )}

        {/* Anime section */}
        {showAnime && animeResults.length > 0 && (
          <div className={showMovie && movieResults.length > 0 ? 'mt-10' : ''}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Play className="h-4 w-4 text-rose-500 fill-current" />
              Anime ({animeResults.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
              {animeResults.map((anime) => (
                <AnimeCard key={`search-anime-${anime.slug || anime.id}`} anime={anime} />
              ))}
            </div>
          </div>
        )}

        {/* Comic section */}
        {showComic && comicResults.length > 0 && (
          <div className={(showMovie && movieResults.length > 0) || (showAnime && animeResults.length > 0) ? 'mt-10' : ''}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-rose-500" />
              Komik Manga & Manhwa ({comicResults.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
              {comicResults.map((comic) => (
                <ComicCard key={`search-comic-${comic.slug}`} comic={comic} />
              ))}
            </div>
          </div>
        )}

        {query && totalCount === 0 && (
          <div className="py-20 text-center text-sm text-neutral-400">
            Tidak ada film, serial TV, anime, atau komik yang cocok dengan &quot;{query}&quot;.
          </div>
        )}
      </div>
    </div>
  );
}
