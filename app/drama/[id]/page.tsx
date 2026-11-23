import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Play,
  Share2,
  Flame,
  Eye,
  Bookmark,
  Layers,
  ChevronRight,
  Clock,
  Sparkles,
  Tv,
  Lock,
} from 'lucide-react';
import BookmarkButton from '@/components/BookmarkButton';
import DramaCard from '@/components/DramaCard';
import {
  getDramaDetail,
  getDramaEpisodes,
  getDramaRecommended,
} from '@/lib/api/drama';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const drama = await getDramaDetail(id);

  if (!drama) {
    return {
      title: 'Drama Tidak Ditemukan - Kurunime',
    };
  }

  const cleanDesc = (drama.special_desc || '')
    .replace(/<[^>]*>?/gm, '')
    .slice(0, 160);

  return {
    title: `Nonton ${drama.book_title} Sub Indo Lengkap - Kurunime`,
    description:
      cleanDesc ||
      `Nonton serial drama china pendek ${drama.book_title} subtitle Indonesia gratis di Kurunime. Rilis episode 1 sampai ${drama.total} kualitas HD.`,
    alternates: {
      canonical: `/drama/${id}`,
    },
    openGraph: {
      title: `Nonton ${drama.book_title} Sub Indo - Kurunime`,
      description: cleanDesc,
      images: drama.book_pic ? [{ url: drama.book_pic }] : [],
    },
  };
}

function formatNumber(num?: number): string {
  if (!num || num <= 0) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default async function DramaDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [drama, episodes, recommendations] = await Promise.all([
    getDramaDetail(id),
    getDramaEpisodes(id),
    getDramaRecommended(id),
  ]);

  if (!drama) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-7 h-7 animate-pulse" />
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            FITUR SEDANG DALAM PENGEMBANGAN
          </span>
          <h2 className="text-xl font-bold text-white mt-3">Fitur Drama Belum Tersedia</h2>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            Konten drama ini belum dapat diakses karena server streaming drama sedang dalam tahap integrasi dan perbaikan.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/drama"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs transition-colors"
            >
              Info Fitur Drama
            </Link>
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const epList = episodes.length > 0 ? episodes : drama.online_base || [];
  const firstEp = epList.find((ep) => ep.serial_number === 1) || epList[0];
  const firstChapterId = firstEp?.chapter_id || drama.start_play?.chapter_id || '';

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 text-neutral-100">
      {/* Background Ambience Backdrop */}
      <div className="relative w-full overflow-hidden border-b border-neutral-800/60 bg-gradient-to-b from-neutral-900/50 to-[#0a0a0a]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 blur-2xl transform scale-110"
          style={{ backgroundImage: `url(${drama.book_pic})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-400">
            <Link href="/" className="hover:text-rose-400 transition-colors">
              Beranda
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
            <Link href="/drama" className="hover:text-rose-400 transition-colors">
              Drama
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
            <span className="text-neutral-200 truncate max-w-xs sm:max-w-md">
              {drama.book_title}
            </span>
          </nav>

          {/* Hero Content Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Poster */}
            <div className="md:col-span-4 lg:col-span-3 flex justify-center">
              <div className="relative aspect-[2/3] w-56 sm:w-64 md:w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl ring-1 ring-white/10">
                <img
                  src={drama.book_pic || '/placeholder.svg'}
                  alt={drama.book_title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  <span className="flex items-center gap-1 rounded bg-rose-600 px-2 py-0.5 text-xs font-bold text-white shadow-md">
                    <Flame className="h-3 w-3 fill-white" />
                    Drama
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 rounded bg-black/80 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-md border border-white/10">
                  {drama.total || drama.chapter_count || epList.length} Episode
                </div>
              </div>
            </div>

            {/* Right: Info & Actions */}
            <div className="md:col-span-8 lg:col-span-9 space-y-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-rose-600/20 border border-rose-500/30 px-3 py-0.5 text-xs font-semibold text-rose-400">
                    Subtitle Indonesia
                  </span>
                  <span className="rounded-full bg-white/5 border border-white/10 px-3 py-0.5 text-xs font-semibold text-neutral-300">
                    HD 1080p
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                  {drama.book_title}
                </h1>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-3 border-y border-neutral-800/80 text-xs sm:text-sm text-neutral-300">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-rose-500" />
                  <span>
                    <strong className="text-white">
                      {drama.total || drama.chapter_count || epList.length}
                    </strong>{' '}
                    Episode
                  </span>
                </div>

                {drama.read_count ? (
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-rose-500" />
                    <span>
                      <strong className="text-white">
                        {formatNumber(drama.read_count)}
                      </strong>{' '}
                      Ditonton
                    </span>
                  </div>
                ) : null}

                {drama.collect_count ? (
                  <div className="flex items-center gap-1.5">
                    <Bookmark className="h-4 w-4 text-rose-500" />
                    <span>
                      <strong className="text-white">
                        {formatNumber(drama.collect_count)}
                      </strong>{' '}
                      Disukai
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {firstChapterId ? (
                  <Link
                    href={`/drama/watch/${id}/${firstChapterId}`}
                    className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-rose-600/40 hover:bg-rose-500 hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    <span>Mulai Tonton Episode 1</span>
                  </Link>
                ) : null}

                <BookmarkButton
                  id={`drama-${drama.book_id}`}
                  type="drama"
                  slug={drama.book_id}
                  title={drama.book_title}
                  poster={drama.book_pic}
                  subTitle={`${drama.total || drama.chapter_count || epList.length} Episode`}
                  url={`/drama/${drama.book_id}`}
                  variant="button"
                  size="lg"
                />
              </div>

              {/* Tag / Genre Pills */}
              {drama.tag_list && drama.tag_list.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-semibold text-neutral-400">
                    Genre & Tema:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {drama.tag_list.map((tag, i) => (
                      <span
                        key={tag.id || i}
                        className="rounded-lg bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-xs text-neutral-300 font-medium"
                      >
                        #{tag.text || (tag as any).tag_name || 'Drama'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Synopsis */}
              {drama.special_desc && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-sm font-bold text-white">Sinopsis:</h3>
                  <div
                    className="prose prose-invert prose-sm max-w-none text-neutral-300 leading-relaxed text-xs sm:text-sm"
                    dangerouslySetInnerHTML={{ __html: drama.special_desc }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections: Episode List & Recommendations */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 mt-10">
        
        {/* Episodes Grid Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-2">
              <Tv className="h-5 w-5 text-rose-500" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Daftar Episode ({epList.length})
              </h2>
            </div>
            <span className="text-xs text-neutral-400">
              Pilih episode untuk langsung memutar
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {epList.map((ep) => {
              const epNum = ep.serial_number;
              const epThumb = ep.video_pic || drama.book_pic || '/placeholder.svg';

              return (
                <Link
                  key={ep.chapter_id}
                  href={`/drama/watch/${id}/${ep.chapter_id}`}
                  className="group relative flex flex-col rounded-xl overflow-hidden bg-neutral-900/80 border border-neutral-800 hover:border-rose-500/50 transition-all duration-200"
                >
                  <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
                    <img
                      src={epThumb}
                      alt={`Episode ${epNum}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 rounded bg-rose-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                      Ep {epNum}
                    </div>

                    {ep.is_lock === 1 ? (
                      <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-black text-black shadow">
                        <Lock className="h-2.5 w-2.5 text-black" />
                        VIP
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 rounded bg-emerald-500/90 px-1.5 py-0.5 text-[9px] font-black text-white shadow">
                        GRATIS
                      </div>
                    )}

                    {/* Hover Play Icon */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/50">
                        <Play className="h-4 w-4 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-2 text-center">
                    <span className="text-xs font-semibold text-neutral-200 group-hover:text-rose-400 transition-colors">
                      Episode {epNum}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-neutral-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-rose-500" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Rekomendasi Drama Lainnya
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
              {recommendations.slice(0, 12).map((item) => (
                <DramaCard key={item.book_id} drama={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

