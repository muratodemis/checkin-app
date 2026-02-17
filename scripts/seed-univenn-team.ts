/**
 * Univenn takımını (https://univenn.com/team) Supabase teams + members tablolarına ekler.
 * Bir kez çalıştır: npx tsx scripts/seed-univenn-team.ts
 * .env.local içinde NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY olmalı.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// .env.local yükle sadece Supabase URL yoksa (shell/env öncelikli)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const TEAMS: { name: string; sort_order: number }[] = [
  { name: "Yönetim", sort_order: 0 },
  { name: "Fullstack Development", sort_order: 1 },
  { name: "Frontend Development", sort_order: 2 },
  { name: "Mobile Development", sort_order: 3 },
  { name: "Ürün & Tasarım", sort_order: 4 },
  { name: "Operasyon & Pazarlama", sort_order: 5 },
  { name: "Stajyerler", sort_order: 6 },
];

type TeamKey = "Yönetim" | "Fullstack" | "Frontend" | "Mobile" | "Ürün" | "Operasyon" | "Stajyerler";

const MEMBERS: { name: string; role: string; team: TeamKey; sort_order: number }[] = [
  { name: "Murat Ödemiş", role: "CEO", team: "Yönetim", sort_order: 0 },
  { name: "Furkan Erkorkmaz", role: "Chief Studio Officer", team: "Yönetim", sort_order: 1 },
  { name: "Yunus Gülcü", role: "CTO", team: "Yönetim", sort_order: 2 },
  { name: "Ayhan Aksoy", role: "Sr. Fullstack Developer", team: "Fullstack", sort_order: 0 },
  { name: "Bilal Gümüş", role: "Sr. Fullstack Developer", team: "Fullstack", sort_order: 1 },
  { name: "Barış Can Hasar", role: "Sr. Fullstack Developer", team: "Fullstack", sort_order: 2 },
  { name: "Gökberk Sarı", role: "Jr. Fullstack Developer", team: "Fullstack", sort_order: 3 },
  { name: "Deniz Erişen", role: "Sr. Frontend Developer", team: "Frontend", sort_order: 0 },
  { name: "Ozan İşgör", role: "Sr. Frontend Developer", team: "Frontend", sort_order: 1 },
  { name: "Barış Topal", role: "Head of Studio, Sr. Android Developer", team: "Mobile", sort_order: 0 },
  { name: "Oğuzhan Aslan", role: "Sr. Android Developer", team: "Mobile", sort_order: 1 },
  { name: "Hakan Işık", role: "Mid. Mobile Developer", team: "Mobile", sort_order: 2 },
  { name: "Sara Mboqe Koçak", role: "Sr. Product Manager", team: "Ürün", sort_order: 0 },
  { name: "Z. Özce Özbaşoğlu", role: "Mid. Product Manager", team: "Ürün", sort_order: 1 },
  { name: "Ezel Yalçın", role: "Sr. UI/UX Designer", team: "Ürün", sort_order: 2 },
  { name: "Meriç Ödemiş", role: "People & Culture Executive", team: "Operasyon", sort_order: 0 },
  { name: "Baran Barış Bal", role: "Business Ops Executive", team: "Operasyon", sort_order: 1 },
  { name: "Hakan Demirbilek", role: "Sr. Marketing Artist", team: "Operasyon", sort_order: 2 },
  { name: "Ceyda Oymak", role: "Development Intern", team: "Stajyerler", sort_order: 0 },
  { name: "Melisa Şener", role: "Development Intern", team: "Stajyerler", sort_order: 1 },
];

const TEAM_KEY_TO_NAME: Record<TeamKey, string> = {
  "Yönetim": "Yönetim",
  "Fullstack": "Fullstack Development",
  "Frontend": "Frontend Development",
  "Mobile": "Mobile Development",
  "Ürün": "Ürün & Tasarım",
  "Operasyon": "Operasyon & Pazarlama",
  "Stajyerler": "Stajyerler",
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY (veya ANON_KEY) gerekli. .env.local yüklü mü?");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const { data: existingTeams } = await supabase.from("teams").select("id");
  if (existingTeams && existingTeams.length > 0) {
    console.log("Supabase'de zaten", existingTeams.length, "takım var. Seed atlanıyor (tekrar eklemek için önce teams/members tablolarını temizleyin).");
    process.exit(0);
  }

  const { data: insertedTeams, error: teamsErr } = await supabase
    .from("teams")
    .insert(TEAMS)
    .select("id,name,sort_order");

  if (teamsErr) {
    console.error("Teams insert hatası:", teamsErr);
    process.exit(1);
  }

  const teamNameToId: Record<string, string> = {};
  for (const t of insertedTeams || []) {
    teamNameToId[t.name] = t.id;
  }

  const membersRows = MEMBERS.map((m) => {
    const teamName = TEAM_KEY_TO_NAME[m.team];
    const team_id = teamName ? teamNameToId[teamName] : null;
    if (!team_id) throw new Error(`Takım bulunamadı: ${m.team}`);
    return {
      name: m.name,
      role: m.role,
      team_id,
      sort_order: m.sort_order,
      avatar_url: null,
    };
  });

  const { error: membersErr } = await supabase.from("members").insert(membersRows);
  if (membersErr) {
    console.error("Members insert hatası:", membersErr);
    process.exit(1);
  }

  console.log("OK: %d takım, %d üye eklendi.", insertedTeams?.length ?? 0, membersRows.length);
}

main();
