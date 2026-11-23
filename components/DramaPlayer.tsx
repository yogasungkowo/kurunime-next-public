'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
  ChevronLeft,
  ChevronRight,
  List,
  Flame,
  Check,
  Smartphone,
  Tv,
  Lock,
} from 'lucide-react';
import { DramaEpisodeItem, DramaVideoStream } from '@/lib/api/types';
import { saveHistory } from '@/lib/history';

interface DramaPlayerProps {
  bookId: string;
  bookTitle: string;
  bookPic: string;
  chapterId: string;
  chapterName: string;
  serialNumber: number;
  videoStreams: DramaVideoStream[];
  defaultVideoUrl?: string;
  episodesList: DramaEpisodeItem[];
  isLock?: number;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function DramaPlayer({
  bookId,
  bookTitle,
  bookPic,
  chapterId,
  chapterName,
  serialNumber,
  videoStreams,
  defaultVideoUrl,
  episodesList,
  isLock,
}: DramaPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Available streams sorted by DPI descending
  const sortedStreams = [...videoStreams].sort(
    (a, b) => (b.Dpi || 0) - (a.Dpi || 0)
  );

  // Default to 720p or highest available stream
  const [selectedQualityIndex, setSelectedQualityIndex] = useState(() => {
    if (sortedStreams.length === 0) return 0;
    const index720 = sortedStreams.findIndex((s) => s.Dpi === 720);
    return index720 >= 0 ? index720 : 0;
  });

  const activeStreamUrl =
    sortedStreams[selectedQualityIndex]?.PlayURL ||
    sortedStreams[0]?.PlayURL ||
    defaultVideoUrl ||
    '';

  const isLocked = isLock === 1 || (!activeStreamUrl && videoStreams.length === 0);
  const firstFreeEp = episodesList.find((ep) => !ep.is_lock || ep.is_lock === 0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [autoNext, setAutoNext] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isPortraitMode, setIsPortraitMode] = useState(true);

  // Find next & prev episode
  const currentEpIndex = episodesList.findIndex(
    (ep) => ep.chapter_id === chapterId || ep.serial_number === serialNumber
  );
  const prevEp = currentEpIndex > 0 ? episodesList[currentEpIndex - 1] : null;
  const nextEp =
    currentEpIndex >= 0 && currentEpIndex < episodesList.length - 1
      ? episodesList[currentEpIndex + 1]
      : null;

  // Save to Watch History
  useEffect(() => {
    saveHistory({
      type: 'drama',
      id: `drama-${bookId}-${chapterId}`,
      title: bookTitle,
      poster: bookPic,
      subTitle: chapterName || `Episode ${serialNumber}`,
      url: `/drama/watch/${bookId}/${chapterId}`,
    });
  }, [bookId, chapterId, bookTitle, bookPic, chapterName, serialNumber]);

  // Handle HLS stream loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeStreamUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const savedTime = currentTime;

    if (Hls.isSupported() && activeStreamUrl.includes('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hlsRef.current = hls;

      hls.loadSource(activeStreamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (savedTime > 0) {
          video.currentTime = savedTime;
        }
        video.play().catch(() => setIsPlaying(false));
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      video.src = activeStreamUrl;
      if (savedTime > 0) {
        video.currentTime = savedTime;
      }
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.src = activeStreamUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeStreamUrl]);

  // Video event handlers
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  };

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (autoNext && nextEp) {
      router.push(`/drama/watch/${bookId}/${nextEp.chapter_id}`);
    }
  }, [autoNext, nextEp, bookId, router]);

  // Controls visibility timeout
  const resetControlsTimeout = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setControlsVisible(false);
        setShowSettings(false);
      }, 3500);
    }
  }, [isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetControlsTimeout();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (val: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = val;
    setVolume(val);
    video.muted = val === 0;
    setIsMuted(val === 0);
  };

  const seekRelative = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
    resetControlsTimeout();
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      )
        return;

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekRelative(5);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-5);
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="w-full flex flex-col items-center">
      {/* Player Frame Container */}
      <div
        ref={containerRef}
        onMouseMove={resetControlsTimeout}
        onClick={resetControlsTimeout}
        className={`relative bg-black overflow-hidden rounded-2xl shadow-2xl border border-neutral-800 transition-all duration-300 ${
          isPortraitMode
            ? 'w-full max-w-[420px] aspect-[9/16] sm:max-h-[82vh]'
            : 'w-full max-w-4xl aspect-[16/9]'
        }`}
      >
        <video
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
          playsInline
          className="h-full w-full object-contain cursor-pointer"
          onClick={togglePlay}
        />

        {/* Top Header Bar inside Video */}
        <div
          className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-30 transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="flex items-center gap-1 rounded bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shrink-0">
              <Flame className="h-2.5 w-2.5 fill-white" />
              Ep {serialNumber}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-white truncate drop-shadow">
              {chapterName || bookTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle: Portrait / Wide */}
            <button
              onClick={() => setIsPortraitMode(!isPortraitMode)}
              title={isPortraitMode ? 'Ganti ke Cinema Wide' : 'Ganti ke Portrait 9:16'}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-neutral-300 hover:text-white backdrop-blur-md border border-white/10"
            >
              {isPortraitMode ? <Tv className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
            </button>

            {/* Playlist Drawer Button */}
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              title="Daftar Episode"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-neutral-300 hover:text-white backdrop-blur-md border border-white/10"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Locked Episode VIP Notice Overlay */}
        {isLocked ? (
          <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-xl shadow-amber-500/10">
              <Lock className="h-8 w-8 text-amber-400" />
            </div>

            <div className="space-y-1.5 max-w-xs">
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-bold text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Episode VIP / Terkunci
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white pt-1">
                {chapterName || `Episode ${serialNumber}`}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Stream video untuk episode ini terkunci di server ReelShort (episode berbayar). Hanya episode preview / gratis yang dapat diputar secara langsung.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 w-full max-w-xs">
              {firstFreeEp && (
                <button
                  onClick={() => router.push(`/drama/watch/${bookId}/${firstFreeEp.chapter_id}`)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Putar Episode 1 (Gratis)</span>
                </button>
              )}
              <button
                onClick={() => setShowPlaylist(true)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <List className="h-3.5 w-3.5" />
                <span>Pilih Episode Lain</span>
              </button>
            </div>
          </div>
        ) : (
          /* Big Center Play/Pause Overlay on Click */
          !isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-20"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-600/90 text-white shadow-xl shadow-rose-600/50 hover:scale-110 transition-transform">
                <Play className="h-7 w-7 fill-white ml-1" />
              </div>
            </div>
          )
        )}

        {/* Playlist Overlay Drawer */}
        {showPlaylist && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-40 p-4 flex flex-col animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-rose-500" />
                <span className="text-sm font-bold text-white">
                  Daftar Episode ({episodesList.length})
                </span>
              </div>
              <button
                onClick={() => setShowPlaylist(false)}
                className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded bg-white/10"
              >
                Tutup
              </button>
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {episodesList.map((ep) => {
                const isCurrent = ep.chapter_id === chapterId || ep.serial_number === serialNumber;
                const isEpLocked = ep.is_lock === 1;
                return (
                  <button
                    key={ep.chapter_id}
                    onClick={() => {
                      setShowPlaylist(false);
                      router.push(`/drama/watch/${bookId}/${ep.chapter_id}`);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors ${
                      isCurrent
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-center font-mono text-[11px] opacity-75">
                        #{ep.serial_number}
                      </span>
                      <span>{ep.chapter_name || `Episode ${ep.serial_number}`}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isEpLocked ? (
                        <span className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                          <Lock className="h-2.5 w-2.5" />
                          VIP
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                          FREE
                        </span>
                      )}
                      {isCurrent && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Controls Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-2 z-30 transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress Bar */}
          <div className="relative group/progress cursor-pointer flex items-center py-1">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentTime(val);
                if (videoRef.current) {
                  videoRef.current.currentTime = val;
                }
              }}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-rose-600 focus:outline-none"
            />
          </div>

          {/* Controls Strip */}
          <div className="flex items-center justify-between gap-2 text-white">
            {/* Left Controls: Prev, Play/Pause, Next, Time */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Prev Ep */}
              <button
                disabled={!prevEp}
                onClick={() => prevEp && router.push(`/drama/watch/${bookId}/${prevEp.chapter_id}`)}
                className={`p-1 rounded hover:bg-white/10 transition-colors ${
                  !prevEp ? 'opacity-30 cursor-not-allowed' : 'text-neutral-200 hover:text-white'
                }`}
                title="Episode Sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="p-1 rounded hover:bg-white/10 text-white transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-white" />}
              </button>

              {/* Next Ep */}
              <button
                disabled={!nextEp}
                onClick={() => nextEp && router.push(`/drama/watch/${bookId}/${nextEp.chapter_id}`)}
                className={`p-1 rounded hover:bg-white/10 transition-colors ${
                  !nextEp ? 'opacity-30 cursor-not-allowed' : 'text-neutral-200 hover:text-white'
                }`}
                title="Episode Selanjutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Volume & Mute */}
              <div className="hidden sm:flex items-center gap-1.5 group/vol">
                <button onClick={toggleMute} className="p-1 text-neutral-300 hover:text-white">
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-white/20 rounded-full appearance-none accent-rose-600 cursor-pointer"
                />
              </div>

              {/* Time Counter */}
              <span className="text-[11px] font-mono text-neutral-300">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls: Auto-Next, Settings, Fullscreen */}
            <div className="flex items-center gap-2">
              {/* Auto-Next Switch */}
              <button
                onClick={() => setAutoNext(!autoNext)}
                title={autoNext ? 'Auto-Next Aktif' : 'Auto-Next Nonaktif'}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                  autoNext
                    ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                    : 'bg-white/5 border-white/10 text-neutral-400'
                }`}
              >
                Auto-Next
              </button>

              {/* Quality & Speed Settings Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 rounded hover:bg-white/10 text-neutral-300 hover:text-white"
                  title="Pengaturan Kualitas & Kecepatan"
                >
                  <Settings className="h-4 w-4" />
                </button>

                {showSettings && (
                  <div className="absolute right-0 bottom-full mb-2 w-44 rounded-xl bg-neutral-900 border border-neutral-800 p-2 text-xs shadow-2xl z-50 animate-in fade-in duration-150">
                    {/* Quality Header */}
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 py-1">
                      Kualitas
                    </div>
                    {sortedStreams.map((stream, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedQualityIndex(idx);
                          setShowSettings(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors ${
                          selectedQualityIndex === idx
                            ? 'bg-rose-600 text-white font-semibold'
                            : 'text-neutral-300 hover:bg-white/5'
                        }`}
                      >
                        <span>{stream.Dpi ? `${stream.Dpi}p` : `Kualitas ${idx + 1}`}</span>
                        {selectedQualityIndex === idx && <Check className="h-3 w-3" />}
                      </button>
                    ))}

                    <div className="my-1 border-t border-neutral-800" />

                    {/* Speed Header */}
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 py-1">
                      Kecepatan Putar
                    </div>
                    {[1, 1.25, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => {
                          setPlaybackRate(spd);
                          if (videoRef.current) {
                            videoRef.current.playbackRate = spd;
                          }
                          setShowSettings(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition-colors ${
                          playbackRate === spd
                            ? 'bg-rose-600 text-white font-semibold'
                            : 'text-neutral-300 hover:bg-white/5'
                        }`}
                      >
                        <span>{spd}x</span>
                        {playbackRate === spd && <Check className="h-3 w-3" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-1 rounded hover:bg-white/10 text-neutral-300 hover:text-white"
                title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Episode Navigation Strip below video */}
      <div className="mt-4 w-full max-w-[420px] flex items-center justify-between gap-2 px-1">
        <button
          disabled={!prevEp}
          onClick={() => prevEp && router.push(`/drama/watch/${bookId}/${prevEp.chapter_id}`)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
            !prevEp
              ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/5 text-neutral-500'
              : 'border-white/10 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 hover:text-white active:scale-98'
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Sebelumnya</span>
        </button>

        <button
          onClick={() => setShowPlaylist(true)}
          className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-white/10 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 hover:text-white text-xs font-semibold transition-all"
        >
          <List className="h-4 w-4 text-rose-500" />
          <span>Ep {serialNumber}/{episodesList.length}</span>
        </button>

        <button
          disabled={!nextEp}
          onClick={() => nextEp && router.push(`/drama/watch/${bookId}/${nextEp.chapter_id}`)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
            !nextEp
              ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/5 text-neutral-500'
              : 'border-rose-500/30 bg-rose-600 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 active:scale-98'
          }`}
        >
          <span>Selanjutnya</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

