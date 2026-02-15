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
        className="cursor-pointer select-none hover:bg-[#f3f4f6] bg-[#f8f9fb] border-b border-[#eaeaea]"
      >
        <TableCell
          colSpan={activeDays.length + 1}
          className="px-4 py-1.5 border-r-0 whitespace-normal"
        >
          <div className="flex items-center gap-2">
            <ChevronRight
              className={cn(
                "h-3 w-3 text-[#9ca3af] transition-transform duration-150",
                !collapsed && "rotate-90"
              )}
            />
            <span className="text-xs font-semibold text-[#111111] uppercase tracking-wide">
              {team.name}
            </span>
            <span className="text-[11px] text-[#6e6e6e]">
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
