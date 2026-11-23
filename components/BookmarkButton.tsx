'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Check } from 'lucide-react';
import { isItemBookmarked, toggleBookmarkItem } from '@/lib/history';

interface BookmarkButtonProps {
  id: string;
  type: 'anime' | 'comic' | 'movie' | 'drama';
  slug: string;
  title: string;
  poster?: string;
  subTitle?: string;
  url: string;
  variant?: 'button' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BookmarkButton({
  id,
  type,
  slug,
  title,
  poster,
  subTitle,
  url,
  variant = 'button',
  size = 'md',
  className = '',
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [justToggled, setJustToggled] = useState(false);

  useEffect(() => {
    setBookmarked(isItemBookmarked(id));

    const handleUpdate = () => {
      setBookmarked(isItemBookmarked(id));
    };

    window.addEventListener('kurunime:bookmarks-updated', handleUpdate);
    return () => window.removeEventListener('kurunime:bookmarks-updated', handleUpdate);
  }, [id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const added = toggleBookmarkItem({
      id,
      type,
      slug,
      title,
      poster,
      subTitle,
      url,
    });

    setBookmarked(added);
    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 1200);
  };

  // Icon Only Variant
  if (variant === 'icon') {
    const sizeClasses =
      size === 'sm'
        ? 'h-8 w-8'
        : size === 'lg'
        ? 'h-11 w-11'
        : 'h-9 w-9';

    return (
      <button
        onClick={handleToggle}
        title={bookmarked ? 'Hapus dari Bookmark' : 'Simpan ke Bookmark'}
        aria-label={bookmarked ? 'Hapus dari Bookmark' : 'Simpan ke Bookmark'}
        className={`relative flex items-center justify-center rounded-xl transition-all active:scale-95 border ${sizeClasses} ${
          bookmarked
            ? 'bg-rose-600/20 border-rose-500 text-rose-500 shadow-sm shadow-rose-600/30'
            : 'bg-black/60 border-white/10 text-neutral-300 hover:border-neutral-500 hover:text-white hover:bg-neutral-900'
        } ${className}`}
      >
        <Bookmark
          className={`${size === 'sm' ? 'h-4 w-4' : 'h-4.5 w-4.5'} ${
            bookmarked ? 'fill-rose-500 text-rose-500' : 'text-current'
          } ${justToggled ? 'scale-125' : ''} transition-transform duration-200`}
        />
      </button>
    );
  }

  // Full Button Variant
  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs'
      : size === 'lg'
      ? 'px-6 py-3 text-sm'
      : 'px-4 py-2.5 text-xs sm:text-sm';

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 rounded-xl font-semibold transition-all active:scale-95 border ${sizeClasses} ${
        bookmarked
          ? 'bg-rose-600/15 border-rose-500/80 text-rose-400 shadow-md shadow-rose-600/20 hover:bg-rose-600/25'
          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white hover:bg-neutral-800'
      } ${className}`}
    >
      <Bookmark
        className={`h-4 w-4 ${
          bookmarked ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'
        } ${justToggled ? 'scale-125' : ''} transition-transform duration-200`}
      />
      <span>
        {bookmarked ? (
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-rose-400" />
            <span>Tersimpan di Bookmark</span>
          </span>
        ) : (
          <span>+ Tambah Bookmark</span>
        )}
      </span>
    </button>
  );
}
