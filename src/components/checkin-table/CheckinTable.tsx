"use client";

import { Plus, MessageSquare, Settings, Users, ListTree, List } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#eaeaea]">
        <div className="max-w-[1600px] mx-auto px-6 py-2.5">
          <div className="flex items-center justify-between">
            <WeekNavigator
              weekStart={weekStart}
              onPrev={goToPrevWeek}
              onNext={goToNextWeek}
            />

            <div className="flex items-center gap-0.5">
              {/* Gruplama toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsGrouped((prev) => !prev)}
                className="text-[13px] text-[#111111] hover:text-[#111111] gap-1.5 h-8 font-medium"
                title={isGrouped ? "Gruplamayı kapat" : "Gruplamayı aç"}
              >
                {isGrouped ? <ListTree className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
                {isGrouped ? "Gruplu" : "Grupsuz"}
              </Button>

              {/* + Gün Ekle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={availableDays.length === 0}
                    className="text-[13px] text-[#111111] hover:text-[#111111] gap-1.5 h-8 font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Gün Ekle
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[150px]">
                  {availableDays.map((day) => (
                    <DropdownMenuItem key={day} onClick={() => addDay(day)} className="text-[13px]">
                      {DAY_NAMES[day]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sorular */}
              <Button
                variant={showQuestions ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowQuestions(!showQuestions)}
                className="text-[13px] text-[#111111] hover:text-[#111111] gap-1.5 h-8 font-medium"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Sorular
              </Button>

              {/* Takım Yönet */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTeamManager(true)}
                className="text-[13px] text-[#111111] hover:text-[#111111] gap-1.5 h-8 font-medium"
              >
                <Settings className="h-3.5 w-3.5" />
                Takım Yönet
              </Button>
            </div>
          </div>

          {showQuestions && (
            <WeeklyQuestions
              questions={activeQuestions}
              onSave={saveQuestions}
              onClose={() => setShowQuestions(false)}
            />
          )}
        </div>
      </header>

      {/* ─── QUESTIONS BAR ─── */}
      {!showQuestions && activeQuestions.length > 0 && (
        <div className="max-w-[1600px] mx-auto px-6 pt-4">
          <div className="flex items-center gap-3 px-3.5 py-2 bg-[#f8f9fb] rounded-md text-[12px] text-[#6e6e6e]">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-[#9ca3af]" />
            {activeQuestions.map((q: string, i: number) => (
              <span key={i} className="whitespace-nowrap">{i + 1}. {q}</span>
            ))}
          </div>
        </div>
      )}

      {/* ─── TABLE ─── */}
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        {safeTeams.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-5">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-base font-semibold text-foreground mb-1.5">Henüz takım eklenmemiş</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-[360px]">
              Başlamak için takım ve üye ekleyin. Check-in notlarınız burada görünecek.
            </p>
            <Button onClick={() => setShowTeamManager(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Takım Ekle
            </Button>
          </div>
        ) : (
          /* ─── THE TABLE ─── */
          <div className="rounded-lg border border-[#eaeaea] bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-[#eaeaea]">
                  {/* İsim column */}
                  <TableHead className="sticky left-0 z-20 min-w-[240px] bg-[#f8f9fb] px-4 py-2 text-xs font-medium text-[#6e6e6e] uppercase tracking-wide border-r border-[#eaeaea]">
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
