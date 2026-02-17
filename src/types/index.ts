export interface Team {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Member {
  id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
  team_id: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Week {
  id: string;
  week_start: string;
  active_days: number[];
  created_at: string;
}

export interface WeeklyQuestion {
  id: string;
  week_id: string;
  questions: string[];
  created_at: string;
}

export interface CheckinNote {
  id: string;
  member_id: string;
  week_id: string;
  day: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export type MeetingSkipReason = "unreachable" | "on_leave" | "other";

export interface MeetingSkipMeta {
  reason: MeetingSkipReason;
  other_text?: string;
}

export interface TeamWithMembers extends Team {
  members: Member[];
}

export const DAY_NAMES: Record<number, string> = {
  1: "Pazartesi",
  2: "Salı",
  3: "Çarşamba",
  4: "Perşembe",
  5: "Cuma",
};

export const DAY_NAMES_SHORT: Record<number, string> = {
  1: "Pzt",
  2: "Sal",
  3: "Çar",
  4: "Per",
  5: "Cum",
};

export const MONTH_NAMES: string[] = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

// === Detail Page Types ===

export interface CheckinFeedback {
  id: string;
  member_id: string;
  week_id: string;
  day_number: number;
  question_type: "general_notes" | "weekly_question" | "mood";
  question_index: number | null;
  answer_text: string;
  mood_emoji: string | null;
  mood_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiNote {
  id: string;
  member_id: string;
  week_id: string;
  day_number: number;
  title: string;
  description: string;
  tags: string[];
  is_completed: boolean;
  source: "manual" | "ai_transcript";
  created_at: string;
  updated_at: string;
}

export interface Blocker {
  id: string;
  blocker_id: string;
  blocked_id: string;
  week_id: string;
  day_number: number;
  reason: string;
  status: "active" | "resolved";
  source: "manual" | "ai_transcript";
  created_at: string;
  resolved_at: string | null;
  // Joined fields
  blocker_name?: string;
  blocker_role?: string;
  blocked_name?: string;
  blocked_role?: string;
}

export interface Commitment {
  id: string;
  member_id: string;
  week_id: string;
  day_number: number;
  title: string;
  description: string;
  tags: string[];
  is_completed: boolean;
  completed_at: string | null;
  due_type: "today" | "this_week" | "next_week" | "custom";
  source: "manual" | "ai_transcript";
  created_at: string;
  updated_at: string;
}

export const MOOD_EMOJIS = ["😣", "😕", "😐", "🙂", "😄"] as const;

export const NOTE_TAG_COLORS: Record<string, { bg: string; text: string }> = {
  today: { bg: "#FEF3C7", text: "#D97706" },
  "to-do": { bg: "#FEE2E2", text: "#DC2626" },
  meeting: { bg: "#D1FAE5", text: "#059669" },
  important: { bg: "#EDE9FE", text: "#7C3AED" },
  yesterday: { bg: "#F3F4F6", text: "#6B7280" },
};
