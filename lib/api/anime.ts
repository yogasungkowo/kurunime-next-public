import {
  Anime,
  AnimeDetail,
  EpisodeDetailData,
  ScheduleDay,
} from './types';

const ANIME_API_BASE =
  process.env.NEXT_PUBLIC_ANIME_API_URL ||
  process.env.ANIME_API_URL ||
  'https://anime-api.prasunk.my.id/otakudesu';

export function parseScore(value: unknown): number {
  const match = String(value ?? '').match(/(\d+(?:[.,]\d+)?)/);
  return match ? parseFloat(match[1].replace(',', '.')) : 0;
}

export function parseEpisodeNumber(value: unknown): number | undefined {
  const match = String(value ?? '').match(/\d+/);
  return match ? parseInt(match[0], 10) : undefined;
}

export function parseYear(value: unknown): number | undefined {
  const match = String(value ?? '').match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0], 10) : undefined;
}

export function mapStatus(value: unknown): string {
  const s = String(value ?? '').toLowerCase();
  if (s.includes('ongoing') || s.includes('sedang')) return 'Ongoing';
  if (s.includes('completed') || s.includes('tamat') || s.includes('selesai')) return 'Completed';
  return 'Completed';
}

export function mapType(value: unknown): string {
  const t = String(value ?? '').toLowerCase();
  if (t.includes('movie')) return 'Movie';
  if (t.includes('ova')) return 'OVA';
  if (t.includes('ona')) return 'ONA';
  if (t.includes('special')) return 'Special';
  return 'TV';
}

export function mapApiToAnime(item: any): Anime {
  const id = String(item.animeId || item.id || '');
  const poster = item.poster || item.image || '';
  const genreList = (item.genreList || item.genres || [])
    .map((g: any) =>
      typeof g === 'string'
        ? { title: g.replace(/,$/, '').trim(), genreId: '' }
        : { title: String(g.title || '').replace(/,$/, '').trim(), genreId: g.genreId || '' }
    )
    .filter((g: any) => g.title);

  return {
    id,
    slug: id,
    title: String(item.title || '').replace(/\s*Subtitle Indonesia\s*$/i, '').trim(),
    titleJp: item.japanese || item.title || '',
    titleJapanese: item.japanese || '',
    poster,
    backdrop: poster,
    rating: parseScore(item.score ?? item.highlight ?? 0),
    year: parseYear(item.aired || item.season || item.date),
    episodes: parseEpisodeNumber(item.episodes ?? item.totalEpisodes) || 0,
    currentEpisode: parseEpisodeNumber(item.episodes),
    duration: item.duration || '',
    quality: item.quality || 'HD',
    type: mapType(item.type),
    status: mapStatus(item.status),
    genres: genreList.map((g: any) => g.title),
    genreList,
    studio: item.studios || item.studio || '',
    synopsis: Array.isArray(item.synopsis?.paragraphList)
      ? item.synopsis.paragraphList.join('\n\n')
      : typeof item.synopsis === 'string'
      ? item.synopsis
      : '',
    releaseDay: item.releaseDay || '',
    latestReleaseDate: item.latestReleaseDate || item.lastReleaseDate || '',
  };
}

export async function getAnimeHome(): Promise<{
  ongoing: Anime[];
  completed: Anime[];
}> {
  try {
    const res = await fetch(`${ANIME_API_BASE}/home`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error('Failed to fetch anime home');
    const json = await res.json();
    const data = json?.data || {};
    return {
      ongoing: (data.ongoing?.animeList || []).map(mapApiToAnime),
      completed: (data.completed?.animeList || []).map(mapApiToAnime),
    };
  } catch (err) {
    console.error('getAnimeHome error:', err);
    return { ongoing: [], completed: [] };
  }
}

export async function getAnimeDetail(id: string): Promise<AnimeDetail | null> {
  try {
    const animeId = String(id).split(':')[0];
    const res = await fetch(`${ANIME_API_BASE}/anime/${animeId}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data?.details;
    if (!data) return null;

    const mapped = mapApiToAnime(data);
    const episodes = [...(data.episodeList || [])]
      .map((ep: any) => ({
        num: parseEpisodeNumber(ep.title),
        title: ep.title,
        episodeId: ep.episodeId,
        slug: ep.episodeId,
      }))
      .sort((a, b) => (b.num || 0) - (a.num || 0)); // Descending order for easy browsing

    return {
      ...mapped,
      producers: data.producers || '',
      season: data.season || '',
      aired: data.aired || '',
      episodesList: episodes,
      recommendations: (data.recommendedAnimeList || []).map(mapApiToAnime),
      batch: data.batch || null,
    };
  } catch (err) {
    console.error('getAnimeDetail error:', err);
    return null;
  }
}

export async function getEpisodeDetail(episodeId: string): Promise<EpisodeDetailData | null> {
  try {
    const res = await fetch(`${ANIME_API_BASE}/episode/${episodeId}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.details || null;
  } catch (err) {
    console.error('getEpisodeDetail error:', err);
    return null;
  }
}

export async function getServerEmbed(serverId: string): Promise<string | null> {
  try {
    const res = await fetch(`${ANIME_API_BASE}/server/${encodeURIComponent(serverId)}`, {
      method: 'POST',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.details?.url || null;
  } catch (err) {
    console.error('getServerEmbed error:', err);
    return null;
  }
}

export async function getAnimeSchedule(): Promise<ScheduleDay[]> {
  try {
    const res = await fetch(`${ANIME_API_BASE}/schedule`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const scheduleList = json?.data?.scheduleList || [];
    return scheduleList.map((group: any) => ({
      day: group.title || '',
      list: (group.animeList || []).map((item: any) => ({
        title: item.title || '',
        animeId: item.animeId || '',
        slug: item.animeId || '',
      })),
    }));
  } catch (err) {
    console.error('getAnimeSchedule error:', err);
    return [];
  }
}

export async function getAnimeGenres(): Promise<{ title: string; genreId: string }[]> {
  try {
    const res = await fetch(`${ANIME_API_BASE}/genre`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.genreList || [])
      .map((g: any) => ({ title: g.title || '', genreId: g.genreId || '' }))
      .filter((g: any) => g.title && g.genreId);
  } catch (err) {
    console.error('getAnimeGenres error:', err);
    return [];
  }
}

export async function getAnimeByGenre(genreId: string, page: number = 1): Promise<{
  list: Anime[];
  pagination?: { currentPage: number; hasNextPage: boolean; hasPrevPage: boolean };
}> {
  try {
    // Each genre API page returns 15 items. Fetching 2 API pages gives 30 items (5 complete rows of 6)
    const apiPage1 = (page - 1) * 2 + 1;
    const apiPage2 = apiPage1 + 1;

    const [res1, res2] = await Promise.all([
      fetch(`${ANIME_API_BASE}/genre/${genreId}?page=${apiPage1}`, { next: { revalidate: 300 } }),
      fetch(`${ANIME_API_BASE}/genre/${genreId}?page=${apiPage2}`, { next: { revalidate: 300 } }),
    ]);

    const json1 = res1.ok ? await res1.json() : null;
    const json2 = res2.ok ? await res2.json() : null;

    const raw1 = json1?.data?.animeList || [];
    const raw2 = json2?.data?.animeList || [];
    const combined = [...raw1, ...raw2];

    // Align to complete rows of 6 cards
    const remainder = combined.length % 6;
    const safeList =
      remainder !== 0 && combined.length > 6
        ? combined.slice(0, combined.length - remainder)
        : combined;

    return {
      list: safeList.map(mapApiToAnime),
      pagination: {
        currentPage: page,
        hasNextPage: raw2.length >= 10,
        hasPrevPage: page > 1,
      },
    };
  } catch (err) {
    console.error('getAnimeByGenre error:', err);
    return { list: [] };
  }
}

export async function getAnimeList(
  type: 'ongoing' | 'completed',
  page: number = 1
): Promise<{
  list: Anime[];
  pagination?: { currentPage: number; hasNextPage: boolean; hasPrevPage: boolean };
}> {
  try {
    const res = await fetch(`${ANIME_API_BASE}/${type}?page=${page}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { list: [] };
    const json = await res.json();
    const raw = json?.data?.animeList || [];

    // Keep rows complete (24 items = 4 complete rows of 6 cards) to avoid dangling cards with empty slots
    const remainder = raw.length % 6;
    const safeRaw =
      remainder !== 0 && raw.length > 6
        ? raw.slice(0, raw.length - remainder)
        : raw;

    return {
      list: safeRaw.map(mapApiToAnime),
      pagination: json?.pagination || json?.data?.pagination || {
        currentPage: page,
        hasNextPage: raw.length >= 10,
        hasPrevPage: page > 1,
      },
    };
  } catch (err) {
    console.error('getAnimeList error:', err);
    return { list: [] };
  }
}

export async function searchAnime(query: string): Promise<Anime[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`${ANIME_API_BASE}/search?q=${encodeURIComponent(query)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.animeList || []).map(mapApiToAnime);
  } catch (err) {
    console.error('searchAnime error:', err);
    return [];
  }
}
