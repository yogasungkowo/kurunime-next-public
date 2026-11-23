'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play,
  Server,
  Download,
  Film,
  Tv,
  RefreshCw,
  Maximize2,
  Sparkles,
  Layers,
  ChevronRight,
  Star,
  ExternalLink,
  Share2,
  Check,
  Moon,
  Sun,
  Video,
} from 'lucide-react';
import { MovieDetail, MovieSubtitle } from '@/lib/api/types';
import { saveHistory } from '@/lib/history';
import BookmarkButton from './BookmarkButton';

interface MoviePlayerSectionProps {
  movie: MovieDetail;
  initialSeason?: number;
  initialEpisode?: number;
}

export default function MoviePlayerSection({
  movie,
  initialSeason = 1,
  initialEpisode = 1,
}: MoviePlayerSectionProps) {
  const isTv = movie.type === 'tv';

  // Server selection
  const [currentServerIndex, setCurrentServerIndex] = useState(0);

  // TV Seasons & Episodes
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);

  // Cinema Mode (Darken lights)
  const [isCinemaMode, setIsCinemaMode] = useState(false);

  // Trailer toggle mode
  const [viewMode, setViewMode] = useState<'stream' | 'trailer'>('stream');

  // Reload trigger
  const [playerKey, setPlayerKey] = useState(0);

  // Copy link feedback
  const [copied, setCopied] = useState(false);

  // Subtitles state
  const [subtitles, setSubtitles] = useState<MovieSubtitle[]>([]);
  const [subtitlesLoading, setSubtitlesLoading] = useState(false);
  const [subtitleLang, setSubtitleLang] = useState('id,en');
  const [activeTab, setActiveTab] = useState<'servers' | 'subtitles' | 'episodes'>('servers');

  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Filter seasons (exclude season 0 specials from the top if regular seasons exist)
  const seasonsList = useMemo(() => {
    if (!movie.seasons || movie.seasons.length === 0) return [];
    return [...movie.seasons].sort((a, b) => a.season - b.season);
  }, [movie.seasons]);

  const currentSeasonData = useMemo(() => {
    return (
      seasonsList.find((s) => s.season === selectedSeason) ||
      seasonsList[0] || { season: 1, episodes: 1 }
    );
  }, [seasonsList, selectedSeason]);

  // Compute embed URL for current server + season/episode
  const currentEmbedUrl = useMemo(() => {
    if (viewMode === 'trailer' && movie.trailer) {
      return movie.trailer;
    }

    const baseServers = movie.servers || [];
    if (baseServers.length === 0) return '';

    const server = baseServers[currentServerIndex] || baseServers[0];

    if (!isTv) {
      return server.url;
    }

    // Dynamic TV embed replacement for current season and episode
    const s = selectedSeason;
    const e = selectedEpisode;
    const id = movie.id;

    switch (server.name) {
      case 'VidLink':
        return `https://vidlink.pro/tv/${id}/${s}/${e}`;
      case 'Videasy':
        return `https://player.videasy.net/tv/${id}/${s}/${e}`;
      case 'VidFast':
        return `https://vidfast.pro/tv/${id}/${s}/${e}`;
      case 'VidSrc':
        return `https://vidsrc.to/embed/tv/${id}/${s}/${e}`;
      case '2Embed':
        return `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`;
      case 'MultiEmbed':
        return `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`;
      case 'AutoEmbed':
        return `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`;
      default:
        return server.url;
    }
  }, [movie, currentServerIndex, selectedSeason, selectedEpisode, isTv, viewMode]);

  // Save history on initial load and when episode changes
  useEffect(() => {
    const subTitle = isTv
      ? `Season ${selectedSeason} • Episode ${selectedEpisode}`
      : 'Film Box Office';

    const currentUrl = isTv
      ? `/movie/tv/${movie.id}?season=${selectedSeason}&episode=${selectedEpisode}`
      : `/movie/movie/${movie.id}`;

    saveHistory({
      type: 'movie',
      id: isTv ? `tv-${movie.id}-s${selectedSeason}-e${selectedEpisode}` : `movie-${movie.id}`,
      title: movie.title,
      poster: movie.poster || '',
      subTitle,
      url: currentUrl,
    });
  }, [movie, isTv, selectedSeason, selectedEpisode]);

  // Fetch Subtitles
  useEffect(() => {
    let active = true;
    setSubtitlesLoading(true);

    const url = `/api/movie/film/${movie.type}/${movie.id}/subtitles?lang=${encodeURIComponent(
      subtitleLang
    )}&season=${selectedSeason}&episode=${selectedEpisode}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setSubtitles(Array.isArray(data?.subtitles) ? data.subtitles : []);
        setSubtitlesLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Error fetching subtitles:', err);
        setSubtitles([]);
        setSubtitlesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [movie.type, movie.id, subtitleLang, selectedSeason, selectedEpisode]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReload = () => {
    setPlayerKey((k) => k + 1);
  };

  return (
    <div className="relative w-full space-y-6">
      {/* Cinema Mode Dim Overlay */}
      {isCinemaMode && (
        <div
          className="fixed inset-0 z-40 bg-black/90 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsCinemaMode(false)}
        />
      )}

      {/* Main Video Player Container */}
      <div
        ref={playerContainerRef}
        className={`relative z-40 overflow-hidden rounded-2xl bg-black border border-neutral-800 shadow-2xl transition-all duration-300 ${
          isCinemaMode ? 'ring-2 ring-rose-500 shadow-rose-600/30' : ''
        }`}
      >
        {/* Top Player Control Bar */}
        <div className="flex items-center justify-between bg-[#121212] px-4 py-2.5 border-b border-neutral-800 text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-white truncate">{movie.title}</span>
            {isTv && (
              <span className="rounded bg-rose-600/20 px-2 py-0.5 text-[11px] font-bold text-rose-300 shrink-0">
                S{selectedSeason} E{selectedEpisode}
              </span>
            )}
            {viewMode === 'trailer' && (
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-300 shrink-0">
                Official Trailer
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Cinema mode button */}
            <button
              onClick={() => setIsCinemaMode(!isCinemaMode)}
              title={isCinemaMode ? 'Matikan Bioskop Mode' : 'Mode Bioskop (Lampu Gelap)'}
              className={`p-1.5 rounded-lg border transition-colors ${
                isCinemaMode
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {isCinemaMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            {/* Reload iframe */}
            <button
              onClick={handleReload}
              title="Muat ulang pemutar"
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>

            {/* Share link */}
            <button
              onClick={handleShare}
              title="Salin tautan"
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Share2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Video Iframe Embed */}
        <div className="relative aspect-video w-full bg-black">
          {currentEmbedUrl ? (
            <iframe
              key={`${playerKey}-${currentEmbedUrl}`}
              src={currentEmbedUrl}
              className="h-full w-full border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              title={`${movie.title} Player`}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
              <Film className="h-12 w-12 text-neutral-600 mb-3" />
              <p className="text-sm font-semibold text-neutral-300">
                Server video sedang tidak tersedia.
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Silakan pilih server alternatif di bawah.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Banner inside player */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121212] px-4 py-3 border-t border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Server aktif:</span>
            <span className="font-bold text-rose-400">
              {viewMode === 'trailer'
                ? 'YouTube (Trailer)'
                : movie.servers[currentServerIndex]?.name || 'Server 1'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {movie.trailer && (
              <button
                onClick={() => setViewMode(viewMode === 'stream' ? 'trailer' : 'stream')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'trailer'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                <span>{viewMode === 'trailer' ? 'Kembali ke Film' : 'Trailer YouTube'}</span>
              </button>
            )}

            <BookmarkButton
              id={isTv ? `tv-${movie.id}` : `movie-${movie.id}`}
              type="movie"
              slug={`${movie.type}/${movie.id}`}
              title={movie.title}
              poster={movie.poster || undefined}
              subTitle={isTv ? 'Serial TV' : 'Film Box Office'}
              url={`/movie/${movie.type}/${movie.id}`}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Tabs Section: Servers, Episodes (if TV), Subtitles */}
      <div className="rounded-2xl border border-neutral-800 bg-[#121212] p-4 sm:p-6 backdrop-blur-md space-y-5">
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('servers')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'servers'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Server className="h-4 w-4" />
            <span>Pilih Server ({movie.servers.length})</span>
          </button>

          {isTv && (
            <button
              onClick={() => setActiveTab('episodes')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'episodes'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Daftar Episode</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('subtitles')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'subtitles'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Subtitle (.SRT)</span>
            {subtitles.length > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-bold">
                {subtitles.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Server Switcher */}
        {activeTab === 'servers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-400">
                Pilih server cadangan jika pemutar saat ini macet, buffering, atau terkena limit iklan:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {movie.servers.map((sv, idx) => {
                const isActive = viewMode === 'stream' && currentServerIndex === idx;
                return (
                  <button
                    key={sv.name}
                    onClick={() => {
                      setViewMode('stream');
                      setCurrentServerIndex(idx);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all border ${
                      isActive
                        ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-500/40'
                        : 'bg-neutral-900/90 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <Server className="h-3.5 w-3.5 text-rose-400" />
                    <span>{sv.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: TV Show Episodes & Seasons (if applicable) */}
        {isTv && activeTab === 'episodes' && (
          <div className="space-y-4">
            {/* Season Selector Pills */}
            {seasonsList.length > 1 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-neutral-400">Pilih Season:</span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {seasonsList.map((sn) => {
                    const isSeasonActive = selectedSeason === sn.season;
                    return (
                      <button
                        key={sn.season}
                        onClick={() => {
                          setSelectedSeason(sn.season);
                          setSelectedEpisode(1);
                        }}
                        className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border ${
                          isSeasonActive
                            ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-600/30'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                        }`}
                      >
                        {sn.season === 0 ? 'Specials (S0)' : `Season ${sn.season}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Episodes Grid */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-neutral-400">
                Episode untuk Season {selectedSeason} ({currentSeasonData.episodes} Episode):
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-60 overflow-y-auto p-1">
                {Array.from({ length: currentSeasonData.episodes || 1 }, (_, i) => i + 1).map(
                  (epNum) => {
                    const isEpActive = selectedEpisode === epNum;
                    return (
                      <button
                        key={epNum}
                        onClick={() => {
                          setSelectedEpisode(epNum);
                          setViewMode('stream');
                        }}
                        className={`flex items-center justify-center rounded-lg py-2 text-xs font-bold transition-all border ${
                          isEpActive
                            ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-600/40'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        Ep {epNum}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Subtitles Panel */}
        {activeTab === 'subtitles' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>SubDL Subtitle Archive</span>
                  <span className="rounded bg-rose-600/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                    Direct .SRT
                  </span>
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Unduh subtitle film/serial dalam format .SRT langsung ke perangkat Anda.
                </p>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-neutral-400">Bahasa:</span>
                <select
                  value={subtitleLang}
                  onChange={(e) => setSubtitleLang(e.target.value)}
                  className="rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                >
                  <option value="id,en">Indonesia & English (Default)</option>
                  <option value="id">Hanya Indonesia 🇮🇩</option>
                  <option value="en">Hanya English 🇬🇧</option>
                </select>
              </div>
            </div>

            {/* Subtitles List */}
            {subtitlesLoading ? (
              <div className="py-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-rose-500" />
                <span>Mencari subtitle resmi dari OpenSubtitles...</span>
              </div>
            ) : subtitles.length === 0 ? (
              <div className="py-10 text-center rounded-xl bg-neutral-900/40 border border-neutral-800/60 p-4">
                <p className="text-xs text-neutral-400">
                  Tidak ada subtitle yang cocok ditemukan untuk bahasa ini.
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Beberapa server di atas sudah dilengkapi dengan auto-subtitle bawaan player.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {subtitles.map((sub, idx) => {
                  const isId = sub.language === 'id';
                  const flag = isId ? '🇮🇩' : sub.language === 'en' ? '🇬🇧' : '🌐';
                  const langName = isId ? 'Indonesia' : sub.language === 'en' ? 'English' : sub.language.toUpperCase();
                  const downloadHref = sub.download_url.startsWith('http')
                    ? sub.download_url
                    : `/api/movie${sub.download_url.startsWith('/v1/api') ? sub.download_url.replace('/v1/api', '') : sub.download_url}`;

                  return (
                    <div
                      key={sub.id || idx}
                      className="flex items-center justify-between gap-3 rounded-xl bg-neutral-900/80 border border-neutral-800/80 p-3 hover:border-neutral-700 transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              isId
                                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                                : 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {flag} {langName}
                          </span>
                          {sub.author && (
                            <span className="text-[10px] text-neutral-400 font-medium">
                              • by {sub.author}
                            </span>
                          )}
                          {sub.rating !== null && sub.rating !== undefined && sub.rating > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-semibold">
                              <Star className="h-2.5 w-2.5 fill-amber-400" />
                              {sub.rating.toFixed(1)}
                            </span>
                          )}
                          {sub.download_count !== null && sub.download_count !== undefined && (
                            <span className="text-[10px] text-neutral-500">
                              • {sub.download_count} unduhan
                            </span>
                          )}
                        </div>
                        <p
                          className="text-xs font-medium text-neutral-200 truncate"
                          title={sub.release || sub.file_name}
                        >
                          {sub.release || sub.file_name}
                        </p>
                      </div>

                      <a
                        href={downloadHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500 active:scale-95 transition-all shadow-sm"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Unduh .SRT</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
