import {
  DramaItem,
  DramaBanner,
  DramaDetail,
  DramaEpisodeItem,
  DramaStreamResponse,
  DramaCategory,
  DramaPaginatedResponse,
} from './types';

export function getDramaApiBase(): string {
  const envUrl =
    process.env.DRAMA_API_URL ||
    process.env.NEXT_PUBLIC_DRAMA_API_URL ||
    'http://127.0.0.1:8080';
  const clean = envUrl.replace(/\/+$/, '');
  return clean.replace('//localhost:', '//127.0.0.1:');
}

const DRAMA_API_BASE = getDramaApiBase();

/**
 * Fetch Home data: Banners and Featured Bookshelves
 */
export async function getDramaHome(): Promise<{
  banners: DramaBanner[];
  shelves: {
    bookshelf_name: string;
    bs_id: number;
    lists: DramaItem[];
  }[];
}> {
  try {
    const res = await fetch(`${DRAMA_API_BASE}/api/home`, {
      next: { revalidate: 300 }, // Cache 5 minutes
    });

    if (!res.ok) {
      console.error(`Failed to fetch drama home: ${res.statusText}`);
      return { banners: [], shelves: [] };
    }

    const json = await res.json();
    const lists = json?.data?.lists || [];

    const banners: DramaBanner[] = [];
    const shelves: { bookshelf_name: string; bs_id: number; lists: DramaItem[] }[] = [];

    for (const item of lists) {
      if (Array.isArray(item.banners) && item.banners.length > 0) {
        banners.push(...item.banners);
      } else if (Array.isArray(item.lists) && item.lists.length > 0) {
        shelves.push({
          bookshelf_name: item.bookshelf_name || 'Daftar Drama',
          bs_id: item.bs_id,
          lists: item.lists,
        });
      }
    }

    return { banners, shelves };
  } catch (error) {
    console.error('Error in getDramaHome:', error);
    return { banners: [], shelves: [] };
  }
}

/**
 * Fetch Top / Most Popular Short Dramas
 */
export async function getDramaTop(
  page: number = 1,
  pageSize: number = 20
): Promise<DramaPaginatedResponse> {
  try {
    const res = await fetch(
      `${DRAMA_API_BASE}/api/top?page=${page}&page_size=${pageSize}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      return { page, pageSize, total: 0, list: [] };
    }

    const json = await res.json();
    const data = json?.data || {};

    return {
      page,
      pageSize,
      total: data.total_num || data.total || 0,
      list: Array.isArray(data.lists) ? data.lists : [],
    };
  } catch (error) {
    console.error('Error in getDramaTop:', error);
    return { page, pageSize, total: 0, list: [] };
  }
}

/**
 * Fetch New Releases Short Dramas
 */
export async function getDramaNewReleases(
  page: number = 1,
  pageSize: number = 20
): Promise<DramaPaginatedResponse> {
  try {
    const res = await fetch(
      `${DRAMA_API_BASE}/api/new-releases?page=${page}&page_size=${pageSize}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      return { page, pageSize, total: 0, list: [] };
    }

    const json = await res.json();
    const data = json?.data || {};

    return {
      page,
      pageSize,
      total: data.total_num || data.total || 0,
      list: Array.isArray(data.lists) ? data.lists : [],
    };
  } catch (error) {
    console.error('Error in getDramaNewReleases:', error);
    return { page, pageSize, total: 0, list: [] };
  }
}

/**
 * Fetch Drama Categories / Tags List
 */
export async function getDramaCategories(): Promise<DramaCategory[]> {
  try {
    const res = await fetch(`${DRAMA_API_BASE}/api/categories`, {
      next: { revalidate: 3600 }, // Cache 1 hour
    });

    if (!res.ok) return [];

    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch (error) {
    console.error('Error in getDramaCategories:', error);
    return [];
  }
}

/**
 * Fetch Dramas by Category / Tag ID
 */
export async function getDramaByCategory(
  tagId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<DramaPaginatedResponse> {
  try {
    const res = await fetch(
      `${DRAMA_API_BASE}/api/categories/${tagId}?page=${page}&page_size=${pageSize}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      return { page, pageSize, total: 0, list: [] };
    }

    const json = await res.json();
    const data = json?.data || {};
    const list = Array.isArray(data.books)
      ? data.books
      : Array.isArray(data.lists)
      ? data.lists
      : [];

    return {
      page,
      pageSize,
      total: data.total_items || data.total || list.length,
      list,
    };
  } catch (error) {
    console.error(`Error in getDramaByCategory (${tagId}):`, error);
    return { page, pageSize, total: 0, list: [] };
  }
}

/**
 * Fetch Drama Detail Metadata
 */
export async function getDramaDetail(bookId: string): Promise<DramaDetail | null> {
  try {
    const res = await fetch(`${DRAMA_API_BASE}/api/books/${bookId}`, {
      next: { revalidate: 600 },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const data = json?.data;
    if (!data) return null;

    return {
      book_id: data.book_id || bookId,
      book_title: data.book_title || '',
      book_pic: data.book_pic || '',
      special_desc: data.special_desc || '',
      chapter_count: data.total || data.chapter_count || 0,
      read_count: data.read_count || 0,
      collect_count: data.collect_count || 0,
      tag_list: Array.isArray(data.tag_list) ? data.tag_list : [],
      total: data.total || 0,
      online_base: Array.isArray(data.online_base) ? data.online_base : [],
      start_play: data.start_play,
    };
  } catch (error) {
    console.error(`Error in getDramaDetail (${bookId}):`, error);
    return null;
  }
}

/**
 * Fetch Drama Episodes List
 */
export async function getDramaEpisodes(bookId: string): Promise<DramaEpisodeItem[]> {
  try {
    const res = await fetch(`${DRAMA_API_BASE}/api/episodes/${bookId}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];

    const json = await res.json();
    const data = json?.data;

    if (Array.isArray(data?.chapter_lists)) {
      return data.chapter_lists;
    }
    if (Array.isArray(data?.online_base)) {
      return data.online_base;
    }
    return [];
  } catch (error) {
    console.error(`Error in getDramaEpisodes (${bookId}):`, error);
    return [];
  }
}

/**
 * Fetch Episode Stream (HLS .m3u8 URLs and quality)
 */
export async function getDramaEpisodeStream(
  bookId: string,
  chapterId: string
): Promise<DramaStreamResponse | null> {
  try {
    const res = await fetch(
      `${DRAMA_API_BASE}/api/episodes/${bookId}/${chapterId}`,
      { cache: 'no-store' }
    );

    if (!res.ok) return null;

    const json = await res.json();
    const data = json?.data;
    if (!data) return null;

    return {
      book_id: data.book_id || bookId,
      chapter_id: data.chapter_id || chapterId,
      chapter_name: data.chapter_name || `Episode ${data.serial_number || 1}`,
      serial_number: data.serial_number || 1,
      duration: data.duration,
      video_pic: data.video_pic,
      thumbnail_url: data.thumbnail_url,
      video_url: data.video_url,
      is_lock: data.is_lock ?? 0,
      unlock_cost: data.unlock_cost,
      video_streams: Array.isArray(data.video_streams) ? data.video_streams : [],
    };
  } catch (error) {
    console.error(`Error in getDramaEpisodeStream (${bookId}/${chapterId}):`, error);
    return null;
  }
}

/**
 * Search Dramas by Query
 */
export async function searchDramas(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<DramaPaginatedResponse> {
  if (!query || !query.trim()) {
    return { page: 1, pageSize, total: 0, list: [] };
  }

  try {
    const res = await fetch(
      `${DRAMA_API_BASE}/api/search?q=${encodeURIComponent(query.trim())}&page=${page}&page_size=${pageSize}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return { page, pageSize, total: 0, list: [] };
    }

    const json = await res.json();
    const data = json?.data || {};
    const lists = Array.isArray(data.lists)
      ? data.lists
      : Array.isArray(data.results)
      ? data.results
      : [];

    return {
      page,
      pageSize,
      total: data.total || lists.length,
      list: lists,
    };
  } catch (error) {
    console.error(`Error searching dramas (${query}):`, error);
    return { page, pageSize, total: 0, list: [] };
  }
}

/**
 * Fetch Recommended Dramas
 */
export async function getDramaRecommended(bookId?: string): Promise<DramaItem[]> {
  try {
    // Top drama is always reliable and exciting
    const topRes = await getDramaTop(1, 12);
    if (topRes.list && topRes.list.length > 0) {
      return topRes.list.filter((item) => item.book_id !== bookId);
    }
  } catch (e) {
    console.error('Error fetching drama recommendations:', e);
  }
  return [];
}
