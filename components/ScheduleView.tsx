'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Play } from 'lucide-react';
import { ScheduleDay } from '@/lib/api/types';

interface ScheduleViewProps {
  schedule: ScheduleDay[];
}

export default function ScheduleView({ schedule }: ScheduleViewProps) {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  if (!schedule.length) {
    return (
      <div className="py-20 text-center text-sm text-neutral-400">
        Jadwal rilis belum tersedia saat ini.
      </div>
    );
  }

  const currentDay = schedule[selectedDayIdx] || schedule[0];

  return (
    <div className="space-y-8">
      {/* Day Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-neutral-800">
        {schedule.map((dayGroup, idx) => {
          const isSelected = selectedDayIdx === idx;
          return (
            <button
              key={dayGroup.day}
              onClick={() => setSelectedDayIdx(idx)}
              className={`shrink-0 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                isSelected
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-neutral-700 hover:text-white'
              }`}
            >
              <span>{dayGroup.day}</span>
              <span
                className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                  isSelected
                    ? 'bg-black/30 text-white'
                    : 'bg-black/50 text-neutral-400'
                }`}
              >
                {dayGroup.list.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Anime list for selected day */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-rose-500" />
          <h2 className="text-lg font-bold text-white">
            Rilis Hari {currentDay.day} ({currentDay.list.length} Judul)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {currentDay.list.map((item) => (
            <Link
              key={item.animeId || item.slug}
              href={`/anime/${item.slug || item.animeId}`}
              className="flex items-center justify-between gap-3 rounded-xl p-3 bg-[#141414] border border-neutral-800 hover:border-rose-500/50 hover:bg-[#1a1a1a] group transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600/10 text-rose-500 group-hover:bg-rose-600 group-hover:text-white transition-colors shrink-0">
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                </div>
                <span className="text-sm font-semibold text-neutral-200 group-hover:text-rose-400 truncate">
                  {item.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
