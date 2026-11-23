'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';
import { ScheduleDay } from '@/lib/api/types';

interface TodayScheduleBarProps {
  scheduleData: ScheduleDay[];
}

export default function TodayScheduleBar({ scheduleData }: TodayScheduleBarProps) {
  const [todaySchedule, setTodaySchedule] = useState<ScheduleDay | null>(null);

  useEffect(() => {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDayName = dayNames[new Date().getDay()];
    const match = scheduleData.find((s) =>
      s.day.toLowerCase().includes(currentDayName.toLowerCase())
    );
    setTodaySchedule(match || scheduleData[0] || null);
  }, [scheduleData]);

  if (!todaySchedule || todaySchedule.list.length === 0) return null;

  return (
    <div className="rounded-xl border border-neutral-800 bg-[#121212] p-3.5 sm:p-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Calendar className="h-4 w-4 shrink-0 text-rose-500" />
          <span className="text-xs sm:text-sm font-bold text-white truncate">
            Rilis Hari Ini ({todaySchedule.day})
          </span>
          <span className="shrink-0 rounded bg-rose-500/20 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-rose-300">
            {todaySchedule.list.length} Judul
          </span>
        </div>
        <Link
          href="/jadwal"
          className="shrink-0 flex items-center gap-0.5 sm:gap-1 text-xs font-semibold text-rose-500 hover:text-rose-400 whitespace-nowrap"
        >
          <span>Jadwal Lengkap</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {todaySchedule.list.slice(0, 10).map((item) => (
          <Link
            key={item.animeId || item.slug}
            href={`/anime/${item.slug || item.animeId}`}
            className="shrink-0 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 border border-neutral-800 hover:border-rose-500/50 hover:text-rose-400 transition-colors"
          >
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
