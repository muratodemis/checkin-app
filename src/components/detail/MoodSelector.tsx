"use client";

import { MOOD_EMOJIS } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  selected: string | null;
  onSelect: (emoji: string) => void;
}

export function MoodSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex items-center gap-3 justify-center py-4">
      {MOOD_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className={cn(
            "w-11 h-11 rounded-full text-2xl flex items-center justify-center transition-all",
            selected === emoji
              ? "ring-2 ring-violet-500 ring-offset-2 opacity-100 scale-110"
              : "opacity-50 hover:opacity-80 hover:scale-105"
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
