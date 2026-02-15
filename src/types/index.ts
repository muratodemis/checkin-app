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
