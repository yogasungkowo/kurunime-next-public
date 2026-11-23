import Link from 'next/link';
import { Play, Eye, Flame, Bookmark } from 'lucide-react';
import { DramaItem } from '@/lib/api/types';

interface DramaCardProps {
  drama: DramaItem;
}

function formatNumber(num?: number): string {
  if (!num || num <= 0) return '';
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

export default function DramaCard({ drama }: DramaCardProps) {
  const views = formatNumber(drama.read_count);
  const bookmarkBadge = drama.book_mark?.text;
  const chapterCount = drama.chapter_count || 0;

  // Extract a nice prominent tag if available
  const primaryTag =
    drama.theme?.[0] ||
    drama.theme_list?.[0]?.tag_name ||
    drama.tag_list?.[0]?.text ||
    drama.tag_list?.[0]?.tag_name;

  return (
    <div className="group relative flex flex-col">
      <Link
        href={`/drama/${drama.book_id}`}
        className="idlix-card-hover relative block aspect-[2/3] w-full overflow-hidden rounded-xl bg-[#141414] shadow-lg ring-1 ring-white/10 group-hover:ring-rose-500/50 transition-all duration-300"
      >
        <img
          src={drama.book_pic || '/placeholder.svg'}
          alt={drama.book_title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
          <span className="flex items-center gap-1 rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            <Flame className="h-2.5 w-2.5 fill-white" />
            Drama
          </span>
          {bookmarkBadge && (
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
              style={{ backgroundColor: drama.book_mark?.color || '#FFE52E2E' }}
            >
              {bookmarkBadge}
            </span>
          )}
        </div>

        {/* Top Right: Episode Count */}
        {chapterCount > 0 && (
          <div className="absolute top-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-neutral-200 backdrop-blur-md border border-white/10 shadow-sm z-10">
            {chapterCount} Ep
          </div>
        )}

        {/* Bottom Bar: Views & Sub Indo */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2.5 pt-8 flex items-end justify-between text-[11px] text-neutral-300 z-10">
          <span className="font-semibold text-rose-300 drop-shadow-sm">
            Sub Indo
          </span>
          {views && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-neutral-300 bg-white/10 px-1.5 py-0.5 rounded backdrop-blur-sm">
              <Eye className="h-2.5 w-2.5" />
              {views}
            </span>
          )}
        </div>

        {/* Hover Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 z-20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/50 transition-transform duration-200 group-hover:scale-110">
            <Play className="h-5 w-5 fill-white ml-0.5" />
          </div>
        </div>
      </Link>

      {/* Info Below Poster */}
      <div className="mt-2.5 flex flex-col">
        <Link
          href={`/drama/${drama.book_id}`}
          className="line-clamp-2 text-sm font-semibold text-neutral-200 transition-colors hover:text-rose-500 leading-snug"
          title={drama.book_title}
        >
          {drama.book_title}
        </Link>
        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
          <span>{chapterCount > 0 ? `${chapterCount} Episode` : 'Drama Cina'}</span>
          {primaryTag && (
            <>
              <span>•</span>
              <span className="text-neutral-400 truncate">{primaryTag}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

