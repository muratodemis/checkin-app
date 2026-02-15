"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PhoneMissed } from "lucide-react";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MeetingSkipMeta } from "@/types";

interface NoteCellProps {
  content: string;
  onSave: (content: string) => void;
  skipMeta: MeetingSkipMeta | null;
  onSetSkipMeta: (meta: MeetingSkipMeta | null) => void;
  isSaving: boolean;
  isSaved: boolean;
}

export function NoteCell({
  content,
  onSave,
  skipMeta,
  onSetSkipMeta,
  isSaving,
  isSaved,
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
      ? "Ulasamadim"
      : skipMeta?.reason === "on_leave"
        ? "Izinli"
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
        "relative min-w-[220px] p-0 align-top border-r border-[#eaeaea] whitespace-normal transition-colors",
        isDone && "bg-[#f8fcf9]",
        isSkipped && "bg-[#fdf9fb]",
        focused && "ring-2 ring-[#d1d5db] ring-inset"
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
        className="block w-full min-h-[56px] px-3 py-2 text-[13px] leading-relaxed text-[#111111] bg-transparent border-none outline-none resize-none font-[inherit] placeholder:text-[#9ca3af]"
      />

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            title="Toplantı yapılmadı sebebi"
            className={cn(
              "absolute top-1.5 right-1.5 h-5 w-5 rounded flex items-center justify-center border transition-colors",
              isSkipped
                ? "bg-[#fbf2f6] border-[#f2dfe6] text-[#b18a98]"
                : "bg-white border-[#e5e7eb] text-[#9ca3af] hover:text-[#6b7280] hover:border-[#d1d5db]"
            )}
          >
            <PhoneMissed className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-2">
          <div className="space-y-1">
            <button
              type="button"
              className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-[#f3f4f6] text-[#111111]"
              onClick={() => selectReason("unreachable")}
            >
              Ulaşamadım
            </button>
            <button
              type="button"
              className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-[#f3f4f6] text-[#111111]"
              onClick={() => selectReason("on_leave")}
            >
              İzinli
            </button>
            <button
              type="button"
              className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-[#f3f4f6] text-[#111111]"
              onClick={() => selectReason("other")}
            >
              Other
            </button>
            {isSkipped && (
              <button
                type="button"
                className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-[#f3f4f6] text-[#6e6e6e]"
                onClick={() => {
                  onSetSkipMeta(null);
                  setShowOtherInput(false);
                  setOtherReason("");
                  setPopoverOpen(false);
                }}
              >
                Toplantı yapıldı (işareti kaldır)
              </button>
            )}
          </div>

          {showOtherInput && (
            <div className="mt-2 space-y-2 border-t border-[#eaeaea] pt-2">
              <Input
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Sebep yaz..."
                className="h-8 text-xs"
              />
              <Button type="button" size="xs" className="w-full" onClick={saveOtherReason}>
                Kaydet
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {isSaving && (
        <span className="absolute top-1.5 right-8 text-[11px] text-[#9ca3af]">...</span>
      )}
      {isSaved && !isSaving && (
        <span className="absolute top-1.5 right-8 text-[11px] text-[#6e6e6e] animate-saved-fade">
          ✓
        </span>
      )}
    </TableCell>
  );
}
