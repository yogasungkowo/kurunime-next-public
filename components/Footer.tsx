'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShieldAlert } from 'lucide-react';
import { openDramaComingSoon } from './DramaComingSoonModal';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-800 bg-[#0a0a0a] backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="Kurunime"
                width={36}
                height={36}
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-xl font-black tracking-tight text-white">
                KURU<span className="text-rose-500">NIME</span>
              </span>
            </Link>
            <p className="mt-4 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md">
              Platform streaming anime terlengkap dengan subtitle Indonesia dan tempat baca komik, manga, manhwa gratis terupdate setiap hari. Didesain dengan pengalaman menonton sinematik premium.
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-neutral-400">
              <span className="inline-flex items-center gap-1 rounded bg-neutral-900 border border-neutral-800 px-2 py-1">
                ⚡ Cepat & Hemat Kuota
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-neutral-900 border border-neutral-800 px-2 py-1">
                ⭐ Subtitle Indonesia
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500">
              Navigasi Cepat
            </h4>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm text-neutral-300">
              <li>
                <Link href="/list/ongoing" className="hover:text-rose-400 transition-colors">
                  Anime Ongoing (Tayang)
                </Link>
              </li>
              <li>
                <Link href="/list/completed" className="hover:text-rose-400 transition-colors">
                  Anime Tamat (Completed)
                </Link>
              </li>
              <li>
                <Link href="/jadwal" className="hover:text-rose-400 transition-colors">
                  Jadwal Rilis Harian
                </Link>
              </li>
              <li>
                <Link href="/movie" className="hover:text-rose-400 transition-colors">
                  Movie & Serial TV
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openDramaComingSoon()}
                  className="flex items-center gap-1.5 hover:text-rose-400 transition-colors text-left"
                >
                  <span>Drama Cina & Short Drama</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 leading-none">
                    Soon
                  </span>
                </button>
              </li>
              <li>
                <Link href="/komik" className="hover:text-rose-400 transition-colors">
                  Baca Komik & Manga
                </Link>
              </li>
              <li>
                <Link href="/genre" className="hover:text-rose-400 transition-colors">
                  Daftar Genre Lengkap
                </Link>
              </li>
              <li>
                <Link href="/bookmark" className="hover:text-rose-400 transition-colors text-rose-300">
                  ★ Bookmark Saya
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer & Policy */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500">
              Informasi & Disclaimer
            </h4>
            <p className="mt-3 text-xs text-neutral-400 leading-relaxed">
              Kurunime tidak menyimpan file media video di server kami. Semua video dan gambar di-hosting oleh pihak ketiga.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
              <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
              <span>DMCA / Copyright Notice</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-neutral-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 Kurunime</p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('kurunime:open-saweria-modal'));
                }
              }}
              className="text-rose-400 hover:text-rose-300 font-semibold transition-colors flex items-center gap-1"
            >
              <span>☕ Donasi Saweria</span>
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('kurunime:open-consent-banner'));
                }
              }}
              className="text-neutral-400 hover:text-rose-400 transition-colors underline underline-offset-2"
            >
              Pengaturan Cookie (365 Hari)
            </button>
            <p className="flex items-center gap-1 text-neutral-500">
              Dibuat untuk para pecinta anime & komik Indonesia.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
