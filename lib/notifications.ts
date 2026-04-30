import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/notifications-types";

// Re-export der Types fuer Server-Code-Convenience
export type { Notification, NotificationType } from "@/lib/notifications-types";

/**
 * Laedt die letzten N Notifications des aktuellen Users.
 * Sortiert: ungelesene zuerst (created_at desc), dann gelesene.
 */
export async function ladeNotifications(
  userId: string,
  limit = 30,
): Promise<Notification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, user_id, type, title, body, link, read_at, created_at")
    .eq("user_id", userId)
    .order("read_at", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Notification[];
}

/** Anzahl ungelesener Notifications des Users. */
export async function ungeleseneAnzahl(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);
  return count ?? 0;
}
