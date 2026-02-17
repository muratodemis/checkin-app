"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Member, WeeklyQuestion, DAY_NAMES } from "@/types";
import { apiPath } from "@/lib/api";
import { DetailPageHeader } from "@/components/detail/DetailPageHeader";
import { DailyFeedbackCard } from "@/components/detail/DailyFeedbackCard";
import { AiNotesCard } from "@/components/detail/AiNotesCard";
import { BlockersCard } from "@/components/detail/BlockersCard";
import { CommitmentsCard } from "@/components/detail/CommitmentsCard";
import { TodayCard } from "@/components/detail/TodayCard";

export default function MemberCheckinDetailPage() {
  const params = useParams();
  const memberId = params.memberId as string;
  const weekId = params.weekId as string;
  const dayNumber = Number(params.dayNumber);

  const [member, setMember] = useState<Member | null>(null);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [weeklyQuestions, setWeeklyQuestions] = useState<string[]>([]);
  const [weekStart, setWeekStart] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Load member
        const memberRes = await fetch(apiPath(`api/members/${memberId}`));
        if (memberRes.ok) setMember(await memberRes.json());

        // Load week info and questions
        const weekRes = await fetch(apiPath(`api/weeks/${weekId}/questions`));
        if (weekRes.ok) {
          const q: WeeklyQuestion | null = await weekRes.json();
          setWeeklyQuestions(q?.questions?.filter((s: string) => s.trim()) || []);
        }

        // Load week start date
        const weekDataRes = await fetch(apiPath(`api/weeks/${weekId}`));
        if (weekDataRes.ok) {
          const weekData = await weekDataRes.json();
          setWeekStart(weekData.week_start || "");
        }

        // Load all members for blocker dropdown
        const teamsRes = await fetch(apiPath("api/teams"));
        if (teamsRes.ok) {
          const teams = await teamsRes.json();
          const members: Member[] = [];
          for (const team of teams) {
            if (team.members) {
              for (const m of team.members) members.push(m);
            }
          }
          setAllMembers(members);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [memberId, weekId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fafaf9" }}>
        <p className="text-sm text-stone-500">Loading...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fafaf9" }}>
        <p className="text-sm text-stone-500">Member not found</p>
      </div>
    );
  }

  const dayLabel = DAY_NAMES[dayNumber] || `Day ${dayNumber}`;

  return (
    <div className="min-h-screen" style={{ background: "#fafaf9" }}>
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <DetailPageHeader member={member} dayLabel={dayLabel} />

        {/* 3-column grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <DailyFeedbackCard
              memberId={memberId}
              memberName={member.name}
              weekId={weekId}
              dayNumber={dayNumber}
              weeklyQuestions={weeklyQuestions}
            />
            <BlockersCard
              memberId={memberId}
              memberName={member.name}
              weekId={weekId}
              dayNumber={dayNumber}
              allMembers={allMembers}
            />
          </div>

          {/* Center column */}
          <div className="space-y-6">
            <AiNotesCard
              memberId={memberId}
              weekId={weekId}
              dayNumber={dayNumber}
            />
            <CommitmentsCard
              memberId={memberId}
              weekId={weekId}
              dayNumber={dayNumber}
            />
          </div>

          {/* Right column */}
          <div>
            <TodayCard dayNumber={dayNumber} weekStart={weekStart} memberId={memberId} memberName={member.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
