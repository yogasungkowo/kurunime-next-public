import Link from 'next/link';
import { Star, Flame, Tv, Film } from 'lucide-react';
import { MovieItem } from '@/lib/api/types';

interface TopRankedRowProps {
  items: MovieItem[];
  title?: string;
}

export default function TopRankedRow({ items, title = 'Top 10 Pekan Ini' }: TopRankedRowProps) {
  const topItems = items.slice(0, 10);
  if (topItems.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1.5 rounded-full bg-rose-600 shadow-sm shadow-rose-600/50" />
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-rose-500 fill-rose-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white">
              {title}
            </h2>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Shelf */}
      <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none scroll-smooth">
        {topItems.map((movie, idx) => {
          const rank = idx + 1;
          const isTv = movie.type === 'tv';
          return (
            <Link
              key={`rank-${movie.type}-${movie.id}`}
              href={`/movie/${movie.type || 'movie'}/${movie.id}`}
              className="group relative flex items-end shrink-0 transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Giant Stylized Rank Number */}
              <div className="relative select-none leading-none -mr-4 sm:-mr-6 z-0">
                <span className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-transparent stroke-text drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] opacity-90 group-hover:text-rose-500/20 group-hover:opacity-100 transition-all duration-300">
                  {rank}
                </span>
              </div>

              {/* Movie Card Poster */}
              <div className="relative w-32 sm:w-40 md:w-44 aspect-[2/3] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl ring-1 ring-white/10 group-hover:ring-rose-500/50 group-hover:shadow-rose-600/20 transition-all duration-300 z-10">
                <img
                  src={movie.poster || '/placeholder.svg'}
                  alt={movie.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Top Type Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span
                    className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm ${
                      isTv ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {isTv ? <Tv className="h-2.5 w-2.5" /> : <Film className="h-2.5 w-2.5" />}
                    {isTv ? 'TV' : 'Film'}
                  </span>
                </div>

                {/* Rating Badge */}
                {movie.rating && movie.rating > 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-md shadow-sm border border-amber-500/20 z-10">
                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>
                )}

                {/* Bottom Overlay with title */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2.5 pt-8 z-10">
                  <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-rose-400 transition-colors">
                    {movie.title}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-0.5">
                    <span className="text-rose-400 font-semibold">Sub Indo</span>
                    {movie.year && <span>{movie.year}</span>}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
