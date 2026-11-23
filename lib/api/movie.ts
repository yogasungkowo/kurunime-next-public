import { MovieItem, MovieDetail, MovieSubtitle, MoviePaginatedResponse } from './types';

export function getMovieApiBase(): string {
  const envUrl =
    process.env.MOVIE_API_URL ||
    process.env.NEXT_PUBLIC_MOVIE_API_URL ||
    'http://localhost:3004/v1/api';
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/v1/api') ? clean : `${clean}/v1/api`;
}

const MOVIE_API_BASE = getMovieApiBase();

export interface FilmListParams {
  category?: 'trending' | 'popular' | 'now-playing' | 'top-rated' | 'discover';
  type?: 'movie' | 'tv';
  page?: number;
  limit?: number;
  sort_by?: string;
  genre?: string;
  year?: number;
}

/**
 * Universal paginated film list fetcher (supports trending, popular, now-playing, top-rated, discover)
 */
export async function getFilmList(params: FilmListParams = {}): Promise<MoviePaginatedResponse> {
  const {
    category = 'trending',
    type = 'movie',
    page = 1,
    limit = 24,
    sort_by,
    genre,
    year,
  } = params;

  try {
    const queryParams = new URLSearchParams();
    queryParams.set('type', type);
    queryParams.set('page', String(page));
    queryParams.set('limit', String(limit));
    if (sort_by) queryParams.set('sort_by', sort_by);
    if (genre) queryParams.set('genre', genre);
    if (year) queryParams.set('year', String(year));

    const endpoint = category === 'now-playing' ? '/film/now-playing' : `/film/${category}`;
    const url = `${MOVIE_API_BASE}${endpoint}?${queryParams.toString()}`;

    const res = await fetch(url, {
      next: { revalidate: 600 }, // Cache 10 minutes
    });

    if (!res.ok) {
      console.error(`Failed to fetch film list (${category}): ${res.statusText}`);
      return { page, perPage: limit, totalPages: 1, totalResults: 0, results: [] };
    }

    const data = await res.json();
    return {
      page: data?.page || page,
      perPage: data?.perPage || limit,
      totalPages: data?.totalPages || 1,
      totalResults: data?.totalResults || 0,
      results: Array.isArray(data?.results) ? data.results : [],
    };
  } catch (error) {
    console.error(`Error in getFilmList (${category}):`, error);
    return { page, perPage: limit, totalPages: 1, totalResults: 0, results: [] };
  }
}

/**
 * Fetch list of trending movies or TV series (Backwards compatible helper returning MovieItem[])
 */
export async function getTrendingMovies(
  type: 'movie' | 'tv' = 'movie',
  page: number = 1,
  limit: number = 20
): Promise<MovieItem[]> {
  const paginated = await getFilmList({ category: 'trending', type, page, limit });
  return paginated.results;
}

/**
 * Search movies or TV series by title query with pagination
 */
export async function searchMovies(
  q: string,
  type: 'movie' | 'tv' = 'movie',
  page: number = 1,
  limit: number = 24
): Promise<MoviePaginatedResponse> {
  try {
    if (!q || !q.trim()) {
      return { page: 1, perPage: limit, totalPages: 1, totalResults: 0, results: [] };
    }

    const res = await fetch(
      `${MOVIE_API_BASE}/film/search?q=${encodeURIComponent(q.trim())}&type=${type}&page=${page}&limit=${limit}`,
      {
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      console.error(`Failed to search movies: ${res.statusText}`);
      return { page, perPage: limit, totalPages: 1, totalResults: 0, results: [] };
    }

    const data = await res.json();
    return {
      page: data?.page || page,
      perPage: data?.perPage || limit,
      totalPages: data?.totalPages || 1,
      totalResults: data?.totalResults || 0,
      results: Array.isArray(data?.results) ? data.results : [],
    };
  } catch (error) {
    console.error('Error searching movies:', error);
    return { page, perPage: limit, totalPages: 1, totalResults: 0, results: [] };
  }
}

/**
 * Get detailed movie or TV series metadata + embed player servers
 */
export async function getMovieDetail(
  type: 'movie' | 'tv',
  id: string | number,
  season: number = 1,
  episode: number = 1
): Promise<MovieDetail | null> {
  try {
    const url = `${MOVIE_API_BASE}/film/${type}/${id}?season=${season}&episode=${episode}`;
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache detail for 1 hour
    });

    if (!res.ok) {
      console.error(`Failed to fetch movie detail (${type}/${id}): ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    if (!data || !data.id) return null;

    return {
      id: data.id,
      type: data.type || type,
      title: data.title || '',
      overview: data.overview || null,
      genres: Array.isArray(data.genres) ? data.genres : [],
      poster: data.poster || null,
      backdrop: data.backdrop || null,
      trailer: data.trailer || null,
      seasons: Array.isArray(data.seasons) ? data.seasons : undefined,
      servers: Array.isArray(data.servers) ? data.servers : [],
    };
  } catch (error) {
    console.error(`Error fetching movie detail (${type}/${id}):`, error);
    return null;
  }
}

/**
 * Get available subtitles from SubDL API
 */
export async function getMovieSubtitles(
  type: 'movie' | 'tv',
  id: string | number,
  lang: string = 'id,en',
  season: number = 1,
  episode: number = 1
): Promise<MovieSubtitle[]> {
  try {
    const url = `${MOVIE_API_BASE}/film/${type}/${id}/subtitles?lang=${encodeURIComponent(
      lang
    )}&season=${season}&episode=${episode}`;

    const res = await fetch(url, {
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      console.error(`Failed to fetch subtitles: ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data?.subtitles) ? data.subtitles : [];
  } catch (error) {
    console.error('Error fetching movie subtitles:', error);
    return [];
  }
}

/**
 * Direct Subtitle Download URL helper
 */
export function getSubtitleDownloadUrl(downloadUrlOrPath: string | number): string {
  const str = String(downloadUrlOrPath);
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return str;
  }
  const clean = str.startsWith('/v1/api') ? str.replace('/v1/api', '') : str;
  return clean.startsWith('/') ? `/api/movie${clean}` : `/api/movie/${clean}`;
}
