"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface WeeklyQuestionsProps {
  questions: string[];
  onSave: (questions: string[]) => void;
  onClose: () => void;
}

export function WeeklyQuestions({ questions, onSave, onClose }: WeeklyQuestionsProps) {
  const [text, setText] = useState(() => questions.join("\n"));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setText(questions.join("\n"));
    setDirty(false);
  }, [questions]);

  const handleSave = () => {
    const list = text.split("\n").map((q) => q.trim()).filter(Boolean);
    onSave(list);
    setDirty(false);
  };

  return (
    <div className="mt-4 animate-fade-in">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
          <div>
            <h3 className="text-[13px] font-semibold text-stone-700">Haftalık Sorular</h3>
            <p className="text-[11px] text-stone-400 mt-0.5">Her satıra bir soru yazın.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setDirty(true); }}
            placeholder={"Bugün üzerinde ne çalıştın?\nHerhangi bir engel var mı?\nYarın planın ne?"}
            className="w-full min-h-[100px] px-3 py-2.5 text-[13px] leading-relaxed text-stone-700 bg-stone-50 rounded-lg border border-stone-200 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent resize-none transition-all"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-[11px] text-stone-400">{text.split("\n").filter((l) => l.trim()).length} soru</p>
            <button
              onClick={handleSave}
              disabled={!dirty}
              className="px-4 py-1.5 rounded-lg text-[12px] font-medium bg-stone-800 text-white hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
