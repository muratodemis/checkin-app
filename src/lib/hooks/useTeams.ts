"use client";

import useSWR from "swr";
import { useCallback } from "react";
import { TeamWithMembers } from "@/types";
import { apiPath } from "@/lib/api";

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export function useTeams() {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<TeamWithMembers[]>(apiPath("api/teams"), fetcher, {
    fallbackData: [],
    revalidateOnFocus: false,
  });

  const teams = Array.isArray(data) ? data : [];

  const createTeam = useCallback(
    async (name: string) => {
      await fetch(apiPath("api/teams"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      mutate();
    },
    [mutate]
  );

  const updateTeam = useCallback(
    async (id: string, updates: { name?: string; sort_order?: number }) => {
      await fetch(apiPath(`api/teams/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      mutate();
    },
    [mutate]
  );

  const deleteTeam = useCallback(
    async (id: string) => {
      await fetch(apiPath(`api/teams/${id}`), { method: "DELETE" });
      mutate();
    },
    [mutate]
  );

  const createMember = useCallback(
    async (memberData: {
      name: string;
      role?: string;
      avatar_url?: string;
      team_id: string;
    }) => {
      await fetch(apiPath("api/members"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberData),
      });
      mutate();
    },
    [mutate]
  );

  const updateMember = useCallback(
    async (
      id: string,
      updates: {
        name?: string;
        role?: string;
        avatar_url?: string;
        team_id?: string;
      }
    ) => {
      await fetch(apiPath(`api/members/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      mutate();
    },
    [mutate]
  );

  const deactivateMember = useCallback(
    async (id: string) => {
      await fetch(apiPath(`api/members/${id}`), { method: "DELETE" });
      mutate();
    },
    [mutate]
  );

  return {
    teams,
    isLoading,
    error,
    createTeam,
    updateTeam,
    deleteTeam,
    createMember,
    updateMember,
    deactivateMember,
  };
}
