import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import { Anime } from '@/lib/api/types';

interface AnimeCardProps {
  anime: Anime;
  priority?: boolean;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  const ratingText = anime.rating && anime.rating > 0 ? anime.rating.toFixed(1) : null;
  const episodeText =
    anime.episodes && anime.episodes > 0
      ? `Ep ${anime.episodes}`
      : anime.status === 'Completed'
      ? 'Tamat'
      : 'Ongoing';

  return (
    <div className="group relative flex flex-col">
      <Link
        href={`/anime/${anime.slug || anime.id}`}
        className="idlix-card-hover relative block aspect-[2/3] w-full overflow-hidden rounded-xl bg-[#141414] shadow-lg ring-1 ring-white/10 group-hover:ring-rose-500/50 transition-all duration-300"
      >
        {/* Poster Image */}
        <img
          src={anime.poster || '/placeholder.svg'}
          alt={anime.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
          <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            {anime.quality || anime.type || 'HD'}
          </span>
          {anime.type && anime.type !== 'TV' && (
            <span className="rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-300 backdrop-blur-md border border-white/10 shadow-sm">
              {anime.type}
            </span>
          )}
        </div>

        {ratingText && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-bold text-amber-400 backdrop-blur-md shadow-sm border border-amber-500/20">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{ratingText}</span>
          </div>
        )}

        {/* Bottom Badges Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-2.5 pt-8 flex items-end justify-between text-[11px] text-neutral-300 z-10">
          <span className="font-semibold text-rose-300 drop-shadow-sm">{episodeText}</span>
          {anime.releaseDay && (
            <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-neutral-200">
              {anime.releaseDay}
            </span>
          )}
        </div>

        {/* Hover Center Play Button Overlay (IDLIX Signature) */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 z-20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/50 transition-transform duration-200 group-hover:scale-110">
            <Play className="h-5 w-5 fill-white ml-0.5" />
          </div>
        </div>
      </Link>

      {/* Info Below Poster */}
      <div className="mt-2.5 flex flex-col">
        <Link
          href={`/anime/${anime.slug || anime.id}`}
          className="line-clamp-2 text-sm font-semibold text-neutral-200 transition-colors hover:text-rose-500 leading-snug"
          title={anime.title}
        >
          {anime.title}
        </Link>
        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
          {anime.year ? <span>{anime.year}</span> : null}
          {anime.year && (anime.genres?.[0] || anime.status) ? <span>•</span> : null}
          <span className="line-clamp-1 text-neutral-400">
            {anime.genres?.[0] || anime.status || 'Sub Indo'}
          </span>
        </div>
      </div>
    </div>
  );
}
