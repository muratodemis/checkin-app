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
}

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-rose-100 text-rose-600",
  "bg-sky-100 text-sky-600",
  "bg-orange-100 text-orange-600",
  "bg-teal-100 text-teal-600",
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
}: MemberRowProps) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colorClass = AVATAR_COLORS[member.name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <TableRow className="hover:bg-stone-50/50 border-b border-stone-100 transition-colors">
      {/* Member info — sticky left */}
      <TableCell className="sticky left-0 z-[5] min-w-[240px] max-w-[280px] bg-white px-5 py-3 border-r border-stone-200 align-middle whitespace-normal">
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
        />
      ))}
    </TableRow>
  );
}
