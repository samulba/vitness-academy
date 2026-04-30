"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

/**
 * Markiert eine einzelne Notification als gelesen. Idempotent.
 * RLS sorgt dafuer, dass nur der Owner seine eigenen markieren kann.
 */
export async function notificationGelesen(id: string): Promise<void> {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", profile.id)
    .is("read_at", null);
  revalidatePath("/", "layout"); // betrifft NotificationBell-Counter ueberall
}

/**
 * Markiert alle ungelesenen Notifications des Users als gelesen.
 */
export async function alleNotificationsGelesen(): Promise<void> {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", profile.id)
    .is("read_at", null);
  revalidatePath("/", "layout");
}
