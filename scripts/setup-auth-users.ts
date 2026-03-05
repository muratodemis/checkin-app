/**
 * Setup script: Creates Supabase Auth users for existing members,
 * links them via auth_user_id, and runs the RLS migration.
 *
 * Usage:
 *   npx tsx scripts/setup-auth-users.ts
 *
 * Required env vars (from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Before running:
 *   1. Run the SQL migration (supabase/migrations/20250304000000_auth_rls.sql)
 *      in Supabase SQL Editor first.
 *   2. Fill in the MEMBER_EMAILS map below with real emails for each member.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ─── FILL IN: member name → email mapping ───
// Each member needs a unique email for Supabase Auth login.
// Default password will be set to "checkin2026" — members should change it after first login.
const MEMBER_EMAILS: Record<string, string> = {
  // Yönetim
  "Murat Ödemiş": "murat@murat.org",
  "Furkan Erkorkmaz": "furkan@murat.org",
  "Yunus Gülcü": "yunus@murat.org",
  // Fullstack Development
  "Ayhan Aksoy": "ayhan@murat.org",
  "Bilal Gümüş": "bilal@murat.org",
  "Barış Can Hasar": "bariscan@murat.org",
  "Gökberk Sarı": "gokberk@murat.org",
  // Frontend Development
  "Deniz Erişen": "deniz@murat.org",
  "Ozan İşgör": "ozan@murat.org",
  // Mobile Development
  "Barış Topal": "baristopal@murat.org",
  "Oğuzhan Aslan": "oguzhan@murat.org",
  "Hakan Işık": "hakanisik@murat.org",
  // Ürün & Tasarım
  "Sara Mboqe Koçak": "sara@murat.org",
  "Z. Özce Özbaşoğlu": "ozce@murat.org",
  "Ezel Yalçın": "ezel@murat.org",
  // Operasyon & Pazarlama
  "Meriç Ödemiş": "meric@murat.org",
  "Baran Barış Bal": "baran@murat.org",
  "Hakan Demirbilek": "hakandemirbilek@murat.org",
  // Stajyerler
  "Ceyda Oymak": "ceyda@murat.org",
  "Melisa Şener": "melisa@murat.org",
};

const ADMIN_NAME = "Murat Ödemiş";
const DEFAULT_PASSWORD = "checkin2026";

async function main() {
  console.log("Fetching existing members...\n");

  const { data: members, error: fetchErr } = await supabase
    .from("members")
    .select("id, name, auth_user_id, email")
    .eq("is_active", true)
    .order("name");

  if (fetchErr) {
    console.error("Failed to fetch members:", fetchErr.message);
    process.exit(1);
  }

  if (!members?.length) {
    console.error("No active members found in the database.");
    process.exit(1);
  }

  console.log(`Found ${members.length} active members.\n`);

  const emptyEmails = Object.entries(MEMBER_EMAILS).filter(([, email]) => !email);
  if (emptyEmails.length > 0) {
    console.error("Please fill in emails for all members in the MEMBER_EMAILS map:");
    for (const [name] of emptyEmails) {
      console.error(`  "${name}": "<email>",`);
    }
    console.error("\nEdit scripts/setup-auth-users.ts and re-run.");
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const member of members) {
    const email = MEMBER_EMAILS[member.name];

    if (!email) {
      console.log(`⚠ No email mapping for "${member.name}" — skipping`);
      skipped++;
      continue;
    }

    if (member.auth_user_id) {
      console.log(`✓ ${member.name} already linked (auth_user_id: ${member.auth_user_id})`);
      skipped++;
      continue;
    }

    // Check if auth user with this email already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === email
    );

    let authUserId: string;

    if (existingUser) {
      console.log(`  Auth user exists for ${email}, reusing...`);
      authUserId = existingUser.id;
    } else {
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
      });

      if (createErr) {
        console.error(`✗ Failed to create auth user for ${member.name}: ${createErr.message}`);
        errors++;
        continue;
      }

      authUserId = newUser.user.id;
      console.log(`  Created auth user for ${member.name} (${email})`);
    }

    const isAdmin = member.name === ADMIN_NAME;

    const { error: updateErr } = await supabase
      .from("members")
      .update({
        auth_user_id: authUserId,
        email,
        is_admin: isAdmin,
      })
      .eq("id", member.id);

    if (updateErr) {
      console.error(`✗ Failed to link ${member.name}: ${updateErr.message}`);
      errors++;
      continue;
    }

    console.log(`✓ ${member.name} → ${email}${isAdmin ? " (ADMIN)" : ""}`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped, ${errors} errors`);
  console.log(`\nDefault password for all new users: ${DEFAULT_PASSWORD}`);
  console.log("Members should change their password after first login.");
}

main().catch(console.error);
