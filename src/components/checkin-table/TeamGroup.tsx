"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { MeetingSkipMeta, TeamWithMembers } from "@/types";
import { MemberRow } from "./MemberRow";
import { TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TeamGroupProps {
  team: TeamWithMembers;
  activeDays: number[];
  weekId?: string;
  getNoteContent: (memberId: string, day: number) => string;
  saveNote: (memberId: string, day: number, content: string) => void;
  getSkipMeta: (memberId: string, day: number) => MeetingSkipMeta | null;
  setSkipMeta: (memberId: string, day: number, meta: MeetingSkipMeta | null) => void;
  isSaving: (memberId: string, day: number) => boolean;
  isSaved: (memberId: string, day: number) => boolean;
}

export function TeamGroup({
  team,
  activeDays,
  weekId,
  getNoteContent,
  saveNote,
  getSkipMeta,
  setSkipMeta,
  isSaving,
  isSaved,
}: TeamGroupProps) {
  const [collapsed, setCollapsed] = useState(false);
  const members = Array.isArray(team.members) ? team.members : [];

  return (
    <>
      {/* Team header row */}
      <TableRow
        onClick={() => setCollapsed(!collapsed)}
        className="cursor-pointer select-none hover:bg-stone-100/60 bg-stone-50/80 border-b border-stone-200"
      >
        <TableCell
          colSpan={activeDays.length + 1}
          className="px-5 py-2 border-r-0 whitespace-normal"
        >
          <div className="flex items-center gap-2.5">
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 text-stone-400 transition-transform duration-200",
                !collapsed && "rotate-90"
              )}
            />
            <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              {team.name}
            </span>
            <span className="text-[11px] text-stone-400 bg-stone-200/50 px-1.5 py-0.5 rounded-md font-medium">
              {members.length}
            </span>
          </div>
        </TableCell>
      </TableRow>

      {/* Member rows */}
      {!collapsed &&
        members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            activeDays={activeDays}
            weekId={weekId}
            getNoteContent={getNoteContent}
            saveNote={saveNote}
            getSkipMeta={getSkipMeta}
            setSkipMeta={setSkipMeta}
            isSaving={isSaving}
            isSaved={isSaved}
          />
        ))}
    </>
  );
}
