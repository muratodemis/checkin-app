"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PhoneMissed, LayoutDashboard, Sparkles, X } from "lucide-react";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { MeetingSkipMeta, NOTE_TAG_COLORS } from "@/types";
import Link from "next/link";
import { apiPath } from "@/lib/api";

interface AiSummaryData {
  ai_notes: { title: string; description: string; tags: string[] }[];
  commitments: { title: string; description: string; tags: string[]; due_type: string }[];
  blockers: { blocker_name: string; blocked_name: string; reason: string }[];
  mood: { emoji: string; note: string };
  summary: string;
}

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
  isNoMeeting?: boolean;
  isExpanded?: boolean;
  memberName?: string;
  allMemberIds?: { id: string; name: string }[];
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
  isNoMeeting,
  isExpanded,
  memberName,
  allMemberIds,
}: NoteCellProps) {
  const [value, setValue] = useState(content);
  const [focused, setFocused] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherReason, setOtherReason] = useState("");
  const [aiData, setAiData] = useState<AiSummaryData | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!focused) setValue(content);
  }, [content, focused]);

  const resize = useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "0";
    el.style.height = Math.max(el.scrollHeight, 56) + "px";
  }, []);

  useEffect(() => { resize(); }, [value, resize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onSave(e.target.value);
  };

  const persistAiResults = useCallback(async (data: AiSummaryData) => {
    if (!memberId || !weekId || !day) return;

    const promises: Promise<unknown>[] = [];

    for (const note of data.ai_notes) {
      promises.push(fetch(apiPath("api/ai-notes"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: memberId, week_id: weekId, day_number: day,
          title: note.title, description: note.description, tags: note.tags, source: "ai",
        }),
      }));
    }

    for (const c of data.commitments) {
      promises.push(fetch(apiPath("api/commitments"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: memberId, week_id: weekId, day_number: day,
          title: c.title, description: c.description, tags: c.tags, due_type: c.due_type, source: "ai",
        }),
      }));
    }

    for (const b of data.blockers) {
      const blockerMember = allMemberIds?.find((m) => m.name.includes(b.blocker_name));
      const blockedMember = allMemberIds?.find((m) => m.name.includes(b.blocked_name));
      if (blockerMember && blockedMember) {
        promises.push(fetch(apiPath("api/blockers"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blocker_id: blockerMember.id, blocked_id: blockedMember.id,
            week_id: weekId, day_number: day, reason: b.reason, source: "ai",
          }),
        }));
      }
    }

    if (data.mood?.emoji) {
      promises.push(fetch(apiPath("api/checkin-feedback"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: memberId, week_id: weekId, day_number: day,
          question_type: "mood", question_index: null,
          mood_emoji: data.mood.emoji, mood_note: data.mood.note,
        }),
      }));
    }

    await Promise.allSettled(promises);
  }, [memberId, weekId, day, allMemberIds]);

  const handleAiSummarize = useCallback(async (text?: string) => {
    const noteText = text ?? value;
    if (noteText.trim().length < 10 || !memberId || !weekId || !day) return;
    setAiLoading(true);
    try {
      const res = await fetch(apiPath("api/ai-summarize"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteText, member_name: memberName || "Üye" }),
      });
      if (res.ok) {
        const data: AiSummaryData = await res.json();
        setAiData(data);
        await persistAiResults(data);
      }
    } catch {
      // silently fail
    } finally {
      setAiLoading(false);
    }
  }, [value, memberId, weekId, day, memberName, persistAiResults]);

  const lastSummarizedRef = useRef("");

  const handleBlur = useCallback(() => {
    setFocused(false);
    const trimmed = value.trim();
    if (trimmed.length >= 10 && trimmed !== lastSummarizedRef.current) {
      lastSummarizedRef.current = trimmed;
      handleAiSummarize(trimmed);
    }
  }, [value, handleAiSummarize]);

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
    if (reason === "other") { setShowOtherInput(true); return; }
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

  if (isNoMeeting) {
    return (
      <TableCell className={cn(
        "relative p-0 align-top border-r border-stone-200 bg-stone-100/50",
        isExpanded ? "min-w-[50vw]" : "min-w-[180px]"
      )}>
        <div className="w-full min-h-[56px]" />
      </TableCell>
    );
  }

  return (
    <TableCell
      className={cn(
        "group relative p-0 align-top border-r border-stone-200 whitespace-normal transition-all",
        isExpanded ? "min-w-[50vw]" : "min-w-[180px]",
        isDone && "bg-emerald-50/30",
        isSkipped && "bg-rose-50/30",
        focused && "ring-2 ring-violet-200 ring-inset"
      )}
    >
      {/* Original note textarea */}
      <textarea
        ref={textRef}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        placeholder={skipText}
        rows={3}
        className="block w-full min-h-[56px] px-3 py-2.5 text-[13px] leading-relaxed text-stone-800 bg-transparent border-none outline-none resize-none font-[inherit] placeholder:text-stone-300"
      />

      {/* AI Summary — below the note, inside the cell */}
      {aiData && (
        <div className="border-t border-violet-200 bg-violet-50/60 px-2.5 py-2 overflow-hidden">
          {/* Header + close */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 min-w-0">
              <Sparkles className="h-3 w-3 text-violet-500 shrink-0" />
              <span className="text-[11px] font-semibold text-violet-700 truncate">AI Özet</span>
              <span className="text-[11px]">{aiData.mood.emoji}</span>
              <span className="text-[10px] text-violet-400 truncate">{aiData.mood.note}</span>
            </div>
            <button
              onClick={() => setAiData(null)}
              className="h-4 w-4 flex items-center justify-center rounded text-violet-300 hover:text-violet-600 shrink-0"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>

          {/* Summary */}
          <p className="text-[11px] text-violet-800 leading-snug mb-1.5 break-words">
            {aiData.summary}
          </p>

          {/* AI Notes */}
          {aiData.ai_notes.length > 0 && (
            <div className="space-y-1 mb-1.5">
              {aiData.ai_notes.slice(0, 4).map((note, i) => (
                <div key={i} className="flex gap-1 items-start">
                  <span className="text-violet-400 text-[10px] mt-px shrink-0">▸</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-medium text-violet-900 break-words">{note.title}</span>
                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                      {note.tags.map((tag) => {
                        const c = NOTE_TAG_COLORS[tag] || { bg: "#F3F4F6", text: "#6B7280" };
                        return (
                          <span
                            key={tag}
                            className="px-1 py-px rounded text-[9px] font-medium leading-none"
                            style={{ backgroundColor: c.bg, color: c.text }}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Commitments */}
          {aiData.commitments.length > 0 && (
            <div className="border-t border-violet-200/60 pt-1 mb-1">
              <span className="text-[9px] font-semibold text-violet-500 uppercase tracking-wider">Taahhütler</span>
              {aiData.commitments.slice(0, 3).map((c, i) => (
                <div key={i} className="flex gap-1 items-start mt-0.5">
                  <span className="text-amber-500 text-[10px] mt-px shrink-0">○</span>
                  <span className="text-[11px] text-violet-800 break-words">{c.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Blockers */}
          {aiData.blockers.length > 0 && (
            <div className="border-t border-rose-200/60 pt-1">
              <span className="text-[9px] font-semibold text-rose-500 uppercase tracking-wider">Blockers</span>
              {aiData.blockers.map((b, i) => (
                <div key={i} className="flex gap-1 items-start mt-0.5">
                  <span className="text-rose-500 text-[10px] mt-px shrink-0">⚠</span>
                  <span className="text-[11px] text-rose-700 break-words">
                    {b.blocker_name} → {b.blocked_name}: {b.reason}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Summarize button — bottom-left, visible on hover when there's content */}
      {isDone && !aiData && (
        <button
          onClick={() => handleAiSummarize()}
          disabled={aiLoading}
          title="AI ile özetle"
          className={cn(
            "absolute bottom-1.5 left-1.5 h-5 px-1.5 rounded-md flex items-center gap-1 border text-[10px] font-medium transition-all",
            aiLoading
              ? "bg-violet-100 border-violet-200 text-violet-400 cursor-wait opacity-100"
              : "bg-white/80 border-stone-200 text-stone-400 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50 opacity-0 group-hover:opacity-100"
          )}
        >
          <Sparkles className="h-3 w-3" />
          {aiLoading ? "..." : "AI"}
        </button>
      )}

      {/* Detail page link */}
      {memberId && weekId && day && (
        <Link
          href={`/members/${memberId}/checkin/${weekId}/${day}`}
          title="Detay sayfası"
          className="absolute bottom-1.5 right-1.5 h-5 w-5 rounded-md flex items-center justify-center border bg-white/80 border-stone-200 text-stone-300 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50 transition-all"
        >
          <LayoutDashboard className="h-3 w-3" />
        </Link>
      )}

      {/* Skip reason popover */}
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
            <button type="button" className="w-full text-left text-[13px] px-2.5 py-1.5 rounded-lg hover:bg-stone-50 text-stone-700 transition-colors" onClick={() => selectReason("unreachable")}>Ulaşamadım</button>
            <button type="button" className="w-full text-left text-[13px] px-2.5 py-1.5 rounded-lg hover:bg-stone-50 text-stone-700 transition-colors" onClick={() => selectReason("on_leave")}>İzinli</button>
            <button type="button" className="w-full text-left text-[13px] px-2.5 py-1.5 rounded-lg hover:bg-stone-50 text-stone-700 transition-colors" onClick={() => selectReason("other")}>Other</button>
            {isSkipped && (
              <>
                <div className="border-t border-stone-100 my-1" />
                <button type="button" className="w-full text-left text-[13px] px-2.5 py-1.5 rounded-lg hover:bg-stone-50 text-stone-400 transition-colors" onClick={() => { onSetSkipMeta(null); setShowOtherInput(false); setOtherReason(""); setPopoverOpen(false); }}>İşareti kaldır</button>
              </>
            )}
          </div>
          {showOtherInput && (
            <div className="mt-1.5 space-y-1.5 border-t border-stone-100 pt-1.5">
              <Input value={otherReason} onChange={(e) => setOtherReason(e.target.value)} placeholder="Sebep yaz..." className="h-8 text-[13px] rounded-lg border-stone-200" />
              <button type="button" onClick={saveOtherReason} className="w-full h-8 rounded-lg bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-800 transition-colors">Kaydet</button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {isSaving && <span className="absolute top-1.5 right-8 text-[11px] text-stone-300">...</span>}
      {isSaved && !isSaving && <span className="absolute top-1.5 right-8 text-[11px] text-emerald-500 animate-saved-fade">✓</span>}
    </TableCell>
  );
}
