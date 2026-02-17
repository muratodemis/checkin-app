"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Plus, X } from "lucide-react";
import { NoteItem } from "./NoteItem";
import { Commitment, NOTE_TAG_COLORS } from "@/types";
import { apiPath } from "@/lib/api";

interface Props {
  memberId: string;
  weekId: string;
  dayNumber: number;
}

export function CommitmentsCard({ memberId, weekId, dayNumber }: Props) {
  const [items, setItems] = useState<Commitment[]>([]);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);

  const load = useCallback(() => {
    fetch(apiPath(`api/commitments?memberId=${memberId}&weekId=${weekId}&day=${dayNumber}`))
      .then(r => r.json())
      .then(setItems)
      .catch(() => {});
  }, [memberId, weekId, dayNumber]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh: poll if no items (AI may still be generating)
  useEffect(() => {
    if (items.length > 0) return;
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [items.length, load]);

  const add = async () => {
    if (!newTitle.trim()) return;
    await fetch(apiPath("api/commitments"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: memberId, week_id: weekId, day_number: dayNumber, title: newTitle, description: newDesc, tags: newTags }),
    });
    setNewTitle(""); setNewDesc(""); setNewTags([]); setAdding(false);
    load();
  };

  const toggle = async (id: string, current: boolean) => {
    await fetch(apiPath(`api/commitments/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_completed: !current }),
    });
    load();
  };

  const allTags = Object.keys(NOTE_TAG_COLORS);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-stone-500" />
          <h3 className="text-base font-semibold text-stone-900">Commitments</h3>
        </div>
        <button onClick={() => setAdding(!adding)} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors">
          {adding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {adding ? "Cancel" : "Add Note"}
        </button>
      </div>

      {adding && (
        <div className="mb-4 p-3 bg-stone-50 rounded-xl space-y-2 animate-fade-in">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Commitment title" className="w-full h-9 px-3 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-300" />
          <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" className="w-full h-16 p-3 text-sm border border-stone-200 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-300" />
          <div className="flex gap-1.5 flex-wrap">
            {allTags.map(tag => (
              <button key={tag} onClick={() => setNewTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors"
                style={{
                  backgroundColor: newTags.includes(tag) ? NOTE_TAG_COLORS[tag].bg : "transparent",
                  color: newTags.includes(tag) ? NOTE_TAG_COLORS[tag].text : "#9CA3AF",
                  borderColor: newTags.includes(tag) ? NOTE_TAG_COLORS[tag].text : "#E5E7EB",
                }}>
                {tag}
              </button>
            ))}
          </div>
          <button onClick={add} className="w-full h-9 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors">Save</button>
        </div>
      )}

      <div className="max-h-[340px] overflow-y-auto">
        {items.length === 0 && !adding && <p className="text-sm text-stone-400 py-6 text-center">No commitments yet</p>}
        {items.map(item => (
          <NoteItem key={item.id} title={item.title} description={item.description} tags={item.tags} isCompleted={item.is_completed} date={item.created_at} onToggle={() => toggle(item.id, item.is_completed)} />
        ))}
      </div>
    </div>
  );
}
