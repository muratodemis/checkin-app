"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PhoneMissed, LayoutDashboard } from "lucide-react";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { MeetingSkipMeta } from "@/types";
import Link from "next/link";

interface NoteCellProps {
  content: string;
  onSave: (content: string) => void;
  skipMeta: MeetingSkipMeta | null;
  onSetSkipMeta: (meta: MeetingSkipMeta | null) => void;
  isSaving: boolean;
  isSaved: boolean;
  memberId?: string;
  weekId?: string;
  day?: number;
}

export function NoteCell({
  content,
  onSave,
  skipMeta,
  onSetSkipMeta,
  isSaving,
  isSaved,
  memberId,
  weekId,
  day,
}: NoteCellProps) {
  const [value, setValue] = useState(content);
  const [focused, setFocused] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherReason, setOtherReason] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!focused) setValue(content);
  }, [content, focused]);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0";
    el.style.height = Math.max(el.scrollHeight, 56) + "px";
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onSave(e.target.value);
  };

  const isDone = !focused && value.trim().length > 0;
  const isSkipped = !isDone && !!skipMeta;
  const skipText =
    skipMeta?.reason === "unreachable"
      ? "Ulaşamadım"
      : skipMeta?.reason === "on_leave"
        ? "İzinli"
        : skipMeta?.reason === "other"
          ? (skipMeta.other_text || "Other")
          : "";

  const selectReason = (reason: "unreachable" | "on_leave" | "other") => {
    if (reason === "other") {
      setShowOtherInput(true);
      return;
    }
    setShowOtherInput(false);
    setOtherReason("");
    onSetSkipMeta({ reason });
    onSave("");
    setValue("");
    setPopoverOpen(false);
  };

  const saveOtherReason = () => {
    const trimmed = otherReason.trim();
    if (!trimmed) return;
    onSetSkipMeta({ reason: "other", other_text: trimmed });
    onSave("");
    setValue("");
    setShowOtherInput(false);
    setOtherReason("");
    setPopoverOpen(false);
  };

  return (
    <TableCell
      className={cn(
        "group relative min-w-[220px] p-0 align-top border-r border-stone-100 whitespace-normal transition-colors",
        isDone && "bg-emerald-50/30",
        isSkipped && "bg-rose-50/30",
        focused && "ring-2 ring-violet-200 ring-inset"
      )}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={skipText}
        rows={3}
        className="block w-full min-h-[56px] px-3 py-2.5 text-[13px] leading-relaxed text-stone-800 bg-transparent border-none outline-none resize-none font-[inherit] placeholder:text-stone-300"
      />

      {/* Detail page icon — bottom-right, always visible */}
      {memberId && weekId && day && (
        <Link
          href={`/members/${memberId}/checkin/${weekId}/${day}`}
          title="Detay sayfası"
          className="absolute bottom-1.5 right-1.5 h-5 w-5 rounded-md flex items-center justify-center border bg-white/80 border-stone-200 text-stone-300 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50 transition-all"
        >
          <LayoutDashboard className="h-3 w-3" />
        </Link>
      )}

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            title="Toplantı yapılmadı sebebi"
            className={cn(
              "absolute top-1.5 right-1.5 h-5 w-5 rounded-md flex items-center justify-center border transition-colors",
              isSkipped
                ? "bg-rose-50 border-rose-200 text-rose-400"
                : "bg-white/80 border-stone-200 text-stone-300 hover:text-stone-500 hover:border-stone-300"
            )}
          >
            <PhoneMissed className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-1.5 rounded-xl border-stone-200 shadow-lg shadow-stone-200/50">
          <div className="space-y-0.5">
            <button
              type="button"
              className="w-full text-left text-[13px] px-2.5 py-1.5 rounded-lg hover:bg-stone-50 text-stone-700 transition-colors"
              onClick={() => selectReason("unreachable")}
            >
              Ulaşamadım
            </button>
            <button
              type="button"
              className="w-full text-left text-[13px] px-2.5 py-1.5 rounded-lg hover:bg-stone-50 text-stone-700 transition-colors"
              onClick={() => selectReason("on_leave")}
            >
              İzinli
            </button>
            <button
              type="button"
              className="w-full text-left text-[13px] px-2.5 py-1.5 rounded-lg hover:bg-stone-50 text-stone-700 transition-colors"
              onClick={() => selectReason("other")}
            >
              Other
            </button>
            {isSkipped && (
              <>
                <div className="border-t border-stone-100 my-1" />
                <button
                  type="button"
                  className="w-full text-left text-[13px] px-2.5 py-1.5 rounded-lg hover:bg-stone-50 text-stone-400 transition-colors"
                  onClick={() => {
                    onSetSkipMeta(null);
                    setShowOtherInput(false);
                    setOtherReason("");
                    setPopoverOpen(false);
                  }}
                >
                  İşareti kaldır
                </button>
              </>
            )}
          </div>

          {showOtherInput && (
            <div className="mt-1.5 space-y-1.5 border-t border-stone-100 pt-1.5">
              <Input
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Sebep yaz..."
                className="h-8 text-[13px] rounded-lg border-stone-200"
              />
              <button
                type="button"
                onClick={saveOtherReason}
                className="w-full h-8 rounded-lg bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-800 transition-colors"
              >
                Kaydet
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {isSaving && (
        <span className="absolute top-1.5 right-8 text-[11px] text-stone-300">...</span>
      )}
      {isSaved && !isSaving && (
        <span className="absolute top-1.5 right-8 text-[11px] text-emerald-500 animate-saved-fade">
          ✓
        </span>
      )}
    </TableCell>
  );
}
