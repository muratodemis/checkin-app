"use client";

import { Member, MeetingSkipMeta } from "@/types";
import { NoteCell } from "./NoteCell";
import { TableRow, TableCell } from "@/components/ui/table";

interface MemberRowProps {
  member: Member;
  activeDays: number[];
  weekId?: string;
  getNoteContent: (memberId: string, day: number) => string;
  saveNote: (memberId: string, day: number, content: string) => void;
  getSkipMeta: (memberId: string, day: number) => MeetingSkipMeta | null;
  setSkipMeta: (memberId: string, day: number, meta: MeetingSkipMeta | null) => void;
  isSaving: (memberId: string, day: number) => boolean;
  isSaved: (memberId: string, day: number) => boolean;
  showWeeklyCol?: boolean;
  noMeetingDays?: number[];
  expandedDay?: number | null;
  allMemberIds?: { id: string; name: string }[];
}

// Takım bazlı avatar renkleri
const TEAM_AVATAR_COLORS: Record<string, string> = {
  "t-yonetim":     "bg-violet-100 text-violet-700",
  "t-fullstack":   "bg-amber-100 text-amber-700",
  "t-frontend":    "bg-amber-100 text-amber-700",
  "t-mobile":      "bg-amber-100 text-amber-700",
  "t-urun-tasarim":"bg-sky-100 text-sky-700",
  "t-operasyon":   "bg-emerald-100 text-emerald-700",
  "t-stajyer":     "bg-rose-100 text-rose-700",
};
const FALLBACK_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
];

export function MemberRow({
  member,
  activeDays,
  weekId,
  getNoteContent,
  saveNote,
  getSkipMeta,
  setSkipMeta,
  isSaving,
  isSaved,
  showWeeklyCol,
  noMeetingDays,
  expandedDay,
  allMemberIds,
}: MemberRowProps) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colorClass = TEAM_AVATAR_COLORS[member.team_id] ?? FALLBACK_COLORS[member.name.charCodeAt(0) % FALLBACK_COLORS.length];

  return (
    <TableRow className="hover:bg-stone-50/50 border-b border-stone-100 transition-colors">
      {/* Member info — sticky left */}
      <TableCell className="sticky left-0 z-[5] min-w-[240px] max-w-[280px] bg-white px-5 py-3 border-r border-stone-300 align-middle whitespace-normal">
        <div className="flex items-center gap-3">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.name}
              className="w-7 h-7 rounded-full object-cover border border-stone-200 shrink-0"
            />
          ) : (
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${colorClass}`}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-stone-900 truncate leading-tight">
              {member.name}
            </div>
            {member.role && (
              <div className="text-[11px] text-stone-400 truncate leading-tight mt-0.5">
                {member.role}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      {/* Note cells */}
      {activeDays.map((day) => (
        <NoteCell
          key={day}
          content={getNoteContent(member.id, day)}
          onSave={(c) => saveNote(member.id, day, c)}
          skipMeta={getSkipMeta(member.id, day)}
          onSetSkipMeta={(meta) => setSkipMeta(member.id, day, meta)}
          isSaving={isSaving(member.id, day)}
          isSaved={isSaved(member.id, day)}
          memberId={member.id}
          weekId={weekId}
          day={day}
          isNoMeeting={noMeetingDays?.includes(day)}
          isExpanded={expandedDay === day}
          memberName={member.name}
          allMemberIds={allMemberIds}
        />
      ))}

      {/* Weekly summary cell */}
      {showWeeklyCol && (
        <TableCell className="min-w-[180px] p-0 align-top border-r border-stone-200 bg-violet-50/20" />
      )}
    </TableRow>
  );
}
