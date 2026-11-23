import { Metadata } from 'next';
import Link from 'next/link';
import {
  Flame,
  Sparkles,
  Clapperboard,
  Film,
  BookOpen,
  ArrowRight,
  Smartphone,
  Zap,
  Globe2,
  Tv,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Drama Cina & Short Drama Sub Indo - Segera Hadir di Kurunime',
  description:
    'Fitur streaming Drama Cina & Short Drama (ReelShort, Drama Pendek Vertikal) dengan subtitle Indonesia sedang dalam tahap pengembangan di Kurunime. Segera hadir!',
  keywords: [
    'Drama Cina Sub Indo',
    'Short Drama Sub Indo',
    'ReelShort Sub Indo',
    'Drama Pendek China',
    'Kurunime Drama',
  ],
  alternates: {
    canonical: '/drama',
  },
};

export default function DramaPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 pb-20">
      {/* Background decoration */}
      <div className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-neutral-800/80 bg-gradient-to-b from-neutral-900/60 via-black to-[#0a0a0a]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-600/15 via-rose-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>FITUR SEDANG DALAM PENGEMBANGAN (COMING SOON)</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Drama Cina & Short Drama <br />
            <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-red-500 bg-clip-text text-transparent">
              Segera Hadir di Kurunime!
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Kami sedang merancang dan menyelesaikan integrasi server serta player video khusus serial drama pendek vertikal (ReelShort, Drama CEO, Romantis, Balas Dendam) lengkap dengan Subtitle Indonesia resolusi HD tanpa hambatan buffering.
          </p>

          {/* Progress Card */}
          <div className="mt-8 p-4 sm:p-5 max-w-xl mx-auto rounded-2xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-md shadow-xl text-left">
            <div className="flex items-center justify-between text-xs font-medium text-neutral-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Status Integrasi API & Player
              </span>
              <span className="text-amber-400 font-bold">75% Selesai</span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 via-rose-500 to-red-500 h-2.5 rounded-full transition-all duration-1000 animate-pulse"
                style={{ width: '75%' }}
              />
            </div>
            <p className="mt-2 text-[11px] text-neutral-400">
              Sinkronisasi data episode, enkripsi token keamanan, dan server HLS video sedang dalam tahap optimalisasi final.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Teasers */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-500 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Sneak Peek Fitur Mendatang</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Pengalaman Menonton Drama Pendek Terbaik
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Format Vertikal Modern</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Didesain khusus untuk layar smartphone. Geser (swipe) episode berikutnya dengan cepat dan mulus layaknya scrolling video pendek.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Episode Cepat & Intens</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Durasi 1–2 menit per chapter dengan alur cerita penuh konflik, romansa seru, intrik keluarga konglomerat, dan plot twist.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Subtitle Indonesia</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Terjemahan bahasa Indonesia yang rapi dan mudah dipahami, sehingga Anda bisa menikmati alur cerita drama secara optimal.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
              <Tv className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Ribuan Judul Pilihan</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Mulai dari genre CEO & Miliarder, Pernikahan Kontrak, Time Travel, Fantasi hingga Balas Dendam yang sedang trending di ReelShort.
            </p>
          </div>
        </div>

        {/* Alternative Content Call to Action */}
        <div className="mt-14 sm:mt-20 p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900 border border-neutral-800 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-lg sm:text-2xl font-bold text-white mb-3">
              Sambil Menunggu, Nikmati Koleksi Terlengkap Lainnya
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mb-8 leading-relaxed">
              Kurunime menyediakan ribuan episode anime subtitle Indonesia, film bioskop & serial box office, serta ratusan judul komik manga dan manhwa gratis.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/list/ongoing"
                className="group flex items-center justify-between p-3.5 rounded-xl bg-neutral-800/80 hover:bg-rose-600 text-neutral-100 hover:text-white border border-neutral-700 hover:border-rose-500 transition-all shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <Film className="w-4 h-4 text-rose-400 group-hover:text-white" />
                  <span className="text-xs font-semibold">Streaming Anime</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/movie"
                className="group flex items-center justify-between p-3.5 rounded-xl bg-neutral-800/80 hover:bg-rose-600 text-neutral-100 hover:text-white border border-neutral-700 hover:border-rose-500 transition-all shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <Clapperboard className="w-4 h-4 text-sky-400 group-hover:text-white" />
                  <span className="text-xs font-semibold">Film & Series</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/komik"
                className="group flex items-center justify-between p-3.5 rounded-xl bg-neutral-800/80 hover:bg-rose-600 text-neutral-100 hover:text-white border border-neutral-700 hover:border-rose-500 transition-all shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-emerald-400 group-hover:text-white" />
                  <span className="text-xs font-semibold">Baca Komik</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
