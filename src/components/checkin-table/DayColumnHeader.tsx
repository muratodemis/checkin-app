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

  return (
    <TableHead className="group relative min-w-[220px] bg-[#f8f9fb] px-4 py-2 align-bottom border-r border-[#eaeaea]">
      <span className="text-xs font-medium text-[#111111]">
        {DAY_NAMES[day]}
      </span>
      <span className="text-gray-300 mx-1.5">·</span>
      <span className="text-xs font-normal text-[#6e6e6e]">
        {shortDate}
      </span>

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
        className="absolute top-1.5 right-1.5 h-5 w-5 flex items-center justify-center rounded text-[#9ca3af] hover:text-[#111111] hover:bg-[#f3f4f6] opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </button>
    </TableHead>
  );
}
