"use client";

import { NOTE_TAG_COLORS } from "@/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  tags?: string[];
  isCompleted: boolean;
  date: string;
  onToggle: () => void;
}

export function NoteItem({ title, description, tags = [], isCompleted, date, onToggle }: Props) {
  const dateStr = new Date(date).toLocaleDateString("tr-TR", { month: "short", day: "2-digit" });

  return (
    <div className="flex items-start gap-3 py-3 border-b border-stone-100 last:border-0">
      <button
        onClick={onToggle}
        className={cn(
          "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
          isCompleted
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-stone-300 hover:border-stone-400"
        )}
      >
        {isCompleted && <Check className="w-3 h-3" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", isCompleted ? "text-stone-400 line-through" : "text-stone-900")}>
          {title}
        </p>
        {description && (
          <p className="text-xs text-stone-400 truncate mt-0.5">{description}</p>
        )}
        <div className="flex items-center gap-1.5 mt-2">
          {tags.map((tag) => {
            const color = NOTE_TAG_COLORS[tag] || { bg: "#F3F4F6", text: "#6B7280" };
            return (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                style={{ backgroundColor: color.bg, color: color.text }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>
      <span className="text-xs text-stone-400 shrink-0">{dateStr}</span>
    </div>
  );
}
