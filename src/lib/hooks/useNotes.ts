"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { CheckinNote, MeetingSkipMeta } from "@/types";
import { apiPath } from "@/lib/api";

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export function useNotes(weekId: string | undefined) {
  const {
    data,
    mutate,
  } = useSWR<CheckinNote[]>(
    weekId ? apiPath(`api/notes?week_id=${weekId}`) : null,
    fetcher,
    { fallbackData: [], revalidateOnFocus: false }
  );

  const notes = Array.isArray(data) ? data : [];

  const [savingCells, setSavingCells] = useState<Set<string>>(new Set());
  const [savedCells, setSavedCells] = useState<Set<string>>(new Set());
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [skipMap, setSkipMap] = useState<Record<string, MeetingSkipMeta>>({});

  const skipStorageKey = useMemo(
    () => (weekId ? `checkin-skip-${weekId}` : null),
    [weekId]
  );

  const persistSkipMap = useCallback(
    (next: Record<string, MeetingSkipMeta>) => {
      if (!skipStorageKey) return;
      try {
        localStorage.setItem(skipStorageKey, JSON.stringify(next));
      } catch (err) {
        console.error("Failed to persist skip map:", err);
      }
    },
    [skipStorageKey]
  );

  useEffect(() => {
    if (!skipStorageKey) return;
    try {
      const raw = localStorage.getItem(skipStorageKey);
      if (!raw) {
        setSkipMap({});
        return;
      }
      const parsed = JSON.parse(raw) as Record<string, MeetingSkipMeta>;
      setSkipMap(parsed && typeof parsed === "object" ? parsed : {});
    } catch {
      setSkipMap({});
    }
  }, [skipStorageKey]);

  const getCellKey = useCallback((memberId: string, day: number) => `${memberId}-${day}`, []);

  const getNoteContent = useCallback(
    (memberId: string, day: number): string => {
      const note = notes.find(
        (n) => n.member_id === memberId && n.day === day
      );
      return note?.content || "";
    },
    [notes]
  );

  const saveNote = useCallback(
    async (memberId: string, day: number, content: string) => {
      if (!weekId) return;

      const cellKey = getCellKey(memberId, day);

      if (content.trim()) {
        setSkipMap((prev) => {
          if (!prev[cellKey]) return prev;
          const next = { ...prev };
          delete next[cellKey];
          persistSkipMap(next);
          return next;
        });
      }

      // Clear any existing debounce timer
      const existingTimer = debounceTimers.current.get(cellKey);
      if (existingTimer) clearTimeout(existingTimer);

      // Set saving state
      setSavingCells((prev) => new Set(prev).add(cellKey));
      setSavedCells((prev) => {
        const next = new Set(prev);
        next.delete(cellKey);
        return next;
      });

      // Debounce the actual save
      const timer = setTimeout(async () => {
        try {
          await fetch(apiPath("api/notes"), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              member_id: memberId,
              week_id: weekId,
              day,
              content,
            }),
          });

          mutate();

          setSavingCells((prev) => {
            const next = new Set(prev);
            next.delete(cellKey);
            return next;
          });
          setSavedCells((prev) => new Set(prev).add(cellKey));

          setTimeout(() => {
            setSavedCells((prev) => {
              const next = new Set(prev);
              next.delete(cellKey);
              return next;
            });
          }, 1500);
        } catch (err) {
          console.error("Failed to save note:", err);
          setSavingCells((prev) => {
            const next = new Set(prev);
            next.delete(cellKey);
            return next;
          });
        }
      }, 500);

      debounceTimers.current.set(cellKey, timer);
    },
    [weekId, mutate, getCellKey, persistSkipMap]
  );

  const getSkipMeta = useCallback(
    (memberId: string, day: number): MeetingSkipMeta | null => {
      const key = getCellKey(memberId, day);
      return skipMap[key] || null;
    },
    [getCellKey, skipMap]
  );

  const setSkipMeta = useCallback(
    (memberId: string, day: number, meta: MeetingSkipMeta | null) => {
      const key = getCellKey(memberId, day);
      setSkipMap((prev) => {
        const next = { ...prev };
        if (!meta) {
          delete next[key];
        } else {
          next[key] = meta;
        }
        persistSkipMap(next);
        return next;
      });
    },
    [getCellKey, persistSkipMap]
  );

  const isSaving = useCallback(
    (memberId: string, day: number) => savingCells.has(getCellKey(memberId, day)),
    [savingCells, getCellKey]
  );

  const isSaved = useCallback(
    (memberId: string, day: number) => savedCells.has(getCellKey(memberId, day)),
    [savedCells, getCellKey]
  );

  return {
    notes,
    getNoteContent,
    saveNote,
    getSkipMeta,
    setSkipMeta,
    isSaving,
    isSaved,
  };
}
