import Link from 'next/link';
import { BookOpen, Star } from 'lucide-react';
import { Comic } from '@/lib/api/types';

interface ComicCardProps {
  comic: Comic;
}

export default function ComicCard({ comic }: ComicCardProps) {
  const ratingText = comic.rating && comic.rating > 0 ? comic.rating.toFixed(1) : null;
  const typeColor =
    comic.type?.toLowerCase() === 'manhwa'
      ? 'bg-rose-600 text-white'
      : comic.type?.toLowerCase() === 'manhua'
      ? 'bg-amber-600 text-white'
      : 'bg-neutral-800 text-neutral-200 border border-white/10';

  return (
    <div className="group relative flex flex-col">
      <Link
        href={`/komik/${comic.slug}`}
        className="idlix-card-hover relative block aspect-[2/3] w-full overflow-hidden rounded-xl bg-[#141414] shadow-lg ring-1 ring-white/10 group-hover:ring-rose-500/50 transition-all duration-300"
      >
        <img
          src={comic.poster || '/placeholder.svg'}
          alt={comic.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${typeColor}`}>
            {comic.type || 'Manga'}
          </span>
        </div>

        {ratingText && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-bold text-amber-400 backdrop-blur-md shadow-sm border border-amber-500/20">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{ratingText}</span>
          </div>
        )}

        {/* Bottom Badges */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-2.5 pt-8 flex items-end justify-between text-[11px] text-neutral-300 z-10">
          <span className="font-semibold text-rose-300 drop-shadow-sm">
            {comic.chapter || (comic.latest_chapter ? `Ch. ${comic.latest_chapter.number}` : 'Ch. 1')}
          </span>
          {comic.updatedAt && (
            <span className="text-[10px] text-neutral-400">
              {comic.updatedAt}
            </span>
          )}
        </div>

        {/* Hover Center Book Icon */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 z-20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/50 transition-transform duration-200 group-hover:scale-110">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="mt-2.5 flex flex-col">
        <Link
          href={`/komik/${comic.slug}`}
          className="line-clamp-2 text-sm font-semibold text-neutral-200 transition-colors hover:text-rose-500 leading-snug"
          title={comic.title}
        >
          {comic.title}
        </Link>
        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
          <span className="line-clamp-1">{comic.genres?.[0] || comic.status || 'Komik'}</span>
        </div>
      </div>
    </div>
  );
}
