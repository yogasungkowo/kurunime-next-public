import {
  Comic,
  ComicDetail,
  ComicChapterReader,
  ComicChapterItem,
} from './types';

const MANGA_API_BASE =
  process.env.NEXT_PUBLIC_MANGA_API_URL ||
  process.env.MANGA_API_URL ||
  'https://manga-api.prasunk.my.id';

export function mapApiToComic(item: any): Comic {
  const genres = Array.isArray(item.genres)
    ? item.genres.map((g: any) => (typeof g === 'string' ? g : g.name || g.slug))
    : [];

  return {
    id: item.id || item.slug,
    slug: item.slug || '',
    title: item.title || '',
    poster: item.poster || '',
    type: item.type || 'Manga',
    status: item.status || 'Ongoing',
    rating: typeof item.rating === 'number' ? item.rating : parseFloat(item.rating || '0') || undefined,
    chapter: item.latest_chapter?.title || item.chapter || '',
    updatedAt: item.latest_chapter?.date || item.updatedAt || '',
    genres,
    synopsis: item.synopsis || '',
    author: item.author || '',
    latest_chapter: item.latest_chapter
      ? {
          title: item.latest_chapter.title || '',
          slug: item.latest_chapter.slug || '',
          number: item.latest_chapter.number || item.latest_chapter.chapter_number || 0,
          date: item.latest_chapter.date || '',
        }
      : undefined,
  };
}

export async function getComicList(params: {
  page?: number;
  type?: string;
  order?: string;
  genre?: string;
} = {}): Promise<{
  list: Comic[];
  pagination: {
    currentPage: number;
    lastPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  try {
    const { page = 1, type, order, genre } = params;
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(page));
    if (type) searchParams.set('type', type);
    if (order) searchParams.set('order', order);
    if (genre) searchParams.set('genre', genre);

    const res = await fetch(`${MANGA_API_BASE}/manga?${searchParams.toString()}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error('Failed to fetch comic list');
    const json = await res.json();
    const rawList = Array.isArray(json?.data?.mangas)
      ? json.data.mangas
      : Array.isArray(json?.data)
      ? json.data
      : [];
    const pg = json?.data?.pagination || json?.pagination || {};

    return {
      list: rawList.map(mapApiToComic),
      pagination: {
        currentPage: pg.current_page || page,
        lastPage: pg.last_page || 1,
        hasNext: !!pg.has_next,
        hasPrev: !!pg.has_prev,
      },
    };
  } catch (err) {
    console.error('getComicList error:', err);
    return {
      list: [],
      pagination: { currentPage: 1, lastPage: 1, hasNext: false, hasPrev: false },
    };
  }
}

export async function getComicDetail(slug: string): Promise<ComicDetail | null> {
  try {
    const res = await fetch(`${MANGA_API_BASE}/manga/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data;
    if (!data) return null;

    const base = mapApiToComic(data);
    const chapters: ComicChapterItem[] = (data.chapters || []).map((ch: any) => ({
      title: ch.title || `Chapter ${ch.number}`,
      slug: ch.slug || '',
      number: ch.number,
      date: ch.date || '',
    }));

    return {
      ...base,
      authors: data.author ? [data.author] : [],
      chapters,
      recommendations: [],
    };
  } catch (err) {
    console.error('getComicDetail error:', err);
    return null;
  }
}

export async function getChapterDetail(
  mangaSlug: string,
  chapterNumberOrSlug: string
): Promise<ComicChapterReader | null> {
  try {
    // Determine if chapterNumberOrSlug is a number or contains chapter number
    let cleanChapter = chapterNumberOrSlug;
    const match = String(chapterNumberOrSlug).match(/(?:chapter[-_]?)?(\d+(?:\.\d+)?)/i);
    if (match) {
      cleanChapter = match[1];
    }

    const res = await fetch(`${MANGA_API_BASE}/manga/${mangaSlug}/chapter/${cleanChapter}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data;
    if (!data) return null;

    const images: string[] = (data.images || [])
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      .map((img: any) => img.url);

    return {
      title: data.title || `Chapter ${cleanChapter}`,
      chapterNumber: cleanChapter,
      images,
      prevChapter: data.prev?.chapter_number ? String(data.prev.chapter_number) : null,
      nextChapter: data.next?.chapter_number ? String(data.next.chapter_number) : null,
      comicSlug: mangaSlug,
      comicTitle: data.title || '',
    };
  } catch (err) {
    console.error('getChapterDetail error:', err);
    return null;
  }
}

export async function getComicGenres(): Promise<{ name: string; slug: string }[]> {
  try {
    const res = await fetch(`${MANGA_API_BASE}/genres`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (err) {
    console.error('getComicGenres error:', err);
    return [];
  }
}

export async function searchComic(query: string): Promise<Comic[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`${MANGA_API_BASE}/search?q=${encodeURIComponent(query)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data;
    const rawList = Array.isArray(data?.mangas)
      ? data.mangas
      : Array.isArray(data?.manga)
      ? data.manga
      : Array.isArray(data)
      ? data
      : [];
    return rawList.map(mapApiToComic);
  } catch (err) {
    console.error('searchComic error:', err);
    return [];
  }
}
