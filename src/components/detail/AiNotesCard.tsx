"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Plus, X, RefreshCw } from "lucide-react";
import { NoteItem } from "./NoteItem";
import { AiNote, NOTE_TAG_COLORS } from "@/types";
import { apiPath } from "@/lib/api";

interface Props {
  memberId: string;
  weekId: string;
  dayNumber: number;
}

export function AiNotesCard({ memberId, weekId, dayNumber }: Props) {
  const [notes, setNotes] = useState<AiNote[]>([]);
  const [adding, setAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);

  const loadNotes = useCallback(() => {
    fetch(apiPath(`api/ai-notes?memberId=${memberId}&weekId=${weekId}&day=${dayNumber}`))
      .then(r => r.json())
      .then(setNotes)
      .catch(() => {});
  }, [memberId, weekId, dayNumber]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  // Auto-refresh: poll for notes every 5 seconds if no notes exist (AI may still be generating)
  useEffect(() => {
    if (notes.length > 0) return;
    const interval = setInterval(loadNotes, 5000);
    return () => clearInterval(interval);
  }, [notes.length, loadNotes]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotes();
    setTimeout(() => setRefreshing(false), 600);
  };

  const addNote = async () => {
    if (!newTitle.trim()) return;
    await fetch(apiPath("api/ai-notes"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: memberId, week_id: weekId, day_number: dayNumber, title: newTitle, description: newDesc, tags: newTags }),
    });
    setNewTitle(""); setNewDesc(""); setNewTags([]); setAdding(false);
    loadNotes();
  };

  const toggleNote = async (id: string, current: boolean) => {
    await fetch(apiPath(`api/ai-notes/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_completed: !current }),
    });
    loadNotes();
  };

  const allTags = Object.keys(NOTE_TAG_COLORS);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-stone-500" />
          <h3 className="text-base font-semibold text-stone-900">AI Notes</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            title="Refresh AI notes"
            className="p-1.5 rounded-lg text-stone-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setAdding(!adding)} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors">
            {adding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {adding ? "Cancel" : "Add Note"}
          </button>
        </div>
      </div>

      {adding && (
        <div className="mb-4 p-3 bg-stone-50 rounded-xl space-y-2 animate-fade-in">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Note title" className="w-full h-9 px-3 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-300" />
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
          <button onClick={addNote} className="w-full h-9 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors">Save</button>
        </div>
      )}

      <div className="max-h-[340px] overflow-y-auto">
        {notes.length === 0 && !adding && <p className="text-sm text-stone-400 py-8 text-center">No notes yet</p>}
        {notes.map(note => (
          <NoteItem key={note.id} title={note.title} description={note.description} tags={note.tags} isCompleted={note.is_completed} date={note.created_at} onToggle={() => toggleNote(note.id, note.is_completed)} />
        ))}
      </div>
    </div>
  );
}
