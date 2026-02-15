// In-memory store for development without Supabase
import { v4 } from "./uuid";

export interface StoreData {
  teams: Record<string, { id: string; name: string; sort_order: number; created_at: string }>;
  members: Record<string, { id: string; name: string; role: string | null; avatar_url: string | null; team_id: string; sort_order: number; is_active: boolean; created_at: string }>;
  weeks: Record<string, { id: string; week_start: string; active_days: number[]; created_at: string }>;
  weekly_questions: Record<string, { id: string; week_id: string; questions: string[]; created_at: string }>;
  checkin_notes: Record<string, { id: string; member_id: string; week_id: string; day: number; content: string; created_at: string; updated_at: string }>;
}

// ── Seed data – Univenn team (https://univenn.com/team) ──
const T_YON = "t-yonetim";
const T_FS  = "t-fullstack";
const T_FE  = "t-frontend";
const T_MOB = "t-mobile";
const T_UR  = "t-urun-tasarim";
const T_OPS = "t-operasyon";
const T_STJ = "t-stajyer";

const now = new Date().toISOString();

const store: StoreData = {
  teams: {
    [T_YON]: { id: T_YON, name: "Yönetim", sort_order: 0, created_at: now },
    [T_FS]:  { id: T_FS,  name: "Fullstack Development", sort_order: 1, created_at: now },
    [T_FE]:  { id: T_FE,  name: "Frontend Development", sort_order: 2, created_at: now },
    [T_MOB]: { id: T_MOB, name: "Mobile Development", sort_order: 3, created_at: now },
    [T_UR]:  { id: T_UR,  name: "Ürün & Tasarım", sort_order: 4, created_at: now },
    [T_OPS]: { id: T_OPS, name: "Operasyon & Pazarlama", sort_order: 5, created_at: now },
    [T_STJ]: { id: T_STJ, name: "Stajyerler", sort_order: 6, created_at: now },
  },
  members: {
    // ── Yönetim ──
    "m-murat":    { id: "m-murat",    name: "Murat Ödemiş",       role: "CEO",                                   avatar_url: null, team_id: T_YON, sort_order: 0, is_active: true, created_at: now },
    "m-furkan":   { id: "m-furkan",   name: "Furkan Erkorkmaz",   role: "Chief Studio Officer",                   avatar_url: null, team_id: T_YON, sort_order: 1, is_active: true, created_at: now },
    "m-yunus":    { id: "m-yunus",    name: "Yunus Gülcü",        role: "CTO",                                   avatar_url: null, team_id: T_YON, sort_order: 2, is_active: true, created_at: now },
    // ── Fullstack Development ──
    "m-ayhan":    { id: "m-ayhan",    name: "Ayhan Aksoy",        role: "Sr. Fullstack Developer",                avatar_url: null, team_id: T_FS, sort_order: 0, is_active: true, created_at: now },
    "m-bilal":    { id: "m-bilal",    name: "Bilal Gümüş",        role: "Sr. Fullstack Developer",                avatar_url: null, team_id: T_FS, sort_order: 1, is_active: true, created_at: now },
    "m-bariscan": { id: "m-bariscan", name: "Barış Can Hasar",    role: "Sr. Fullstack Developer",                avatar_url: null, team_id: T_FS, sort_order: 2, is_active: true, created_at: now },
    "m-gokberk":  { id: "m-gokberk",  name: "Gökberk Sarı",       role: "Jr. Fullstack Developer",                avatar_url: null, team_id: T_FS, sort_order: 3, is_active: true, created_at: now },
    // ── Frontend Development ──
    "m-deniz":    { id: "m-deniz",    name: "Deniz Erişen",       role: "Sr. Frontend Developer",                 avatar_url: null, team_id: T_FE, sort_order: 0, is_active: true, created_at: now },
    "m-ozan":     { id: "m-ozan",     name: "Ozan İşgör",         role: "Sr. Frontend Developer",                 avatar_url: null, team_id: T_FE, sort_order: 1, is_active: true, created_at: now },
    // ── Mobile Development ──
    "m-barist":   { id: "m-barist",   name: "Barış Topal",        role: "Head of Studio, Sr. Android Developer",  avatar_url: null, team_id: T_MOB, sort_order: 0, is_active: true, created_at: now },
    "m-oguzhan":  { id: "m-oguzhan",  name: "Oğuzhan Aslan",      role: "Sr. Android Developer",                  avatar_url: null, team_id: T_MOB, sort_order: 1, is_active: true, created_at: now },
    "m-hakan":    { id: "m-hakan",    name: "Hakan Işık",          role: "Mid. Mobile Developer",                  avatar_url: null, team_id: T_MOB, sort_order: 2, is_active: true, created_at: now },
    // ── Ürün & Tasarım ──
    "m-sara":     { id: "m-sara",     name: "Sara Mboqe Koçak",   role: "Sr. Product Manager",                    avatar_url: null, team_id: T_UR, sort_order: 0, is_active: true, created_at: now },
    "m-ozce":     { id: "m-ozce",     name: "Z. Özce Özbaşoğlu",  role: "Mid. Product Manager",                   avatar_url: null, team_id: T_UR, sort_order: 1, is_active: true, created_at: now },
    "m-ezel":     { id: "m-ezel",     name: "Ezel Yalçın",        role: "Sr. UI/UX Designer",                     avatar_url: null, team_id: T_UR, sort_order: 2, is_active: true, created_at: now },
    // ── Operasyon & Pazarlama ──
    "m-meric":    { id: "m-meric",    name: "Meriç Ödemiş",       role: "People & Culture Executive",             avatar_url: null, team_id: T_OPS, sort_order: 0, is_active: true, created_at: now },
    "m-baran":    { id: "m-baran",    name: "Baran Barış Bal",     role: "Business Ops Executive",                 avatar_url: null, team_id: T_OPS, sort_order: 1, is_active: true, created_at: now },
    "m-hakand":   { id: "m-hakand",   name: "Hakan Demirbilek",   role: "Sr. Marketing Artist",                   avatar_url: null, team_id: T_OPS, sort_order: 2, is_active: true, created_at: now },
    // ── Stajyerler ──
    "m-ceyda":    { id: "m-ceyda",    name: "Ceyda Oymak",        role: "Development Intern",                     avatar_url: null, team_id: T_STJ, sort_order: 0, is_active: true, created_at: now },
    "m-melisa":   { id: "m-melisa",   name: "Melisa Şener",        role: "Development Intern",                     avatar_url: null, team_id: T_STJ, sort_order: 1, is_active: true, created_at: now },
  },
  weeks: {},
  weekly_questions: {},
  checkin_notes: {},
};

export function isMemoryMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return !url || url.includes("placeholder");
}

// --- Teams ---
export function getTeamsWithMembers() {
  const teams = Object.values(store.teams).sort((a, b) => a.sort_order - b.sort_order);
  const members = Object.values(store.members).filter((m) => m.is_active).sort((a, b) => a.sort_order - b.sort_order);
  return teams.map((t) => ({ ...t, members: members.filter((m) => m.team_id === t.id) }));
}

export function createTeam(name: string, sort_order = 0) {
  const id = v4();
  const team = { id, name, sort_order, created_at: new Date().toISOString() };
  store.teams[id] = team;
  return team;
}

export function updateTeam(id: string, data: Partial<{ name: string; sort_order: number }>) {
  if (!store.teams[id]) return null;
  store.teams[id] = { ...store.teams[id], ...data };
  return store.teams[id];
}

export function deleteTeam(id: string) {
  // Also delete members of this team
  Object.values(store.members).forEach((m) => {
    if (m.team_id === id) delete store.members[m.id];
  });
  delete store.teams[id];
  return true;
}

// --- Members ---
export function createMember(data: { name: string; role?: string | null; avatar_url?: string | null; team_id: string; sort_order?: number }) {
  const id = v4();
  const member = {
    id,
    name: data.name,
    role: data.role || null,
    avatar_url: data.avatar_url || null,
    team_id: data.team_id,
    sort_order: data.sort_order || 0,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  store.members[id] = member;
  return member;
}

export function updateMember(id: string, data: Partial<{ name: string; role: string; avatar_url: string; team_id: string; is_active: boolean }>) {
  if (!store.members[id]) return null;
  store.members[id] = { ...store.members[id], ...data };
  return store.members[id];
}

export function deactivateMember(id: string) {
  if (!store.members[id]) return null;
  store.members[id].is_active = false;
  return store.members[id];
}

// --- Weeks ---
export function getOrCreateWeek(weekStart: string) {
  const existing = Object.values(store.weeks).find((w) => w.week_start === weekStart);
  if (existing) return existing;
  const id = v4();
  const week = { id, week_start: weekStart, active_days: [1, 3, 5], created_at: new Date().toISOString() };
  store.weeks[id] = week;
  return week;
}

export function updateWeek(id: string, data: { active_days: number[] }) {
  if (!store.weeks[id]) return null;
  store.weeks[id] = { ...store.weeks[id], ...data };
  return store.weeks[id];
}

// --- Questions ---
export function getQuestions(weekId: string) {
  return Object.values(store.weekly_questions).find((q) => q.week_id === weekId) || null;
}

export function setQuestions(weekId: string, questions: string[]) {
  const existing = Object.values(store.weekly_questions).find((q) => q.week_id === weekId);
  if (existing) {
    existing.questions = questions;
    return existing;
  }
  const id = v4();
  const q = { id, week_id: weekId, questions, created_at: new Date().toISOString() };
  store.weekly_questions[id] = q;
  return q;
}

// --- Notes ---
export function getNotesByWeek(weekId: string) {
  return Object.values(store.checkin_notes).filter((n) => n.week_id === weekId);
}

export function upsertNote(data: { member_id: string; week_id: string; day: number; content: string }) {
  const key = `${data.member_id}-${data.week_id}-${data.day}`;
  const existing = Object.values(store.checkin_notes).find(
    (n) => n.member_id === data.member_id && n.week_id === data.week_id && n.day === data.day
  );
  if (existing) {
    existing.content = data.content;
    existing.updated_at = new Date().toISOString();
    return existing;
  }
  const id = v4();
  const note = {
    id,
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.checkin_notes[id] = note;
  return note;
}
