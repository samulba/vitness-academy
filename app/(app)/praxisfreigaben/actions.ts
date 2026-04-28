"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Mitarbeiter meldet eine Praxisaufgabe als "bereit zur Freigabe".
 * Setzt status='bereit' (insert oder update vorhandene Zeile).
 */
export async function praxisBereitMelden(
  taskId: string,
  formData: FormData,
): Promise<void> {
  const note = String(formData.get("note") ?? "").trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("user_practical_signoffs").upsert(
    {
      user_id: user.id,
      task_id: taskId,
      status: "bereit",
      user_note: note,
      submitted_at: new Date().toISOString(),
      reviewer_note: null,
      approved_by: null,
      approved_at: null,
    },
    { onConflict: "user_id,task_id" },
  );

  revalidatePath("/praxisfreigaben");
  revalidatePath("/dashboard");
  revalidatePath("/admin/praxisfreigaben");
}

/**
 * Mitarbeiter zieht eine "bereit"-Meldung zurueck (zurueck auf "offen").
 */
export async function praxisZurueckziehen(taskId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("user_practical_signoffs")
    .update({
      status: "offen",
      submitted_at: null,
    })
    .eq("user_id", user.id)
    .eq("task_id", taskId)
    .eq("status", "bereit");

  revalidatePath("/praxisfreigaben");
  revalidatePath("/admin/praxisfreigaben");
}
