"use client";

import { Plus, MessageSquare, Settings, Users, ListTree, List, CalendarDays } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { DAY_NAMES, TeamWithMembers } from "@/types";
import { WeekNavigator } from "./WeekNavigator";
import { DayColumnHeader } from "./DayColumnHeader";
import { TeamGroup } from "./TeamGroup";
import { MemberRow } from "./MemberRow";
import { useWeek } from "@/lib/hooks/useWeek";
import { useNotes } from "@/lib/hooks/useNotes";
import { useTeams } from "@/lib/hooks/useTeams";
import { useState, useMemo } from "react";
import { WeeklyQuestions } from "@/components/questions/WeeklyQuestions";
import { TeamManager } from "@/components/team-manager/TeamManager";

export function CheckinTable() {
  const {
    week, weekStart, questions,
    isLoading: weekLoading, error: weekError,
    goToPrevWeek, goToNextWeek, addDay, removeDay, saveQuestions,
  } = useWeek();

  const { teams, isLoading: teamsLoading, error: teamsError } = useTeams();
  const { notes, getNoteContent, saveNote, getSkipMeta, setSkipMeta, isSaving, isSaved } = useNotes(week?.id);

  const [showQuestions, setShowQuestions] = useState(false);
  const [showTeamManager, setShowTeamManager] = useState(false);
  const [isGrouped, setIsGrouped] = useState(true);

  const activeDays = Array.isArray(week?.active_days) ? week.active_days : [];
  const availableDays = [1, 2, 3, 4, 5].filter((d) => !activeDays.includes(d));
  const safeNotes = Array.isArray(notes) ? notes : [];
  const safeTeams = Array.isArray(teams) ? teams : [];

  const dayHasNotes = useMemo(() => {
    const map: Record<number, boolean> = {};
    activeDays.forEach((day) => {
      map[day] = safeNotes.some((n) => n.day === day && n.content?.trim() !== "");
    });
    return map;
  }, [safeNotes, activeDays]);

  const activeQuestions = questions?.questions?.filter((q: string) => q.trim()) || [];
  const isLoading = (weekLoading || teamsLoading) && !weekError && !teamsError;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fafaf9" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
          <p className="text-sm text-stone-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#fafaf9" }}>
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-[1600px] mx-auto px-8 py-3">
          <div className="flex items-center justify-between">
            <WeekNavigator
              weekStart={weekStart}
              onPrev={goToPrevWeek}
              onNext={goToNextWeek}
            />

            <div className="flex items-center gap-1">
              {/* Gruplama toggle */}
              <button
                onClick={() => setIsGrouped((prev) => !prev)}
                title={isGrouped ? "Gruplamayı kapat" : "Gruplamayı aç"}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                {isGrouped ? <ListTree className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
                {isGrouped ? "Gruplu" : "Grupsuz"}
              </button>

              {/* + Gün Ekle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    disabled={availableDays.length === 0}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Gün Ekle
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-stone-200 shadow-lg shadow-stone-200/50">
                  {availableDays.map((day) => (
                    <DropdownMenuItem key={day} onClick={() => addDay(day)} className="text-[13px] rounded-lg">
                      {DAY_NAMES[day]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sorular */}
              <button
                onClick={() => setShowQuestions(!showQuestions)}
                className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium transition-colors ${
                  showQuestions
                    ? "bg-violet-100 text-violet-700"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Sorular
              </button>

              {/* Takım Yönet */}
              <button
                onClick={() => setShowTeamManager(true)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                <Settings className="h-3.5 w-3.5" />
                Takım Yönet
              </button>
            </div>
          </div>

          {showQuestions && (
            <div className="mt-3">
              <WeeklyQuestions
                questions={activeQuestions}
                onSave={saveQuestions}
                onClose={() => setShowQuestions(false)}
              />
            </div>
          )}
        </div>
      </header>

      {/* ─── QUESTIONS BAR ─── */}
      {!showQuestions && activeQuestions.length > 0 && (
        <div className="max-w-[1600px] mx-auto px-8 pt-5">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-violet-50 border border-violet-100 rounded-xl text-[12px] text-violet-700">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-violet-400" />
            {activeQuestions.map((q: string, i: number) => (
              <span key={i} className="whitespace-nowrap">{i + 1}. {q}</span>
            ))}
          </div>
        </div>
      )}

      {/* ─── TABLE ─── */}
      <div className="max-w-[1600px] mx-auto px-8 py-5">
        {safeTeams.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-5">
              <Users className="h-7 w-7 text-stone-400" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900 mb-1.5">Henüz takım eklenmemiş</h2>
            <p className="text-sm text-stone-500 mb-6 max-w-[360px]">
              Başlamak için takım ve üye ekleyin. Check-in notlarınız burada görünecek.
            </p>
            <button
              onClick={() => setShowTeamManager(true)}
              className="flex items-center gap-2 h-10 px-5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Takım Ekle
            </button>
          </div>
        ) : (
          /* ─── THE TABLE ─── */
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm shadow-stone-100">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-stone-200">
                  {/* İsim column */}
                  <TableHead className="sticky left-0 z-20 min-w-[240px] bg-stone-50 px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider border-r border-stone-200">
                    İsim
                  </TableHead>

                  {/* Day column headers */}
                  {activeDays.map((day) => (
                    <DayColumnHeader
                      key={day}
                      day={day}
                      weekStart={weekStart}
                      hasNotes={dayHasNotes[day] || false}
                      onRemove={removeDay}
                    />
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {isGrouped
                  ? safeTeams.map((team: TeamWithMembers) => (
                      <TeamGroup
                        key={team.id}
                        team={team}
                        activeDays={activeDays}
                        weekId={week?.id}
                        getNoteContent={getNoteContent}
                        saveNote={saveNote}
                        getSkipMeta={getSkipMeta}
                        setSkipMeta={setSkipMeta}
                        isSaving={isSaving}
                        isSaved={isSaved}
                      />
                    ))
                  : safeTeams.flatMap((team: TeamWithMembers) =>
                      team.members.map((member) => (
                        <MemberRow
                          key={`${team.id}-${member.id}`}
                          member={member}
                          activeDays={activeDays}
                          weekId={week?.id}
                          getNoteContent={getNoteContent}
                          saveNote={saveNote}
                          getSkipMeta={getSkipMeta}
                          setSkipMeta={setSkipMeta}
                          isSaving={isSaving}
                          isSaved={isSaved}
                        />
                      ))
                    )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Team Manager */}
      <TeamManager open={showTeamManager} onClose={() => setShowTeamManager(false)} />
    </div>
  );
}
