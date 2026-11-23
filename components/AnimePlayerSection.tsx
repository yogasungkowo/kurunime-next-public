'use client';

import { useState, useEffect } from 'react';
import { Play, Server, Download, Film, Loader2, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { AnimeDetail, EpisodeDetailData } from '@/lib/api/types';
import { saveHistory } from '@/lib/history';
import BookmarkButton from './BookmarkButton';
import CustomVideoPlayer from './CustomVideoPlayer';

const ANIME_API_BASE =
  process.env.NEXT_PUBLIC_ANIME_API_URL || 'https://anime-api.prasunk.my.id/otakudesu';

interface AnimePlayerSectionProps {
  anime: AnimeDetail;
  initialEpisodeId: string;
}

interface ParsedServerItem {
  serverId: string;
  name: string;
  quality: string;
}

interface QualityGroup {
  quality: string;
  label: string;
  isHD: boolean;
  servers: ParsedServerItem[];
}

function safeBase64Decode(str: string): string {
  try {
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      return window.atob(str);
    }
    return Buffer.from(str, 'base64').toString();
  } catch {
    return '';
  }
}

function parseServerQuality(serverId: string, fallbackQuality: string): string {
  try {
    const raw = safeBase64Decode(serverId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.q) {
        const q = String(parsed.q).toLowerCase().trim();
        if (q.includes('1080')) return '1080p';
        if (q.includes('720')) return '720p';
        if (q.includes('480')) return '480p';
        if (q.includes('360')) return '360p';
        return q;
      }
    }
  } catch {
    const match = serverId.match(/(1080|720|480|360)p?/i);
    if (match) return match[1].toLowerCase() + 'p';
  }
  return fallbackQuality;
}

function cleanServerTitle(title: string): string {
  if (!title) return 'SERVER';
  const clean = title
    .replace(/\(.*?\)/g, '')
    .replace(/mirror\s*/gi, '')
    .replace(/\b(1080|720|480|360)p?\b/gi, '')
    .trim()
    .toUpperCase();
  return clean || 'SERVER';
}

function getGroupedServers(episodeData: EpisodeDetailData | null): QualityGroup[] {
  if (!episodeData?.server?.qualityList?.length) return [];

  const qualityOrder = ['1080p', '720p', '480p', '360p'];
  const map: Record<string, ParsedServerItem[]> = {};

  episodeData.server.qualityList.forEach((qGroup, qIdx) => {
    const fallback = qIdx === 0 ? '360p' : qIdx === 1 ? '480p' : '720p';

    (qGroup.serverList || []).forEach((srv) => {
      if (!srv?.serverId) return;
      const trueQuality = parseServerQuality(srv.serverId, fallback);
      const cleanName = cleanServerTitle(srv.title);

      if (!map[trueQuality]) {
        map[trueQuality] = [];
      }

      if (!map[trueQuality].some((s) => s.serverId === srv.serverId)) {
        map[trueQuality].push({
          serverId: srv.serverId,
          name: cleanName,
          quality: trueQuality,
        });
      }
    });
  });

  const result: QualityGroup[] = [];
  qualityOrder.forEach((q) => {
    if (map[q]?.length) {
      result.push({
        quality: q,
        label: q === '1080p' ? '1080p FHD' : q === '720p' ? '720p HD' : q === '480p' ? '480p SD' : '360p Low',
        isHD: q === '1080p' || q === '720p',
        servers: map[q],
      });
      delete map[q];
    }
  });

  Object.keys(map).forEach((q) => {
    if (map[q]?.length) {
      result.push({
        quality: q,
        label: q.toUpperCase(),
        isHD: false,
        servers: map[q],
      });
    }
  });

  return result;
}

export default function AnimePlayerSection({
  anime,
  initialEpisodeId,
}: AnimePlayerSectionProps) {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(initialEpisodeId);
  const [episodeData, setEpisodeData] = useState<EpisodeDetailData | null>(null);
  const [loadingEpisode, setLoadingEpisode] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loadingEmbed, setLoadingEmbed] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [episodeSearch, setEpisodeSearch] = useState('');

  // Direct Stream & Player State
  const [directStreamUrl, setDirectStreamUrl] = useState<string | null>(null);
  const [isExtractingStream, setIsExtractingStream] = useState(false);
  const [playerMode, setPlayerMode] = useState<'iframe' | 'direct'>('iframe');

  const extractStream = async (targetEmbedUrl: string): Promise<string | null> => {
    if (!targetEmbedUrl) return null;
    setIsExtractingStream(true);
    try {
      const res = await fetch('/api/stream/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embedUrl: targetEmbedUrl }),
      });
      const json = await res.json();
      if (json.success && json.streamUrl) {
        setDirectStreamUrl(json.streamUrl);
        setPlayerMode('direct');
        return json.streamUrl;
      }
    } catch (e) {
      console.error('Error extracting direct stream', e);
    } finally {
      setIsExtractingStream(false);
    }
    setDirectStreamUrl(null);
    setPlayerMode('iframe');
    return null;
  };

  // Fetch episode details when selectedEpisodeId changes
  useEffect(() => {
    if (!selectedEpisodeId) return;

    let active = true;
    setLoadingEpisode(true);

    fetch(`${ANIME_API_BASE}/episode/${selectedEpisodeId}`)
      .then((res) => res.json())
      .then(async (json) => {
        if (!active) return;
        const details: EpisodeDetailData = json?.data?.details;
        setEpisodeData(details || null);

        // Record to watch history
        saveHistory({
          type: 'anime',
          id: anime.slug || anime.id,
          title: anime.title,
          poster: anime.poster,
          subTitle: details?.title || selectedEpisodeId,
          url: `/anime/${anime.slug || anime.id}`,
        });

        // Parse grouped servers to pick the best default (720p HD with extractable server first)
        const groups = getGroupedServers(details || null);
        let bestServer: ParsedServerItem | null = null;
        for (const grp of groups) {
          if (grp.servers.length > 0) {
            // Prefer clean extractable server (e.g. vidhide or odcdn) so player is 100% ad-free
            const cleanSrv = grp.servers.find((s) => /vidhide|odcdn/i.test(s.name));
            bestServer = cleanSrv || grp.servers[0];
            break;
          }
        }

        if (bestServer) {
          setSelectedServerId(bestServer.serverId);
          setLoadingEmbed(true);
          try {
            const serverRes = await fetch(
              `${ANIME_API_BASE}/server/${encodeURIComponent(bestServer.serverId)}`,
              { method: 'POST' }
            );
            const serverJson = await serverRes.json();
            if (active) {
              const url = serverJson?.data?.details?.url;
              if (url) {
                setEmbedUrl(url);
                extractStream(url);
              } else if (details?.defaultStreamingUrl) {
                setEmbedUrl(details.defaultStreamingUrl);
                extractStream(details.defaultStreamingUrl);
              }
            }
          } catch (e) {
            console.error('Failed to get initial embed', e);
            if (active && details?.defaultStreamingUrl) {
              setEmbedUrl(details.defaultStreamingUrl);
              extractStream(details.defaultStreamingUrl);
            }
          } finally {
            if (active) setLoadingEmbed(false);
          }
        } else if (details?.defaultStreamingUrl) {
          setSelectedServerId(null);
          setEmbedUrl(details.defaultStreamingUrl);
          extractStream(details.defaultStreamingUrl);
        }
      })
      .catch((err) => {
        console.error('Error fetching episode data', err);
      })
      .finally(() => {
        if (active) setLoadingEpisode(false);
      });

    return () => {
      active = false;
    };
  }, [selectedEpisodeId, anime.id, anime.slug, anime.title, anime.poster]);

  // Anti-Tab-Hijack: Protect parent page from being redirected by embedded player ads
  useEffect(() => {
    let allowNav = false;

    const handleInternalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a, button');
      if (target) {
        allowNav = true;
        setTimeout(() => {
          allowNav = false;
        }, 1500);
      }
    };

    window.addEventListener('click', handleInternalClick, true);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!allowNav && document.activeElement instanceof HTMLIFrameElement) {
        e.preventDefault();
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('click', handleInternalClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleSelectServer = async (serverId: string) => {
    if (selectedServerId === serverId && embedUrl) return;
    setSelectedServerId(serverId);

    setLoadingEmbed(true);
    try {
      const res = await fetch(
        `${ANIME_API_BASE}/server/${encodeURIComponent(serverId)}`,
        { method: 'POST' }
      );
      const json = await res.json();
      const url = json?.data?.details?.url;
      if (url) {
        setEmbedUrl(url);
        extractStream(url);
      }
    } catch (e) {
      console.error('Error switching server', e);
    } finally {
      setLoadingEmbed(false);
    }
  };

  const filteredEpisodes = anime.episodesList.filter((ep) =>
    ep.title.toLowerCase().includes(episodeSearch.toLowerCase()) ||
    ep.episodeId.toLowerCase().includes(episodeSearch.toLowerCase())
  );

  const currentEpIndex = anime.episodesList.findIndex((ep) => ep.episodeId === selectedEpisodeId);
  const prevEp = currentEpIndex < anime.episodesList.length - 1 ? anime.episodesList[currentEpIndex + 1] : null;
  const nextEp = currentEpIndex > 0 ? anime.episodesList[currentEpIndex - 1] : null;

  return (
    <div className="space-y-6">
      {/* 1. Video Player Container (IDLIX Cinema Frame) */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-neutral-800 shadow-2xl ring-1 ring-rose-600/30">
        {loadingEpisode || loadingEmbed || isExtractingStream ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-rose-500 gap-3 z-30">
            <Loader2 className="h-10 w-10 animate-spin" />
            <span className="text-sm font-semibold text-neutral-300">
              {isExtractingStream
                ? 'Mempersiapkan Stream Bersih Bebas Iklan...'
                : 'Memuat Video Player...'}
            </span>
          </div>
        ) : playerMode === 'direct' && directStreamUrl ? (
          <CustomVideoPlayer
            src={directStreamUrl}
            poster={anime.poster}
            title={episodeData?.title || anime.title}
            onFallbackToIframe={() => setPlayerMode('iframe')}
          />
        ) : embedUrl ? (
          <iframe
            key={embedUrl}
            src={embedUrl}
            className="h-full w-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] p-6 text-center text-neutral-400">
            <Film className="h-12 w-12 text-neutral-600 mb-3" />
            <p className="text-sm font-medium">
              Pilih server mirror atau episode di bawah untuk memulai pemutaran video.
            </p>
          </div>
        )}
      </div>

      {/* 2. Episode Navigator & Server Selector Bar */}
      <div className="rounded-xl border border-neutral-800 bg-[#141414] p-4 backdrop-blur-md space-y-4">
        {/* Navigation & Current Episode Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
                Sedang Diputar
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {episodeData?.title || `Episode ${anime.episodesList.find((e) => e.episodeId === selectedEpisodeId)?.title || selectedEpisodeId}`}
              </h3>
            </div>

            {directStreamUrl && (
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-neutral-800 text-xs self-start sm:self-auto">
                <button
                  onClick={() => setPlayerMode(playerMode === 'direct' ? 'iframe' : 'direct')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    playerMode === 'direct'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-white" />
                  <span>{playerMode === 'direct' ? 'Player Bebas Iklan' : 'Coba Mode Bebas Iklan'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <BookmarkButton
              id={`anime-${anime.id || anime.slug || selectedEpisodeId}`}
              type="anime"
              slug={anime.id || anime.slug || ''}
              title={anime.title}
              poster={anime.poster}
              subTitle={`Ep ${anime.episodesList.find((e) => e.episodeId === selectedEpisodeId)?.title || selectedEpisodeId}`}
              url={`/anime/${anime.id || anime.slug}`}
              size="sm"
            />

            {prevEp && (
              <button
                onClick={() => setSelectedEpisodeId(prevEp.episodeId)}
                className="flex items-center gap-1.5 rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:border-neutral-700 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Ep {prevEp.title}</span>
              </button>
            )}
            {nextEp && (
              <button
                onClick={() => setSelectedEpisodeId(nextEp.episodeId)}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-rose-600/30 hover:bg-rose-500 transition-colors"
              >
                <span>Ep {nextEp.title}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Server Quality Mirror Groups */}
        {(() => {
          const groupedServers = getGroupedServers(episodeData);
          if (groupedServers.length === 0) return null;

          return (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  <Server className="h-3.5 w-3.5 text-rose-500" />
                  <span>Pilihan Server & Kualitas Video:</span>
                </div>
                <span className="text-[11px] text-neutral-500 hidden sm:inline">
                  Klik server pada kualitas yang diinginkan
                </span>
              </div>

              <div className="space-y-2">
                {groupedServers.map((grp) => (
                  <div
                    key={grp.quality}
                    className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-2.5 rounded-xl bg-black/60 border border-neutral-800/90"
                  >
                    {/* Quality Tag */}
                    <div className="flex items-center gap-2 sm:w-28 shrink-0">
                      <span
                        className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-extrabold tracking-wide uppercase shadow-sm ${
                          grp.isHD
                            ? 'bg-rose-600/20 text-rose-400 border border-rose-500/40'
                            : 'bg-neutral-800 text-neutral-300 border border-neutral-700/60'
                        }`}
                      >
                        {grp.label}
                      </span>
                    </div>

                    {/* Server Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {grp.servers.map((srv) => {
                        const isSelected = selectedServerId === srv.serverId;
                        return (
                          <button
                            key={srv.serverId}
                            onClick={() => handleSelectServer(srv.serverId)}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                              isSelected
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 ring-2 ring-rose-400 font-bold'
                                : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white hover:bg-neutral-800'
                            }`}
                          >
                            <Play className={`h-2.5 w-2.5 ${isSelected ? 'fill-white' : 'fill-rose-500 text-rose-500'}`} />
                            <span>{srv.name}</span>
                            {isSelected && (
                              <span className="ml-1 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* 3. Episode Grid Selector */}
      <div className="rounded-xl border border-neutral-800 bg-[#141414] p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-rose-500" />
            <h4 className="text-sm font-bold text-white">
              Daftar Episode ({anime.episodesList.length})
            </h4>
          </div>

          <input
            type="text"
            placeholder="Cari nomor episode..."
            value={episodeSearch}
            onChange={(e) => setEpisodeSearch(e.target.value)}
            className="rounded-lg bg-black border border-neutral-800 px-3 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 w-full sm:w-48"
          />
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-56 overflow-y-auto pr-1">
          {filteredEpisodes.map((ep) => {
            const isSelected = ep.episodeId === selectedEpisodeId;
            return (
              <button
                key={ep.episodeId}
                onClick={() => setSelectedEpisodeId(ep.episodeId)}
                className={`rounded-lg py-2 px-1 text-center text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40 ring-2 ring-rose-400'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                }`}
              >
                Ep {ep.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Download Links Section */}
      {episodeData?.download?.qualityList && episodeData.download.qualityList.length > 0 && (
        <div className="rounded-xl border border-neutral-800 bg-[#141414] p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-bold text-white">
            <Download className="h-4 w-4 text-rose-500" />
            <span>Download Episode Ini</span>
          </div>

          <div className="space-y-3">
            {episodeData.download.qualityList.map((quality, qIdx) => (
              <div
                key={qIdx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-neutral-900 border border-neutral-800"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-rose-600/20 px-2 py-0.5 text-xs font-bold text-rose-300">
                    {quality.title}
                  </span>
                  {quality.size && (
                    <span className="text-xs text-neutral-400">({quality.size})</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {quality.urlList.map((link, lIdx) => (
                    <a
                      key={lIdx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded bg-black border border-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:border-rose-500/50 hover:text-rose-400 transition-colors"
                    >
                      {link.title}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
