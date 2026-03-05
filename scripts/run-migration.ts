/**
 * Runs the RLS migration SQL against Supabase.
 * Uses @supabase/supabase-js with service role key to execute SQL
 * by creating a temporary helper function.
 *
 * Usage: npx tsx scripts/run-migration.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";

config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log("Testing connection...");
  
  // Test basic connectivity
  const { data: testData, error: testError } = await supabase
    .from("members")
    .select("id, name")
    .limit(3);

  if (testError) {
    console.error("Connection test failed:", testError.message);
    process.exit(1);
  }

  console.log(`Connection OK. Found ${testData?.length ?? 0} members (sample).`);

  // Check if auth_user_id column already exists
  const { data: columns, error: colError } = await supabase
    .from("members")
    .select("*")
    .limit(1);

  if (colError) {
    console.error("Failed to query members:", colError.message);
    process.exit(1);
  }

  const sample = columns?.[0];
  if (sample && "auth_user_id" in sample) {
    console.log("\n⚠ auth_user_id column already exists on members table.");
    console.log("Migration may have already been applied. Checking RLS...\n");
  }

  // Read migration SQL
  const migrationPath = resolve(__dirname, "../supabase/migrations/20250304000000_auth_rls.sql");
  const fullSQL = readFileSync(migrationPath, "utf-8");

  // Split into executable statements
  const statements = splitSQL(fullSQL);
  console.log(`\nParsed ${statements.length} SQL statements.\n`);

  // Try executing via Supabase SQL endpoint (undocumented)
  let success = 0;
  let errors = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;

    const label = stmt.replace(/\s+/g, " ").slice(0, 80);
    
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ sql_text: stmt }),
      });

      if (res.ok) {
        console.log(`  ✓ [${i + 1}] ${label}`);
        success++;
      } else {
        const body = await res.text();
        console.error(`  ✗ [${i + 1}] ${label}`);
        console.error(`     ${body.slice(0, 150)}`);
        errors++;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ [${i + 1}] ${msg.slice(0, 100)}`);
      errors++;
    }
  }

  console.log(`\nResults: ${success} succeeded, ${errors} failed`);
  
  if (errors > 0) {
    console.log("\n--- MANUAL STEPS NEEDED ---");
    console.log("The migration SQL could not be fully executed via API.");
    console.log("Please run the SQL manually in Supabase Dashboard → SQL Editor:");
    console.log(`  File: supabase/migrations/20250304000000_auth_rls.sql`);
    console.log("\nOr provide the database password so I can use psql.");
  }
}

function splitSQL(sql: string): string[] {
  const results: string[] = [];
  let current = "";
  let inDollarQuote = false;

  const lines = sql.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("--")) continue;
    if (!trimmed) continue;

    current += line + "\n";

    if (trimmed.includes("$$")) {
      const count = (trimmed.match(/\$\$/g) || []).length;
      if (count === 1) {
        inDollarQuote = !inDollarQuote;
      }
    }

    if (!inDollarQuote && trimmed.endsWith(";")) {
      results.push(current.trim());
      current = "";
    }
  }

  if (current.trim()) {
    results.push(current.trim());
  }

  return results;
}

main().catch(console.error);
