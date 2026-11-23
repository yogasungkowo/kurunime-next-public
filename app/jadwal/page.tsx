import { Metadata } from 'next';
import ScheduleView from '@/components/ScheduleView';
import { getAnimeSchedule } from '@/lib/api/anime';

export const metadata: Metadata = {
  title: 'Jadwal Rilis Anime Subtitle Indonesia Terupdate - Kurunime',
  description:
    'Jadwal tayang anime harian subtitle Indonesia terlengkap dan terupdate setiap hari Senin sampai Minggu. Pantau episode terbaru anime favoritmu di Kurunime.',
  keywords: [
    'jadwal rilis anime sub indo',
    'jadwal anime subtitle indonesia',
    'jadwal tayang anime otakudesu',
    'jadwal anime samehadaku',
    'nonton anime sub indo',
    'anime ongoing sub indo',
    'kurunime jadwal',
  ],
  alternates: {
    canonical: '/jadwal',
  },
  openGraph: {
    title: 'Jadwal Rilis Anime Subtitle Indonesia Terupdate - Kurunime',
    description:
      'Jadwal tayang anime mingguan subtitle Indonesia terlengkap dan terupdate setiap hari Senin sampai Minggu.',
    url: '/jadwal',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jadwal Rilis Anime Subtitle Indonesia Terupdate - Kurunime',
    description:
      'Jadwal tayang anime mingguan subtitle Indonesia terlengkap dan terupdate setiap hari Senin sampai Minggu.',
  },
};

export default async function JadwalPage() {
  const schedule = await getAnimeSchedule();

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-2 rounded-full bg-rose-600 shadow-sm shadow-rose-600/50" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Jadwal Rilis Anime
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Ketahui jadwal tayang episode terbaru anime favoritmu setiap hari.
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Component */}
        <ScheduleView schedule={schedule} />
      </div>
    </div>
  );
}
