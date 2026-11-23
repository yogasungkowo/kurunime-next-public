export interface Anime {
  id: string;
  slug: string;
  title: string;
  titleJp?: string;
  titleJapanese?: string;
  poster: string;
  backdrop?: string;
  rating?: number;
  year?: number;
  episodes?: number;
  currentEpisode?: number;
  duration?: string;
  quality?: string;
  type?: string;
  status?: string;
  genres?: string[];
  genreList?: { title: string; genreId: string }[];
  studio?: string;
  synopsis?: string;
  releaseDay?: string;
  latestReleaseDate?: string;
}

export interface AnimeEpisodeItem {
  num?: number;
  title: string;
  episodeId: string;
  slug: string;
}

export interface AnimeDetail extends Anime {
  producers?: string;
  season?: string;
  aired?: string;
  episodesList: AnimeEpisodeItem[];
  recommendations?: Anime[];
  batch?: {
    title?: string;
    batchId?: string;
    otakudesuUrl?: string;
  } | null;
}

export interface EpisodeServerItem {
  title: string;
  serverId: string;
}

export interface EpisodeQualityItem {
  title: string;
  serverList: EpisodeServerItem[];
}

export interface EpisodeDownloadQuality {
  title: string;
  size?: string;
  urlList: { title: string; url: string }[];
}

export interface EpisodeDetailData {
  title: string;
  animeId?: string;
  defaultStreamingUrl?: string;
  server?: {
    qualityList: EpisodeQualityItem[];
  };
  download?: {
    qualityList: EpisodeDownloadQuality[];
  };
}

export interface ScheduleDay {
  day: string;
  list: {
    title: string;
    animeId: string;
    slug: string;
  }[];
}

export interface Comic {
  id?: number | string;
  slug: string;
  title: string;
  poster: string;
  type?: string;
  status?: string;
  rating?: number;
  chapter?: string;
  updatedAt?: string;
  genres?: string[];
  synopsis?: string;
  author?: string;
  latest_chapter?: {
    title: string;
    slug: string;
    number: number;
    date?: string;
  };
}

export interface ComicChapterItem {
  title: string;
  slug: string;
  number?: number;
  date?: string;
}

export interface ComicDetail extends Comic {
  authors?: string[];
  chapters: ComicChapterItem[];
  recommendations?: Comic[];
}

export interface ComicChapterReader {
  title?: string;
  chapterNumber?: number | string;
  images: string[];
  prevChapter?: string | null;
  nextChapter?: string | null;
  comicSlug?: string;
  comicTitle?: string;
}

export interface WatchHistoryItem {
  type: 'anime' | 'comic' | 'movie' | 'drama';
  id: string;
  title: string;
  poster: string;
  subTitle: string; // e.g. "Episode 12" or "Chapter 45" or "Movie / Film" or "Episode 5"
  url: string;
  timestamp: number;
}

export interface MovieItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster: string | null;
  backdrop?: string | null;
  overview?: string | null;
  rating: number | null;
  year: string;
}

export interface MoviePaginatedResponse {
  page: number;
  perPage: number;
  totalPages: number;
  totalResults: number;
  results: MovieItem[];
}

export interface MovieServer {
  name: string;
  url: string;
}

export interface MovieSeason {
  season: number;
  episodes: number;
}

export interface MovieDetail {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  overview: string | null;
  genres: string[];
  poster: string | null;
  backdrop: string | null;
  trailer: string | null;
  seasons?: MovieSeason[];
  servers: MovieServer[];
}

export interface MovieSubtitle {
  id: string;
  file_id?: number | string;
  language: string;
  release: string;
  file_name: string;
  author?: string | null;
  rating?: number | null;
  download_count?: number | null;
  download_url: string;
}

// --- DRAMA CINA & SHORT DRAMA (REELSHORT) TYPES ---

export interface DramaItem {
  book_id: string;
  book_title: string;
  book_pic: string;
  special_desc?: string;
  chapter_count?: number;
  read_count?: number;
  collect_count?: number;
  book_mark?: {
    color: string;
    text: string;
    text_color: string;
    type: number;
  };
  theme?: string[];
  theme_list?: { tag_id: string; tag_name: string }[];
  tag_list?: { category_id?: string; id?: string; tag_id?: string; text?: string; tag_name?: string }[];
  screen_mode?: number;
  have_trailer?: boolean;
}

export interface DramaBanner {
  b_id: number;
  title: string;
  pic: string;
  jump_param: {
    book_id: string;
    book_title: string;
    book_pic: string;
    special_desc?: string;
    chapter_count?: number;
    start_play?: {
      chapter_id: string;
      duration: number;
      video_pic: string;
    };
    theme_list?: { tag_id: string; tag_name: string }[];
  };
}

export interface DramaEpisodeItem {
  chapter_id: string;
  chapter_name?: string;
  chapter_type?: number;
  serial_number: number;
  like_count?: number;
  publish_at?: number;
  status?: number;
  video_pic?: string;
  is_lock?: number;
  unlock_cost?: number;
}

export interface DramaDetail {
  book_id: string;
  book_title: string;
  book_pic: string;
  special_desc?: string;
  chapter_count?: number;
  read_count?: number;
  collect_count?: number;
  tag_list?: { category_id?: string; id?: string; text?: string }[];
  total: number;
  online_base: DramaEpisodeItem[];
  start_play?: {
    chapter_id: string;
    chapter_index: number;
    duration: number;
    video_pic: string;
  };
}

export interface DramaVideoStream {
  Bitrate?: string;
  Dpi?: number;
  Encode?: string;
  PlayURL: string;
  MultiBit?: number;
  quality?: string;
  url?: string;
}

export interface DramaStreamResponse {
  book_id: string;
  chapter_id: string;
  chapter_name: string;
  serial_number: number;
  duration?: number;
  video_pic?: string;
  thumbnail_url?: string;
  video_url?: string;
  is_lock?: number;
  unlock_cost?: number;
  video_streams: DramaVideoStream[];
}

export interface DramaCategory {
  _id: string;
  name: string;
}

export interface DramaPaginatedResponse {
  page: number;
  pageSize: number;
  total: number;
  list: DramaItem[];
}
