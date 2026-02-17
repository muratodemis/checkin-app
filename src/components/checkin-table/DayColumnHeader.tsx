"use client";

import { X } from "lucide-react";
import { DAY_NAMES } from "@/types";
import { getDayDate, formatDateShort } from "@/lib/utils";
import { TableHead } from "@/components/ui/table";

interface DayColumnHeaderProps {
  day: number;
  weekStart: string;
  hasNotes: boolean;
  onRemove: (day: number) => void;
}

export function DayColumnHeader({ day, weekStart, hasNotes, onRemove }: DayColumnHeaderProps) {
  const dateStr = getDayDate(weekStart, day);
  const shortDate = formatDateShort(dateStr);

  const isToday = (() => {
    const now = new Date();
    const d = new Date(dateStr + "T00:00:00");
    return now.toDateString() === d.toDateString();
  })();

  return (
    <TableHead className="group relative min-w-[220px] bg-stone-50 px-5 py-3 align-bottom border-r border-stone-200">
      <div className="flex items-center gap-2">
        {isToday && (
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
        )}
        <span className="text-xs font-semibold text-stone-800">
          {DAY_NAMES[day]}
        </span>
        <span className="text-stone-300">·</span>
        <span className="text-xs font-normal text-stone-400">
          {shortDate}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          if (hasNotes) {
            if (confirm("Bu güne ait notlar var. Yine de kaldırılsın mı?")) {
              onRemove(day);
            }
          } else {
            onRemove(day);
          }
        }}
        title="Günü kaldır"
        className="absolute top-2 right-2 h-5 w-5 flex items-center justify-center rounded-md text-stone-300 hover:text-stone-600 hover:bg-stone-200/60 opacity-0 group-hover:opacity-100 transition-all"
      >
        <X className="h-3 w-3" />
      </button>
    </TableHead>
  );
}
