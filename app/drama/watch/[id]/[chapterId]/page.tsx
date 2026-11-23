import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ChevronRight,
  Flame,
  Layers,
  ArrowLeft,
  Share2,
  Lock,
} from 'lucide-react';
import DramaPlayer from '@/components/DramaPlayer';
import BookmarkButton from '@/components/BookmarkButton';
import DramaCard from '@/components/DramaCard';
import {
  getDramaDetail,
  getDramaEpisodes,
  getDramaEpisodeStream,
  getDramaRecommended,
} from '@/lib/api/drama';

interface PageProps {
  params: Promise<{
    id: string;
    chapterId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, chapterId } = await params;
  const [drama, stream] = await Promise.all([
    getDramaDetail(id),
    getDramaEpisodeStream(id, chapterId),
  ]);

  const epNum = stream?.serial_number || 1;
  const dramaTitle = drama?.book_title || 'Drama Cina';

  return {
    title: `Nonton ${dramaTitle} Episode ${epNum} Sub Indo - Kurunime`,
    description: `Streaming ${dramaTitle} Episode ${epNum} subtitle Indonesia resolusi HD kualitas tinggi gratis tanpa buffering di Kurunime.`,
    alternates: {
      canonical: `/drama/watch/${id}/${chapterId}`,
    },
    openGraph: {
      title: `${dramaTitle} Episode ${epNum} Sub Indo - Kurunime`,
      images: drama?.book_pic ? [{ url: drama.book_pic }] : [],
    },
  };
}

export default async function DramaWatchPage({ params }: PageProps) {
  const { id, chapterId } = await params;

  const [drama, episodes, stream, recommendations] = await Promise.all([
    getDramaDetail(id),
    getDramaEpisodes(id),
    getDramaEpisodeStream(id, chapterId),
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
          <h2 className="text-xl font-bold text-white mt-3">Player Drama Belum Tersedia</h2>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            Streaming episode drama ini belum dapat diakses karena server streaming drama sedang dalam tahap integrasi dan perbaikan.
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
  const currentSerial =
    stream?.serial_number ||
    epList.find((ep) => ep.chapter_id === chapterId)?.serial_number ||
    1;
  const chapterName =
    stream?.chapter_name || `Episode ${currentSerial}`;

  const videoStreams = stream?.video_streams || [];
  const defaultVideoUrl = stream?.video_url;

  return (
    <div className="min-h-screen bg-[#070707] pb-24 text-neutral-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        
        {/* Navigation / Breadcrumb Header */}
        <div className="flex items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
          <nav className="flex items-center gap-2 text-xs text-neutral-400 min-w-0">
            <Link
              href={`/drama/${id}`}
              className="flex items-center gap-1.5 text-neutral-300 hover:text-rose-400 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Detail Drama</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
            <span className="text-neutral-400 truncate max-w-[120px] sm:max-w-xs">
              {drama.book_title}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
            <span className="text-rose-400 font-bold shrink-0">
              Episode {currentSerial}
            </span>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <BookmarkButton
              id={`drama-${drama.book_id}`}
              type="drama"
              slug={drama.book_id}
              title={drama.book_title}
              poster={drama.book_pic}
              subTitle={`${drama.total || drama.chapter_count || epList.length} Episode`}
              url={`/drama/${drama.book_id}`}
              variant="icon"
              size="sm"
            />
          </div>
        </div>

        {/* Video Player Section */}
        <div className="flex flex-col items-center justify-center py-2">
          <DramaPlayer
            bookId={id}
            bookTitle={drama.book_title}
            bookPic={drama.book_pic}
            chapterId={chapterId}
            chapterName={chapterName}
            serialNumber={currentSerial}
            videoStreams={videoStreams}
            defaultVideoUrl={defaultVideoUrl}
            episodesList={epList}
            isLock={stream?.is_lock}
          />
        </div>

        {/* Drama Info Header below Player */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-rose-600 px-2 py-0.5 text-xs font-black uppercase text-white shadow">
                  Episode {currentSerial}
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  dari {epList.length} Episode
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {drama.book_title}
              </h1>
            </div>

            <Link
              href={`/drama/${id}`}
              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Layers className="h-4 w-4 text-rose-500" />
              <span>Lihat Semua Episode</span>
            </Link>
          </div>

          {/* Quick Horizontal Episode Selector */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <span className="text-xs font-bold text-neutral-400">
              Pilih Episode Cepat:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {epList.map((ep) => {
                const isActive = ep.chapter_id === chapterId || ep.serial_number === currentSerial;
                const isEpLocked = ep.is_lock === 1;
                return (
                  <Link
                    key={ep.chapter_id}
                    href={`/drama/watch/${id}/${ep.chapter_id}`}
                    className={`flex h-9 min-w-[48px] px-2 shrink-0 items-center justify-center gap-1 rounded-xl text-xs font-bold transition-all border ${
                      isActive
                        ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30 scale-105'
                        : isEpLocked
                        ? 'bg-neutral-900 border-amber-500/30 text-amber-300 hover:border-amber-400'
                        : 'bg-neutral-800/80 border-neutral-700/60 text-neutral-300 hover:border-neutral-500 hover:text-white'
                    }`}
                  >
                    <span>{ep.serial_number}</span>
                    {isEpLocked && <Lock className="h-2.5 w-2.5 text-amber-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-neutral-800">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-rose-500" />
              <h2 className="text-lg font-bold text-white">
                Rekomendasi Drama Lainnya
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {recommendations.slice(0, 6).map((item) => (
                <DramaCard key={item.book_id} drama={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

