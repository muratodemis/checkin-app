"use client";

import { X, CalendarOff, Minimize2 } from "lucide-react";
import { DAY_NAMES } from "@/types";
import { getDayDate, formatDateShort } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DayColumnHeaderProps {
  day: number;
  weekStart: string;
  hasNotes: boolean;
  onRemove: (day: number) => void;
  isNoMeeting: boolean;
  onToggleNoMeeting: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function DayColumnHeader({
  day,
  weekStart,
  hasNotes,
  onRemove,
  isNoMeeting,
  onToggleNoMeeting,
  isExpanded,
  onToggleExpand,
}: DayColumnHeaderProps) {
  const dateStr = getDayDate(weekStart, day);
  const shortDate = formatDateShort(dateStr);

  const isToday = (() => {
    const now = new Date();
    const d = new Date(dateStr + "T00:00:00");
    return now.toDateString() === d.toDateString();
  })();

  return (
    <th
      className={cn(
        "group/day relative h-auto px-4 py-3 text-left align-bottom border-r border-stone-300 transition-all whitespace-normal",
        isExpanded ? "min-w-[50vw]" : "min-w-[180px]",
        isNoMeeting ? "bg-stone-100/80" : "bg-stone-50"
      )}
    >
      <div className="flex items-center gap-1.5">
        {isToday && !isNoMeeting && (
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
        )}
        <button
          onClick={onToggleExpand}
          className={cn(
            "text-xs font-semibold cursor-pointer hover:text-violet-600 transition-colors",
            isNoMeeting ? "text-stone-400" : "text-stone-800"
          )}
        >
          {DAY_NAMES[day]}
        </button>
        <span className="text-stone-300 text-xs shrink-0">·</span>
        <span className={cn(
          "text-xs font-normal shrink-0",
          isNoMeeting ? "text-stone-300" : "text-stone-400"
        )}>
          {shortDate}
        </span>

        {isExpanded && (
          <button
            onClick={onToggleExpand}
            title="Küçült"
            className="ml-1 shrink-0 h-4 w-4 flex items-center justify-center rounded text-violet-400 hover:text-violet-600 transition-colors"
          >
            <Minimize2 className="h-3 w-3" />
          </button>
        )}

        <div className={cn(
          "ml-auto shrink-0 flex items-center gap-0.5 transition-opacity",
          isNoMeeting ? "opacity-100" : "opacity-0 group-hover/day:opacity-100"
        )}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleNoMeeting();
            }}
            title={isNoMeeting ? "Meeting var olarak işaretle" : "No meetings today"}
            className={cn(
              "h-5 w-5 flex items-center justify-center rounded-md border transition-all shrink-0",
              isNoMeeting
                ? "bg-stone-200 border-stone-300 text-stone-500 opacity-100"
                : "bg-white/80 border-stone-200 text-stone-300 hover:text-stone-500 hover:border-stone-300"
            )}
          >
            <CalendarOff className="h-3 w-3" />
          </button>
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
            className="h-5 w-5 flex items-center justify-center rounded-md text-stone-300 hover:text-stone-600 hover:bg-stone-200/60 transition-all shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {isNoMeeting && (
        <div className={cn(
          "mt-0.5 text-[10px] font-medium text-stone-400 uppercase tracking-wider",
          isNoMeeting && "opacity-100"
        )}>
          No meetings
        </div>
      )}
    </th>
  );
}
