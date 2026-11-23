import Link from 'next/link';
import { Sparkles, CheckCircle2, BookOpen, ChevronRight, Film, Flame } from 'lucide-react';
import HeroBanner from '@/components/HeroBanner';
import AnimeCard from '@/components/AnimeCard';
import ComicCard from '@/components/ComicCard';
import MovieCard from '@/components/MovieCard';
import DramaCard from '@/components/DramaCard';
import { getAnimeHome, getAnimeSchedule, getAnimeList } from '@/lib/api/anime';
import { getComicList } from '@/lib/api/comic';
import { getTrendingMovies } from '@/lib/api/movie';
import { getDramaTop } from '@/lib/api/drama';
import TodayScheduleBar from '@/components/TodayScheduleBar';

export default async function HomePage() {
  const [animeHome, comicData, scheduleData, trendingMovies, dramaData] = await Promise.all([
    getAnimeHome(),
    getComicList({ page: 1 }),
    getAnimeSchedule(),
    getTrendingMovies('movie'),
    getDramaTop(1, 12).catch(() => ({ page: 1, pageSize: 12, total: 0, list: [] })),
  ]);

  const ongoingList = (animeHome.ongoing || []).slice(0, 12);
  let completedList = animeHome.completed || [];

  // If completedList has fewer than 12 items (otakudesu home usually only has 10),
  // fetch the complete list to guarantee 12 items (2 full rows of 6)
  if (completedList.length < 12) {
    const fullCompleted = await getAnimeList('completed', 1);
    if (fullCompleted.list.length >= 12) {
      completedList = fullCompleted.list.slice(0, 12);
    }
  } else {
    completedList = completedList.slice(0, 12);
  }

  const comicList = (comicData.list || []).slice(0, 12);
  const movieList = (trendingMovies || []).slice(0, 12);
  const dramaList = (dramaData.list || []).slice(0, 12);

  // Top featured for Hero Banner (take top 5 ongoing)
  const featured = ongoingList.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-16">
      {/* 1. IDLIX Hero Spotlight Carousel */}
      <HeroBanner featuredList={featured} />

      {/* Main Content Sections */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 mt-6">
        {/* Today's Schedule Quick Strip */}
        <TodayScheduleBar scheduleData={scheduleData} />

        {/* 2. Ongoing Anime Section (IDLIX Layout) */}
        <section>
          {/* Section Header with IDLIX vertical red bar */}
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6 pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="h-5 sm:h-6 w-1 sm:w-1.5 rounded-full bg-rose-600 shadow-sm shadow-rose-600/50 shrink-0" />
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 shrink-0" />
                <h2 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-white truncate">
                  Anime Sedang Tayang <span className="hidden sm:inline text-neutral-400 font-normal text-sm sm:text-base">(Ongoing)</span>
                </h2>
              </div>
            </div>

            <Link
              href="/list/ongoing"
              className="shrink-0 flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-semibold text-rose-500 hover:text-rose-400 transition-colors whitespace-nowrap"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
            {ongoingList.slice(0, 12).map((anime) => (
              <AnimeCard key={anime.slug || anime.id} anime={anime} />
            ))}
          </div>
        </section>

        {/* 3. Completed Anime Section */}
        <section>
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6 pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="h-5 sm:h-6 w-1 sm:w-1.5 rounded-full bg-neutral-400 shadow-sm shrink-0" />
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-300 shrink-0" />
                <h2 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-white truncate">
                  Anime Tamat <span className="hidden sm:inline text-neutral-400 font-normal text-sm sm:text-base">(Completed)</span>
                </h2>
              </div>
            </div>

            <Link
              href="/list/completed"
              className="shrink-0 flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-semibold text-rose-500 hover:text-rose-400 transition-colors whitespace-nowrap"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
            {completedList.slice(0, 12).map((anime) => (
              <AnimeCard key={anime.slug || anime.id} anime={anime} />
            ))}
          </div>
        </section>

        {/* 4. Comic / Manga Section */}
        <section>
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6 pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="h-5 sm:h-6 w-1 sm:w-1.5 rounded-full bg-rose-600 shadow-sm shadow-rose-600/50 shrink-0" />
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 shrink-0" />
                <h2 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-white truncate">
                  Komik & Manga <span className="hidden sm:inline text-neutral-400 font-normal text-sm sm:text-base">Terbaru</span>
                </h2>
              </div>
            </div>

            <Link
              href="/komik"
              className="shrink-0 flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-semibold text-rose-500 hover:text-rose-400 transition-colors whitespace-nowrap"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
            {comicList.slice(0, 12).map((comic) => (
              <ComicCard key={comic.slug} comic={comic} />
            ))}
          </div>
        </section>

        {/* 5. Movie & Film Trending Section */}
        {movieList.length > 0 && (
          <section>
            <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6 pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="h-5 sm:h-6 w-1 sm:w-1.5 rounded-full bg-rose-600 shadow-sm shadow-rose-600/50 shrink-0" />
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <Film className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 shrink-0" />
                  <h2 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-white truncate">
                    Film Bioskop & Movie <span className="hidden sm:inline text-neutral-400 font-normal text-sm sm:text-base">Trending</span>
                  </h2>
                </div>
              </div>

              <Link
                href="/movie"
                className="shrink-0 flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-semibold text-rose-500 hover:text-rose-400 transition-colors whitespace-nowrap"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
              {movieList.map((movie) => (
                <MovieCard key={`${movie.type}-${movie.id}`} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* 6. Drama Cina & Short Drama Section */}
        {dramaList.length > 0 && (
          <section>
            <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6 pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="h-5 sm:h-6 w-1 sm:w-1.5 rounded-full bg-rose-600 shadow-sm shadow-rose-600/50 shrink-0" />
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 fill-rose-500 shrink-0" />
                  <h2 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-white truncate">
                    Drama Cina & Short Drama <span className="hidden sm:inline text-neutral-400 font-normal text-sm sm:text-base">Viral</span>
                  </h2>
                </div>
              </div>

              <Link
                href="/drama"
                className="shrink-0 flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-semibold text-rose-500 hover:text-rose-400 transition-colors whitespace-nowrap"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
              {dramaList.map((drama) => (
                <DramaCard key={`home-drama-${drama.book_id}`} drama={drama} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
