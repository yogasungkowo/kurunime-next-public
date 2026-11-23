import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, BookOpen, ArrowRight, User } from 'lucide-react';
import ComicChapterList from '@/components/ComicChapterList';
import BookmarkButton from '@/components/BookmarkButton';
import { getComicDetail } from '@/lib/api/comic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const comic = await getComicDetail(slug);
  if (!comic) return { title: 'Komik Tidak Ditemukan - Kurunime' };

  const title = `Baca Komik ${comic.title} Bahasa Indonesia`;
  const description =
    comic.synopsis?.slice(0, 160) ||
    `Baca komik ${comic.title} (${comic.type || 'Manga'}) subtitle Indonesia chapter terbaru gratis dan update super cepat di Kurunime.`;

  return {
    title,
    description,
    keywords: [
      `Baca Komik ${comic.title} Bahasa Indonesia`,
      `Komik ${comic.title} Sub Indo`,
      `Manga ${comic.title} Bahasa Indonesia`,
      `Manhwa ${comic.title} Sub Indo`,
      `${comic.title} Chapter Terbaru`,
      'Komik Manga Manhwa Bahasa Indonesia',
      'Baca Komik Sub Indo',
      'Kurunime Komik',
    ],
    alternates: {
      canonical: `/komik/${slug}`,
    },
    openGraph: {
      title: `${comic.title} Subtitle Indonesia - Kurunime`,
      description,
      url: `/komik/${slug}`,
      type: 'book',
      images: [
        {
          url: comic.poster || '/logo.png',
          alt: comic.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Baca Komik ${comic.title} Sub Indo`,
      description,
      images: [comic.poster || '/logo.png'],
    },
  };
}

export default async function ComicDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const comic = await getComicDetail(slug);

  if (!comic) {
    notFound();
  }

  const firstChapter = comic.chapters.length > 0 ? comic.chapters[comic.chapters.length - 1] : null;
  const latestChapter = comic.chapters.length > 0 ? comic.chapters[0] : null;

  const firstChapterParam = firstChapter?.number !== undefined ? String(firstChapter.number) : '1';
  const latestChapterParam = latestChapter?.number !== undefined ? String(latestChapter.number) : '1';

  // Structured Data (JSON-LD) for Comic/Manga Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ComicSeries',
    name: comic.title,
    description: comic.synopsis || `Baca komik ${comic.title} bahasa Indonesia di Kurunime.`,
    image: comic.poster || undefined,
    genre: comic.genres || [],
    author: comic.author ? { '@type': 'Person', name: comic.author } : undefined,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/" className="hover:text-rose-400">Beranda</Link>
          <span>/</span>
          <Link href="/komik" className="hover:text-rose-400">Komik</Link>
          <span>/</span>
          <span className="text-neutral-200 line-clamp-1">{comic.title}</span>
        </div>

        {/* 1. Header & Hero Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 rounded-2xl border border-neutral-800 bg-[#141414] p-6 sm:p-8 backdrop-blur-md">
          {/* Poster Column */}
          <div className="md:col-span-1">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl ring-1 ring-white/10 shadow-xl bg-black">
              <img
                src={comic.poster || '/placeholder.svg'}
                alt={comic.title}
                className="h-full w-full object-cover"
              />
              {comic.rating && (
                <div className="absolute top-3 right-3 flex items-center gap-1 rounded bg-black/80 px-2 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{comic.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info Column */}
          <div className="md:col-span-3 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                  {comic.type || 'Manhwa'}
                </span>
                <span className="rounded bg-neutral-800 border border-neutral-700 px-2.5 py-0.5 text-xs font-medium text-neutral-200">
                  {comic.status || 'Ongoing'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {comic.title}
                  </h1>

                  {/* Author */}
                  {comic.author && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
                      <User className="h-3.5 w-3.5 text-rose-500" />
                      <span>Author: {comic.author}</span>
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  <BookmarkButton
                    id={`comic-${comic.slug}`}
                    type="comic"
                    slug={comic.slug}
                    title={comic.title}
                    poster={comic.poster}
                    subTitle={`${comic.type || 'Komik'} • ${comic.chapters.length} Ch`}
                    url={`/komik/${comic.slug}`}
                  />
                </div>
              </div>

              {/* Genre Pills */}
              {comic.genres && comic.genres.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {comic.genres.map((g) => (
                    <span
                      key={g}
                      className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1 text-xs font-medium text-neutral-300"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-2">
                  Sinopsis
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                  {comic.synopsis || 'Sinopsis belum tersedia.'}
                </p>
              </div>
            </div>

            {/* Quick Action Read Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3 pt-6 border-t border-neutral-800">
              {firstChapter && (
                <Link
                  href={`/komik/chapter/${comic.slug}-${firstChapterParam}`}
                  className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-all active:scale-95"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Baca Dari Awal ({firstChapter.title})</span>
                </Link>
              )}

              {latestChapter && (
                <Link
                  href={`/komik/chapter/${comic.slug}-${latestChapterParam}`}
                  className="flex items-center gap-2 rounded-xl bg-neutral-900 border border-neutral-800 px-5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-200 hover:border-neutral-700 hover:text-rose-400 transition-all active:scale-95"
                >
                  <span>Baca Terakhir ({latestChapter.title})</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 2. Chapter List Section */}
        <ComicChapterList comicSlug={comic.slug} chapters={comic.chapters} />
      </div>
    </div>
  );
}
