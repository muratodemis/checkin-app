"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { formatWeekRange } from "@/lib/utils";

interface WeekNavigatorProps {
  weekStart: string;
  onPrev: () => void;
  onNext: () => void;
}

export function WeekNavigator({ weekStart, onPrev, onNext }: WeekNavigatorProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-2 mr-2">
        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
          <CalendarDays className="h-4 w-4 text-violet-600" />
        </div>
      </div>

      <button
        onClick={onPrev}
        className="h-7 w-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <h1 className="text-sm font-semibold text-stone-900 tracking-tight min-w-[240px] text-center select-none px-1">
        {formatWeekRange(weekStart)}
      </h1>

      <button
        onClick={onNext}
        className="h-7 w-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
