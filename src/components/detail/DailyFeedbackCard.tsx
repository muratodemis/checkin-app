"use client";

import { useState, useCallback, useEffect } from "react";
import { ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";
import { MoodSelector } from "./MoodSelector";
import { apiPath } from "@/lib/api";
import { CheckinFeedback } from "@/types";

interface Props {
  memberId: string;
  memberName: string;
  weekId: string;
  dayNumber: number;
  weeklyQuestions: string[];
}

export function DailyFeedbackCard({ memberId, memberName, weekId, dayNumber, weeklyQuestions }: Props) {
  const [step, setStep] = useState(0);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, CheckinFeedback>>({});
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});
  const [moodEmoji, setMoodEmoji] = useState<string | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [focused, setFocused] = useState(false);

  // Build question list
  const questions = [
    { type: "general_notes" as const, index: 0, title: "Genel Notlarım", subtitle: "Your general notes" },
    ...weeklyQuestions.map((q, i) => ({
      type: "weekly_question" as const,
      index: i,
      title: q,
      subtitle: "",
    })),
    { type: "mood" as const, index: 0, title: `How would you rate ${memberName}'s mood today?`, subtitle: "" },
  ];
  const totalSteps = questions.length;
  const current = questions[step];

  // Load existing feedback
  useEffect(() => {
    fetch(apiPath(`api/checkin-feedback?memberId=${memberId}&weekId=${weekId}&day=${dayNumber}`))
      .then(r => r.json())
      .then((items: CheckinFeedback[]) => {
        const map: Record<string, CheckinFeedback> = {};
        for (const item of items) {
          const key = `${item.question_type}-${item.question_index ?? 0}`;
          map[key] = item;
          if (item.question_type === "general_notes") setGeneralNotes(item.answer_text || "");
          if (item.question_type === "weekly_question") {
            setLocalAnswers(prev => ({ ...prev, [item.question_index ?? 0]: item.answer_text || "" }));
          }
          if (item.question_type === "mood") {
            setMoodEmoji(item.mood_emoji);
            setMoodNote(item.mood_note || "");
          }
        }
        setFeedbackMap(map);
      })
      .catch(() => {});
  }, [memberId, weekId, dayNumber]);

  const saveFeedback = useCallback((type: string, index: number, data: Record<string, unknown>) => {
    fetch(apiPath("api/checkin-feedback"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: memberId,
        week_id: weekId,
        day_number: dayNumber,
        question_type: type,
        question_index: index,
        ...data,
      }),
    }).catch(() => {});
  }, [memberId, weekId, dayNumber]);

  // Debounced saves
  useEffect(() => {
    const t = setTimeout(() => {
      if (current?.type === "general_notes") saveFeedback("general_notes", 0, { answer_text: generalNotes });
    }, 500);
    return () => clearTimeout(t);
  }, [generalNotes]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (current?.type === "weekly_question") {
        saveFeedback("weekly_question", current.index, { answer_text: localAnswers[current.index] || "" });
      }
    }, 500);
    return () => clearTimeout(t);
  }, [localAnswers, step]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (moodEmoji !== null || moodNote) {
        saveFeedback("mood", 0, { mood_emoji: moodEmoji, mood_note: moodNote });
      }
    }, 500);
    return () => clearTimeout(t);
  }, [moodEmoji, moodNote]);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-stone-500" />
          <h3 className="text-base font-semibold text-stone-900">Daily Feedback</h3>
        </div>
        <span className="text-sm text-stone-400">Question {step + 1}/{totalSteps}</span>
      </div>

      <div className="min-h-[260px]">
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-4">
          <span className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-bold">
            {String(step + 1).padStart(2, "0")}
          </span>
        </div>

        <h4 className="text-center text-base font-semibold text-stone-900 mb-1">{current.title}</h4>
        {current.subtitle && <p className="text-center text-sm text-stone-400 mb-4">{current.subtitle}</p>}

        {/* Content based on type */}
        {current.type === "general_notes" && (
          <div>
            {generalNotes && !focused ? (
              <div
                onClick={() => setFocused(true)}
                className="w-full min-h-[112px] p-4 text-sm leading-relaxed border border-stone-200 rounded-xl bg-stone-50 text-stone-700 cursor-text whitespace-pre-wrap hover:border-stone-300 transition-colors"
              >
                {generalNotes}
              </div>
            ) : (
              <textarea
                value={generalNotes}
                onChange={e => setGeneralNotes(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Write your general notes..."
                className="w-full h-28 p-3 text-sm border border-stone-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 bg-stone-50 text-stone-900 placeholder:text-stone-400"
              />
            )}
          </div>
        )}

        {current.type === "weekly_question" && (
          <textarea
            value={localAnswers[current.index] || ""}
            onChange={e => setLocalAnswers(prev => ({ ...prev, [current.index]: e.target.value }))}
            placeholder="Write your answer..."
            className="w-full h-28 p-3 text-sm border border-stone-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 bg-stone-50 text-stone-900 placeholder:text-stone-400"
          />
        )}

        {current.type === "mood" && (
          <div>
            <MoodSelector selected={moodEmoji} onSelect={setMoodEmoji} />
            <textarea
              value={moodNote}
              onChange={e => setMoodNote(e.target.value)}
              placeholder="Tell why"
              className="w-full h-20 p-3 text-sm border border-stone-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 bg-stone-50 text-stone-900 placeholder:text-stone-400 mt-3"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button
          onClick={() => setStep(s => Math.min(totalSteps - 1, s + 1))}
          disabled={step === totalSteps - 1}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-30 transition-colors"
        >
          Next Question <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
