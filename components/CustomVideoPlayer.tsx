'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  ShieldCheck,
  Loader2,
  PictureInPicture2,
  AlertCircle,
} from 'lucide-react';

interface CustomVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  onFallbackToIframe?: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const h = Math.floor(m / 60);
  if (h > 0) {
    const remM = m % 60;
    return `${h}:${remM < 10 ? '0' : ''}${remM}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function CustomVideoPlayer({
  src,
  poster,
  title,
  onFallbackToIframe,
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [controlsVisible, setControlsVisible] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize HLS.js or native playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setIsLoading(true);
    setHasError(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHls = src.includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(() => {
          // Autoplay was prevented by browser policy, keep paused
          setIsPlaying(false);
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn('HLS stream fatal/CORS error:', data.type, data.details);
          hls.destroy();
          hlsRef.current = null;
          if (onFallbackToIframe) {
            onFallbackToIframe();
          } else {
            setHasError(true);
            setErrorMessage('Stream video langsung diblokir oleh kebijakan CORS penyedia.');
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || !isHls) {
      // Native Safari / direct MP4 playback
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(() => setIsPlaying(false));
      });
      video.addEventListener('error', () => {
        setHasError(true);
        setErrorMessage('Format video tidak didukung oleh browser.');
      });
    } else {
      setHasError(true);
      setErrorMessage('Browser tidak mendukung pemutaran HLS langsung.');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // Video event handlers
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);

    // Calculate buffer progress
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const bufPct = (bufferedEnd / (video.duration || 1)) * 100;
      setBuffered(Math.min(bufPct, 100));
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    setIsLoading(false);
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const targetTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const skipSeconds = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 0.5;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (e) {
      console.error('PiP error', e);
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSettings(false);
  };

  // Auto-hide controls
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
        setShowSettings(false);
      }
    }, 2800);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
          e.preventDefault();
          skipSeconds(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          skipSeconds(10);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume((prev) => {
            const next = Math.min(prev + 0.1, 1);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume((prev) => {
            const next = Math.max(prev - 0.1, 0);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setControlsVisible(false)}
      className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-neutral-800 shadow-2xl ring-1 ring-rose-600/30 select-none group"
    >
      {/* Native Video Element */}
      <video
        ref={videoRef}
        poster={poster}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        playsInline
        className="h-full w-full object-contain cursor-pointer"
      />

      {/* Loading Spinner */}
      {isLoading && !hasError && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs text-rose-500 gap-3 z-20">
          <Loader2 className="h-10 w-10 animate-spin" />
          <span className="text-xs font-semibold text-neutral-300">
            Memuat Stream Bersih...
          </span>
        </div>
      )}

      {/* Error Fallback Box */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center z-30 space-y-3">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-1" />
          <h4 className="text-sm font-bold text-white">Gagal Memutar Stream Langsung</h4>
          <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
            {errorMessage || 'Stream video ini diproteksi atau telah kedaluwarsa.'}
          </p>
          {onFallbackToIframe && (
            <button
              onClick={onFallbackToIframe}
              className="mt-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-all active:scale-95"
            >
              Beralih ke Player Iframe
            </button>
          )}
        </div>
      )}

      {/* Top Bar: Title & Bebas Iklan Badge */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-20 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/30 backdrop-blur-sm shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Bebas Iklan (Direct Stream)</span>
          </span>
          {title && <span className="text-xs font-semibold text-neutral-200 truncate">{title}</span>}
        </div>

        {onFallbackToIframe && (
          <button
            onClick={onFallbackToIframe}
            className="text-[11px] font-medium text-neutral-400 hover:text-white bg-black/50 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
          >
            Buka Mode Iframe
          </button>
        )}
      </div>

      {/* Big Center Play/Pause button on click */}
      {!isPlaying && !isLoading && !hasError && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-600/90 text-white shadow-2xl shadow-rose-600/50 hover:bg-rose-500 hover:scale-110 transition-all z-20"
          aria-label="Play video"
        >
          <Play className="h-8 w-8 fill-white translate-x-0.5" />
        </button>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 pt-10 pb-3 px-4 bg-gradient-to-t from-black via-black/80 to-transparent z-20 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber / Progress Bar */}
        <div className="relative mb-3 group/progress">
          {/* Track background */}
          <div className="h-1.5 w-full rounded-full bg-white/20 relative overflow-hidden group-hover/progress:h-2.5 transition-all">
            {/* Buffer progress */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-white/30 rounded-full transition-all duration-200"
              style={{ width: `${buffered}%` }}
            />
            {/* Current played progress */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-rose-600 rounded-full"
              style={{ width: `${currentPercent}%` }}
            />
          </div>

          {/* Invisible interactive input range */}
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={currentPercent}
            onChange={handleSeek}
            className="absolute -top-2 left-0 right-0 w-full h-5 opacity-0 cursor-pointer"
          />
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Play, Skip, Volume, Time */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="text-white hover:text-rose-400 transition-colors"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
            </button>

            <button
              onClick={() => skipSeconds(-10)}
              className="text-neutral-300 hover:text-white transition-colors"
              title="Mundur 10 detik"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={() => skipSeconds(10)}
              className="text-neutral-300 hover:text-white transition-colors"
              title="Maju 10 detik"
            >
              <RotateCw className="h-4 w-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol">
              <button onClick={toggleMute} className="text-neutral-300 hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5 text-rose-500" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 sm:w-20 accent-rose-600 h-1 bg-white/20 rounded-lg cursor-pointer"
              />
            </div>

            {/* Time Stamp */}
            <span className="text-xs font-medium text-neutral-300 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right: Speed, PiP, Fullscreen */}
          <div className="flex items-center gap-3">
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1 text-xs font-bold text-neutral-300 hover:text-white px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-all"
                title="Kecepatan Video"
              >
                <span>{playbackRate}x</span>
              </button>

              {showSettings && (
                <div className="absolute right-0 bottom-full mb-2 w-28 rounded-xl bg-neutral-900 border border-neutral-800 p-1 shadow-2xl backdrop-blur-md z-30">
                  <div className="text-[10px] font-bold text-neutral-500 px-2.5 py-1 uppercase">
                    Kecepatan
                  </div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={`w-full text-left px-2.5 py-1 text-xs rounded-lg transition-colors ${
                        playbackRate === rate ? 'bg-rose-600 text-white font-bold' : 'text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      {rate === 1 ? '1x (Normal)' : `${rate}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Picture in Picture */}
            <button
              onClick={togglePiP}
              className="text-neutral-300 hover:text-white transition-colors"
              title="Picture in Picture"
            >
              <PictureInPicture2 className="h-4 w-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-neutral-300 hover:text-white transition-colors"
              title={isFullscreen ? 'Keluar Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
