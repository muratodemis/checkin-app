import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createServerClient as createSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * User-scoped client: uses anon key + user JWT from cookies.
 * RLS policies are enforced based on auth.uid().
 */
export async function createUserClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored when called from Server Components (read-only context)
          }
        },
      },
    }
  );
}

/**
 * Admin client: uses service role key, bypasses RLS.
 * Only for admin operations (team/member management, setup scripts).
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }
  return createClient(url, key);
}

/**
 * @deprecated Use createUserClient() or createAdminClient() instead.
 * Kept for backward compatibility during migration.
 */
export function createServerClient(): SupabaseClient {
  return createAdminClient();
}

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Missing Supabase environment variables");
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}
