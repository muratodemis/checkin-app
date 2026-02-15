"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { Week, WeeklyQuestion } from "@/types";
import { getMondayOfWeek, getAdjacentMonday } from "@/lib/utils";

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function useWeek() {
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek());

  const {
    data: week,
    error,
    isLoading,
    mutate: mutateWeek,
  } = useSWR<Week>(`/api/weeks?date=${weekStart}`, fetcher, {
    revalidateOnFocus: false,
  });

  const {
    data: questions,
    mutate: mutateQuestions,
  } = useSWR<WeeklyQuestion | null>(
    week?.id ? `/api/weeks/${week.id}/questions` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const goToPrevWeek = useCallback(() => {
    setWeekStart((prev) => getAdjacentMonday(prev, "prev"));
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekStart((prev) => getAdjacentMonday(prev, "next"));
  }, []);

  const addDay = useCallback(
    async (day: number) => {
      if (!week?.id || !week.active_days) return;
      const newDays = [...week.active_days, day].sort((a, b) => a - b);
      await fetch(`/api/weeks/${week.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active_days: newDays }),
      });
      mutateWeek();
    },
    [week, mutateWeek]
  );

  const removeDay = useCallback(
    async (day: number) => {
      if (!week?.id || !week.active_days) return;
      const newDays = week.active_days.filter((d) => d !== day);
      await fetch(`/api/weeks/${week.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active_days: newDays }),
      });
      mutateWeek();
    },
    [week, mutateWeek]
  );

  const saveQuestions = useCallback(
    async (questionList: string[]) => {
      if (!week?.id) return;
      await fetch(`/api/weeks/${week.id}/questions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: questionList }),
      });
      mutateQuestions();
    },
    [week, mutateQuestions]
  );

  return {
    week,
    weekStart,
    questions,
    isLoading,
    error,
    goToPrevWeek,
    goToNextWeek,
    addDay,
    removeDay,
    saveQuestions,
  };
}
