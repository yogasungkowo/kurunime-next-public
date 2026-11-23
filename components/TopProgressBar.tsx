'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const trickleInterval = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (trickleInterval.current) {
      clearInterval(trickleInterval.current);
      trickleInterval.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startProgress = useCallback(() => {
    clearTimers();
    setIsFinishing(false);
    setIsVisible(true);
    setProgress(15);

    // Trickle animation simulating progress up to ~85%
    trickleInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) return prev;
        const diff = 85 - prev;
        const step = Math.max(1, Math.floor(diff * 0.15));
        return prev + step;
      });
    }, 150);
  }, [clearTimers]);

  const finishProgress = useCallback(() => {
    if (trickleInterval.current) {
      clearInterval(trickleInterval.current);
      trickleInterval.current = null;
    }

    setProgress(100);
    setIsFinishing(true);

    // Fade out after reaching 100%
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      timeoutRef.current = setTimeout(() => {
        setProgress(0);
        setIsFinishing(false);
      }, 300);
    }, 250);
  }, []);

  // Listen to route changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Route has finished updating
    finishProgress();
  }, [pathname, searchParams, finishProgress]);

  // Intercept click on <a> tags to trigger progress immediately
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Find closest anchor
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      // Ignore modified clicks (Ctrl, Cmd, Shift, Alt, middle click)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      // Ignore if new tab or download
      const targetAttr = anchor.getAttribute('target');
      if (targetAttr && targetAttr !== '_self') return;
      if (anchor.hasAttribute('download')) return;
      if (anchor.getAttribute('rel')?.includes('external')) return;

      const href = anchor.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
        return;
      }

      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Same domain only
        if (targetUrl.origin !== currentUrl.origin) return;

        // If target is exactly identical to current, don't trigger
        if (
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search &&
          targetUrl.hash !== currentUrl.hash
        ) {
          return;
        }

        // If clicking same page without changes
        if (targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search) {
          return;
        }

        startProgress();
      } catch {
        // invalid URL, ignore
      }
    };

    // Popstate (browser back/forward button)
    const handlePopState = () => {
      startProgress();
    };

    // Custom events for programmatic navigation
    const handleCustomStart = () => startProgress();
    const handleCustomDone = () => finishProgress();

    document.addEventListener('click', handleAnchorClick, { capture: true });
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('kurunime:navigation-start', handleCustomStart);
    window.addEventListener('kurunime:navigation-done', handleCustomDone);

    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('kurunime:navigation-start', handleCustomStart);
      window.removeEventListener('kurunime:navigation-done', handleCustomDone);
      clearTimers();
    };
  }, [startProgress, finishProgress, clearTimers]);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      style={{
        opacity: isFinishing ? 0 : 1,
        transition: isFinishing ? 'opacity 300ms ease-out' : 'opacity 150ms ease-in',
      }}
    >
      {/* Background Track (Subtle Translucent Dark) */}
      <div className="h-[3px] w-full bg-transparent overflow-hidden relative">
        {/* Solid Red Animated Bar (No Gradient) */}
        <div
          className="h-full bg-rose-600 relative transition-all ease-out"
          style={{
            width: `${progress}%`,
            transitionDuration: isFinishing ? '200ms' : '250ms',
            boxShadow: '0 0 8px rgba(225, 29, 72, 0.7)',
          }}
        />
      </div>
    </div>
  );
}
