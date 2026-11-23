'use client';

import { WatchHistoryItem } from './api/types';
import { canUseStorage, openConsentSettings } from './consent';

const STORAGE_KEY = 'kurunime_history_v1';
const BOOKMARKS_KEY = 'kurunime_bookmarks_v1';

// --- HISTORY FUNCTIONS ---

export function getHistory(): WatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load history', e);
    return [];
  }
}

export function saveHistory(item: Omit<WatchHistoryItem, 'timestamp'>) {
  if (typeof window === 'undefined') return;
  // If consent not granted, do not store to persistent storage
  if (!canUseStorage()) return;

  try {
    const current = getHistory();
    // Remove if already exists with same id/url
    const filtered = current.filter((h) => h.id !== item.id);
    const updated: WatchHistoryItem = {
      ...item,
      timestamp: Date.now(),
    };
    // Keep max 30 items
    const nextList = [updated, ...filtered].slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));

    // Dispatch event for UI reactivity
    window.dispatchEvent(new CustomEvent('kurunime:history-updated'));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function clearHistory() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('kurunime:history-updated'));
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}

// --- BOOKMARK FUNCTIONS ---

export interface BookmarkItem {
  id: string; // unique ID: e.g. "anime-naruto" or "comic-solo-leveling" or "chapter-solo-leveling-15" or "drama-6aac837..."
  type: 'anime' | 'comic' | 'movie' | 'drama';
  slug: string;
  title: string;
  poster?: string;
  subTitle?: string; // e.g. "TV Series • 24 Ep" or "Chapter 15" or "Drama • 67 Ep"
  chapterNumber?: string;
  chapterTitle?: string;
  comicSlug?: string; // backward compat with older comic chapter bookmarks
  url: string;
  timestamp: number;
}

export function getBookmarks(): BookmarkItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load bookmarks', e);
    return [];
  }
}

/**
 * Check if a specific anime or comic is bookmarked by ID
 */
export function isItemBookmarked(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const list = getBookmarks();
    return list.some((b) => b.id === id);
  } catch {
    return false;
  }
}

/**
 * Check bookmark for comic chapters (backward-compatible)
 */
export function isBookmarked(comicSlug: string, chapterNumber?: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const list = getBookmarks();
    if (chapterNumber) {
      return list.some(
        (b) =>
          (b.comicSlug === comicSlug || b.slug === comicSlug) &&
          b.chapterNumber === String(chapterNumber)
      );
    }
    return list.some((b) => b.comicSlug === comicSlug || b.slug === comicSlug);
  } catch {
    return false;
  }
}

/**
 * Toggle bookmark for general anime or comic item
 * Returns: true if added, false if removed
 */
export function toggleBookmarkItem(item: Omit<BookmarkItem, 'timestamp'>): boolean {
  if (typeof window === 'undefined') return false;

  // Check consent before saving
  if (!canUseStorage()) {
    openConsentSettings();
    return false;
  }

  try {
    const list = getBookmarks();
    const existingIndex = list.findIndex((b) => b.id === item.id);

    if (existingIndex >= 0) {
      // Remove
      const updated = list.filter((_, idx) => idx !== existingIndex);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('kurunime:bookmarks-updated'));
      return false;
    } else {
      // Add
      const newEntry: BookmarkItem = {
        ...item,
        timestamp: Date.now(),
      };
      const updated = [newEntry, ...list].slice(0, 100);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('kurunime:bookmarks-updated'));
      return true;
    }
  } catch (e) {
    console.error('Failed to toggle bookmark item', e);
    return false;
  }
}

/**
 * Backward compatible toggle bookmark for comic chapter reader
 */
export function toggleBookmark(item: any): boolean {
  const bookmarkItem: Omit<BookmarkItem, 'timestamp'> = {
    id: item.id || `chapter-${item.comicSlug}-${item.chapterNumber}`,
    type: 'comic',
    slug: item.comicSlug || item.slug || '',
    comicSlug: item.comicSlug,
    title: item.title,
    poster: item.poster,
    subTitle: item.chapterNumber ? `Chapter ${item.chapterNumber}` : undefined,
    chapterNumber: item.chapterNumber ? String(item.chapterNumber) : undefined,
    chapterTitle: item.chapterTitle,
    url: item.url,
  };

  return toggleBookmarkItem(bookmarkItem);
}

/**
 * Remove a bookmark by ID
 */
export function removeBookmark(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const list = getBookmarks();
    const updated = list.filter((b) => b.id !== id);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kurunime:bookmarks-updated'));
  } catch (e) {
    console.error('Failed to remove bookmark', e);
  }
}

/**
 * Clear all bookmarks
 */
export function clearBookmarks() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(BOOKMARKS_KEY);
    window.dispatchEvent(new CustomEvent('kurunime:bookmarks-updated'));
  } catch (e) {
    console.error('Failed to clear bookmarks', e);
  }
}
