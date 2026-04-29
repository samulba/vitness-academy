"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * Wird beim Oeffnen einer Lektion aufgerufen.
 * Setzt started_at beim ersten Mal, last_seen_at jedes Mal.
 * Status wird nur auf "in_bearbeitung" gesetzt, wenn die Lektion
 * noch nicht abgeschlossen ist.
 */
export async function lektionGesehen(lessonId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  const jetzt = new Date().toISOString();

  const { data: existing } = await supabase
    .from("user_lesson_progress")
    .select("id, status, started_at")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("user_lesson_progress").insert({
      user_id: user.id,
      lesson_id: lessonId,
      status: "in_bearbeitung",
      started_at: jetzt,
      last_seen_at: jetzt,
    });
  } else {
    await supabase
      .from("user_lesson_progress")
      .update({
        started_at: existing.started_at ?? jetzt,
        last_seen_at: jetzt,
        status:
          existing.status === "abgeschlossen"
            ? existing.status
            : "in_bearbeitung",
      })
      .eq("id", existing.id);
  }
}

export async function lektionAbschliessen(lessonId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  const jetzt = new Date().toISOString();
  await supabase.from("user_lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      status: "abgeschlossen",
      completed_at: jetzt,
      last_seen_at: jetzt,
    },
    { onConflict: "user_id,lesson_id" },
  );

  revalidatePath(`/lektionen/${lessonId}`);
  revalidatePath("/dashboard");
  revalidatePath("/lernpfade");
}

export async function lektionZurueckSetzen(lessonId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from("user_lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      status: "in_bearbeitung",
      completed_at: null,
    },
    { onConflict: "user_id,lesson_id" },
  );

  revalidatePath(`/lektionen/${lessonId}`);
  revalidatePath("/dashboard");
  revalidatePath("/lernpfade");
}
