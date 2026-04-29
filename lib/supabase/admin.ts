import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase-Client mit Service-Role-Key.
 * Hat alle RLS-Policies ueberbrueckt -- DARF NUR in Server-Actions
 * mit zusaetzlichem Auth-Check (z.B. requireRole admin) genutzt
 * werden.
 *
 * Voraussetzung: SUPABASE_SERVICE_ROLE_KEY in Env-Vars.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY oder NEXT_PUBLIC_SUPABASE_URL fehlt in Env-Vars.",
    );
  }
  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
