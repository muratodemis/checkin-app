"use client";

import { Member, MeetingSkipMeta } from "@/types";
import { NoteCell } from "./NoteCell";
import { TableRow, TableCell } from "@/components/ui/table";

interface MemberRowProps {
  member: Member;
  activeDays: number[];
  getNoteContent: (memberId: string, day: number) => string;
  saveNote: (memberId: string, day: number, content: string) => void;
  getSkipMeta: (memberId: string, day: number) => MeetingSkipMeta | null;
  setSkipMeta: (memberId: string, day: number, meta: MeetingSkipMeta | null) => void;
  isSaving: (memberId: string, day: number) => boolean;
  isSaved: (memberId: string, day: number) => boolean;
}

const AVATAR_COLORS = [
  "bg-gray-100 text-gray-600",
  "bg-gray-100 text-gray-600",
  "bg-gray-100 text-gray-600",
  "bg-gray-100 text-gray-600",
  "bg-gray-100 text-gray-600",
  "bg-gray-200 text-gray-700",
  "bg-gray-200 text-gray-700",
];

export function MemberRow({
  member,
  activeDays,
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
    <TableRow className="hover:bg-[#f9fafb] border-b border-[#eaeaea]">
      {/* Member info — sticky left */}
      <TableCell className="sticky left-0 z-[5] min-w-[240px] max-w-[280px] bg-white px-4 py-2.5 border-r border-[#eaeaea] align-middle whitespace-normal">
        <div className="flex items-center gap-2.5">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.name}
              className="w-6 h-6 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold shrink-0 ${colorClass}`}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-[15px] font-medium text-[#111111] truncate">
              {member.name}
            </div>
            {member.role && (
              <div className="text-[13px] text-[#6e6e6e] truncate">
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
        />
      ))}
    </TableRow>
  );
}
