"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldAlert, Plus, X } from "lucide-react";
import { Blocker, Member } from "@/types";
import { apiPath } from "@/lib/api";

interface Props {
  memberId: string;
  memberName: string;
  weekId: string;
  dayNumber: number;
  allMembers: Member[];
}

export function BlockersCard({ memberId, memberName, weekId, dayNumber, allMembers }: Props) {
  const [waiting, setWaiting] = useState<Blocker[]>([]);
  const [blockerTo, setBlockerTo] = useState<Blocker[]>([]);
  const [adding, setAdding] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [direction, setDirection] = useState<"blocking_me" | "i_block">("blocking_me");
  const [reason, setReason] = useState("");

  const load = useCallback(() => {
    fetch(apiPath(`api/blockers?memberId=${memberId}&weekId=${weekId}&day=${dayNumber}`))
      .then(r => r.json())
      .then(data => {
        setWaiting(data.waiting || []);
        setBlockerTo(data.blocker_to || []);
      })
      .catch(() => {});
  }, [memberId, weekId, dayNumber]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh: poll if no items (AI may still be generating)
  useEffect(() => {
    if (waiting.length > 0 || blockerTo.length > 0) return;
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [waiting.length, blockerTo.length, load]);

  const addBlocker = async () => {
    if (!selectedMember) return;
    const body = direction === "blocking_me"
      ? { blocker_id: selectedMember, blocked_id: memberId, week_id: weekId, day_number: dayNumber, reason }
      : { blocker_id: memberId, blocked_id: selectedMember, week_id: weekId, day_number: dayNumber, reason };
    await fetch(apiPath("api/blockers"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setAdding(false); setSelectedMember(""); setReason("");
    load();
  };

  const resolve = async (id: string) => {
    await fetch(apiPath(`api/blockers/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved" }),
    });
    load();
  };

  const otherMembers = allMembers.filter(m => m.id !== memberId);

  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-stone-500" />
          <h3 className="text-base font-semibold text-stone-900">Blockers</h3>
        </div>
        <button onClick={() => setAdding(!adding)} className="text-xs text-stone-500 hover:text-stone-700 border border-stone-200 rounded-lg px-3 py-1.5 transition-colors">
          {adding ? "Cancel" : "Add Blocking or Blocker"}
        </button>
      </div>

      {adding && (
        <div className="mb-4 p-3 bg-stone-50 rounded-xl space-y-2 animate-fade-in">
          <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)} className="w-full h-9 px-3 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-300">
            <option value="">Kişi seç...</option>
            {otherMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={() => setDirection("blocking_me")} className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${direction === "blocking_me" ? "bg-violet-100 border-violet-300 text-violet-700" : "border-stone-200 text-stone-500"}`}>
              Bu kişi {memberName}&apos;ı blokluyor
            </button>
            <button onClick={() => setDirection("i_block")} className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${direction === "i_block" ? "bg-violet-100 border-violet-300 text-violet-700" : "border-stone-200 text-stone-500"}`}>
              {memberName} bu kişiyi blokluyor
            </button>
          </div>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason..." className="w-full h-16 p-3 text-sm border border-stone-200 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-300" />
          <button onClick={addBlocker} className="w-full h-9 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors">Save</button>
        </div>
      )}

      {/* Waiting section */}
      {waiting.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Waiting</p>
          {waiting.map(b => (
            <div key={b.id} className="flex items-center gap-3 py-2.5 border-b border-stone-100 last:border-0">
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-semibold text-stone-600 shrink-0">
                {initials(b.blocker_name || "?")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900">{b.blocker_name}</p>
                {b.reason && <p className="text-xs text-stone-400 truncate">{b.reason}</p>}
              </div>
              <button onClick={() => resolve(b.id)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Resolve</button>
            </div>
          ))}
        </div>
      )}

      {/* Blocker to section */}
      {blockerTo.length > 0 && (
        <div>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Blocker to</p>
          {blockerTo.map(b => (
            <div key={b.id} className="flex items-center gap-3 py-2.5 border-b border-stone-100 last:border-0">
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-semibold text-stone-600 shrink-0">
                {initials(b.blocked_name || "?")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900">{b.blocked_name}</p>
                {b.reason && <p className="text-xs text-stone-400 truncate">{b.reason}</p>}
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-600">
                {Math.round((Date.now() - new Date(b.created_at).getTime()) / 60000)}m
              </span>
            </div>
          ))}
        </div>
      )}

      {waiting.length === 0 && blockerTo.length === 0 && !adding && (
        <p className="text-sm text-stone-400 py-6 text-center">No blockers</p>
      )}
    </div>
  );
}
