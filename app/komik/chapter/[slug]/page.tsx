import { notFound } from 'next/navigation';
import ChapterReaderView from '@/components/ChapterReaderView';
import { getChapterDetail, getComicDetail } from '@/lib/api/comic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const match = slug.match(/^(.*?)-(?:chapter[-_]?)?(\d+(?:\.\d+)?)$/i);
  const mangaSlug = match ? match[1] : slug;
  const chapterNumber = match ? match[2] : '';
  const comicTitle = mangaSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const title = `Baca Komik ${comicTitle} Chapter ${chapterNumber} Bahasa Indonesia`;
  const description = `Baca komik ${comicTitle} chapter ${chapterNumber} bahasa Indonesia kualitas gambar HD update tercepat tanpa buffering di Kurunime.`;

  return {
    title,
    description,
    keywords: [
      `Baca Komik ${comicTitle} Chapter ${chapterNumber}`,
      `${comicTitle} Chapter ${chapterNumber} Bahasa Indonesia`,
      `${comicTitle} Chapter ${chapterNumber} Sub Indo`,
      'Komik Manga Manhwa Bahasa Indonesia',
      'Baca Komik Sub Indo',
      'Kurunime Komik',
    ],
    alternates: {
      canonical: `/komik/chapter/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/komik/chapter/${slug}`,
    },
  };
}

export default async function ComicChapterPage({ params }: PageProps) {
  const { slug } = await params;

  // Extract comic slug and chapter number from slug: e.g. "solo-leveling-180" or "money-keeps-piling-up-no-matter-how-much-i-spend-23"
  const match = slug.match(/^(.*?)-(?:chapter[-_]?)?(\d+(?:\.\d+)?)$/i);
  let mangaSlug = slug;
  let chapterNumber = '1';

  if (match) {
    mangaSlug = match[1];
    chapterNumber = match[2];
  }

  const [chapterData, comicDetail] = await Promise.all([
    getChapterDetail(mangaSlug, chapterNumber),
    getComicDetail(mangaSlug),
  ]);

  if (!chapterData) {
    notFound();
  }

  return (
    <ChapterReaderView
      data={chapterData}
      mangaSlug={mangaSlug}
      chapters={comicDetail?.chapters || []}
      comicDetail={comicDetail || undefined}
    />
  );
}
