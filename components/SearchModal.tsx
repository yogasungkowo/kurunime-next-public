'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, Play, BookOpen, Film, Flame, Star, ArrowRight } from 'lucide-react';
import { Anime, Comic, MovieItem, DramaItem } from '@/lib/api/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'anime' | 'comic' | 'movie' | 'drama'>('all');
  const [animeResults, setAnimeResults] = useState<Anime[]>([]);
  const [comicResults, setComicResults] = useState<Comic[]>([]);
  const [movieResults, setMovieResults] = useState<MovieItem[]>([]);
  const [dramaResults, setDramaResults] = useState<DramaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setAnimeResults([]);
      setComicResults([]);
      setMovieResults([]);
      setDramaResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const animeApiBase =
          process.env.NEXT_PUBLIC_ANIME_API_URL || 'https://anime-api.prasunk.my.id/otakudesu';
        const mangaApiBase =
          process.env.NEXT_PUBLIC_MANGA_API_URL || 'https://manga-api.prasunk.my.id';

        const [animeRes, comicRes, movieRes, dramaRes] = await Promise.allSettled([
          fetch(`${animeApiBase}/search?q=${encodeURIComponent(query)}`)
            .then((r) => r.json())
            .then((json) => json?.data?.animeList || []),
          fetch(`${mangaApiBase}/search?q=${encodeURIComponent(query)}`)
            .then((r) => r.json())
            .then((json) => {
              const data = json?.data;
              if (Array.isArray(data?.mangas)) return data.mangas;
              if (Array.isArray(data?.manga)) return data.manga;
              if (Array.isArray(data)) return data;
              return [];
            }),
          fetch(`/api/movie/film/search?q=${encodeURIComponent(query)}`)
            .then((r) => r.json())
            .then((json) => (Array.isArray(json?.results) ? json.results : [])),
          fetch(`/api/drama/search?q=${encodeURIComponent(query)}&page=1&page_size=10`)
            .then((r) => r.json())
            .then((json) => {
              const data = json?.data;
              if (Array.isArray(data?.lists)) return data.lists;
              if (Array.isArray(data?.results)) return data.results;
              return [];
            }),
        ]);

        if (animeRes.status === 'fulfilled') {
          setAnimeResults(
            animeRes.value.map((item: any) => ({
              id: item.animeId,
              slug: item.animeId,
              title: item.title,
              poster: item.poster,
              rating: parseFloat(item.score || '0') || undefined,
              status: item.status,
            }))
          );
        }

        if (comicRes.status === 'fulfilled') {
          setComicResults(
            comicRes.value.map((item: any) => ({
              id: item.slug || item.id,
              slug: item.slug || '',
              title: item.title || '',
              poster: item.poster || '',
              type: item.type || 'Manga',
              rating: typeof item.rating === 'number' ? item.rating : parseFloat(item.rating || '0') || undefined,
              chapter: item.latest_chapter?.title || item.latest_chapters?.[0]?.title || '',
            }))
          );
        }

        if (movieRes.status === 'fulfilled') {
          setMovieResults(movieRes.value);
        }

        if (dramaRes.status === 'fulfilled') {
          setDramaResults(dramaRes.value);
        }
      } catch (e) {
        console.error('Search error', e);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  if (!isOpen) return null;

  const showAnime = activeTab === 'all' || activeTab === 'anime';
  const showComic = activeTab === 'all' || activeTab === 'comic';
  const showMovie = activeTab === 'all' || activeTab === 'movie';
  const showDrama = activeTab === 'all' || activeTab === 'drama';
  const totalResults =
    animeResults.length + comicResults.length + movieResults.length + dramaResults.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-800 bg-[#121212] shadow-2xl ring-1 ring-white/5 z-10 flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center border-b border-neutral-800 px-4 py-3.5">
          <Search className="h-5 w-5 text-rose-500 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari anime, komik, film, atau drama cina..."
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-rose-500 mr-2" />}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-2 rounded-lg bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-neutral-300 hover:bg-neutral-700"
          >
            ESC
          </button>
        </form>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-neutral-800/80 px-4 py-2 text-xs font-medium bg-black/40 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-3 py-1 transition-colors shrink-0 ${
              activeTab === 'all'
                ? 'bg-rose-600 text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Semua ({totalResults})
          </button>
          <button
            onClick={() => setActiveTab('anime')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition-colors shrink-0 ${
              activeTab === 'anime'
                ? 'bg-rose-600 text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Play className="h-3 w-3 fill-current" />
            Anime ({animeResults.length})
          </button>
          <button
            onClick={() => setActiveTab('comic')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition-colors shrink-0 ${
              activeTab === 'comic'
                ? 'bg-rose-600 text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3 w-3" />
            Komik ({comicResults.length})
          </button>
          <button
            onClick={() => setActiveTab('movie')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition-colors shrink-0 ${
              activeTab === 'movie'
                ? 'bg-rose-600 text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Film className="h-3 w-3" />
            Film & TV ({movieResults.length})
          </button>
          <button
            onClick={() => setActiveTab('drama')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition-colors shrink-0 ${
              activeTab === 'drama'
                ? 'bg-rose-600 text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Flame className="h-3 w-3 fill-current" />
            Drama ({dramaResults.length})
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {!query.trim() && (
            <div className="py-12 text-center text-sm text-neutral-400">
              Ketik judul anime, komik, atau film yang ingin kamu tonton / baca.
            </div>
          )}

          {query.trim() && !loading && totalResults === 0 && (
            <div className="py-12 text-center text-sm text-neutral-400">
              Tidak ada hasil ditemukan untuk &quot;{query}&quot;.
            </div>
          )}

          {/* Film & Series Results */}
          {showMovie && movieResults.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <Film className="h-3 w-3" />
                  Film & Serial TV ({movieResults.length})
                </span>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&tab=movie`}
                  onClick={onClose}
                  className="text-xs text-neutral-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <span>Lihat semua</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-1.5">
                {movieResults.slice(0, 6).map((item) => {
                  const isTv = item.type === 'tv';
                  return (
                    <Link
                      key={`movie-${item.type}-${item.id}`}
                      href={`/movie/${item.type}/${item.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-neutral-800/60 group"
                    >
                      <img
                        src={item.poster || '/placeholder.svg'}
                        alt={item.title}
                        className="h-12 w-9 rounded-lg object-cover ring-1 ring-white/10 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-neutral-100 group-hover:text-rose-400 truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                              isTv
                                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                : 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {isTv ? 'Serial TV' : 'Movie'}
                          </span>
                          {item.rating && item.rating > 0 ? (
                            <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                              <Star className="h-3 w-3 fill-amber-400" />
                              {item.rating.toFixed(1)}
                            </span>
                          ) : null}
                          {item.year && <span>{item.year}</span>}
                          <span className="text-neutral-500">• Sub Indo</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Drama Cina Results */}
          {showDrama && dramaResults.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <Flame className="h-3 w-3 fill-rose-500" />
                  Drama Cina & Short Drama ({dramaResults.length})
                </span>
                <Link
                  href={`/drama?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="text-xs text-neutral-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <span>Lihat semua</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-1.5">
                {dramaResults.slice(0, 6).map((item) => (
                  <Link
                    key={`drama-${item.book_id}`}
                    href={`/drama/${item.book_id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-neutral-800/60 group"
                  >
                    <img
                      src={item.book_pic || '/placeholder.svg'}
                      alt={item.book_title}
                      className="h-12 w-9 rounded-lg object-cover ring-1 ring-white/10 shrink-0 bg-neutral-900"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-neutral-100 group-hover:text-rose-400 truncate">
                        {item.book_title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                        <span className="rounded bg-rose-600/20 px-1.5 py-0.2 text-[10px] text-rose-300 font-semibold border border-rose-500/30">
                          {item.chapter_count ? `${item.chapter_count} Ep` : 'Short Drama'}
                        </span>
                        {item.theme?.[0] && (
                          <span className="text-neutral-400 truncate">
                            #{item.theme[0]}
                          </span>
                        )}
                        <span className="text-neutral-500">• Sub Indo</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Anime Results */}
          {showAnime && animeResults.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <Play className="h-3 w-3 fill-current" />
                  Anime ({animeResults.length})
                </span>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&tab=anime`}
                  onClick={onClose}
                  className="text-xs text-neutral-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <span>Lihat semua</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-1.5">
                {animeResults.slice(0, 6).map((item) => (
                  <Link
                    key={`anime-${item.slug || item.id}`}
                    href={`/anime/${item.slug || item.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-neutral-800/60 group"
                  >
                    <img
                      src={item.poster || '/placeholder.svg'}
                      alt={item.title}
                      className="h-12 w-9 rounded-lg object-cover ring-1 ring-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-neutral-100 group-hover:text-rose-400 truncate">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                        {item.rating ? (
                          <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                            <Star className="h-3 w-3 fill-amber-400" />
                            {item.rating}
                          </span>
                        ) : null}
                        <span>{item.status || 'Sub Indo'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Comic Results */}
          {showComic && comicResults.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3" />
                  Komik ({comicResults.length})
                </span>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&tab=comic`}
                  onClick={onClose}
                  className="text-xs text-neutral-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <span>Lihat semua</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-1.5">
                {comicResults.slice(0, 6).map((item) => (
                  <Link
                    key={`comic-${item.slug}`}
                    href={`/komik/${item.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-neutral-800/60 group"
                  >
                    <img
                      src={item.poster || '/placeholder.svg'}
                      alt={item.title}
                      className="h-12 w-9 rounded-lg object-cover ring-1 ring-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-neutral-100 group-hover:text-rose-400 truncate">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                        <span className="rounded bg-rose-600/20 px-1 py-0.2 text-[10px] text-rose-300 font-semibold">
                          {item.type || 'Manga'}
                        </span>
                        {item.rating && (
                          <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                            <Star className="h-3 w-3 fill-amber-400" />
                            {item.rating}
                          </span>
                        )}
                        {item.chapter && <span>{item.chapter}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {query.trim() && totalResults > 0 && (
          <div className="border-t border-neutral-800 px-4 py-2.5 bg-neutral-900/40 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Tekan <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-neutral-300">Enter</kbd> untuk hasil lengkap</span>
            <button
              onClick={handleSubmit}
              className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              <span>Halaman Pencarian</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
