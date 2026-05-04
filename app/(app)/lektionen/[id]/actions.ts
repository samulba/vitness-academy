"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { zertifikatErzeugenWennFertig } from "@/lib/zertifikat";

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

  const { data: existing, error: leseError } = await supabase
    .from("user_lesson_progress")
    .select("id, status, started_at")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (leseError) {
    console.error("[lektionGesehen] Lese-Fehler:", leseError.message);
    return;
  }

  if (!existing) {
    const { error } = await supabase.from("user_lesson_progress").insert({
      user_id: user.id,
      lesson_id: lessonId,
      status: "in_bearbeitung",
      started_at: jetzt,
      last_seen_at: jetzt,
    });
    if (error) {
      console.error("[lektionGesehen] Insert-Fehler:", error.message);
    }
  } else {
    const { error } = await supabase
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
    if (error) {
      console.error("[lektionGesehen] Update-Fehler:", error.message);
    }
  }
}

export async function lektionAbschliessen(lessonId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  const jetzt = new Date().toISOString();
  const { error: upsertError } = await supabase
    .from("user_lesson_progress")
    .upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        status: "abgeschlossen",
        completed_at: jetzt,
        last_seen_at: jetzt,
      },
      { onConflict: "user_id,lesson_id" },
    );

  if (upsertError) {
    console.error("[lektionAbschliessen] Upsert-Fehler:", upsertError.message);
    return;
  }

  // Wenn diese Lektion den Pfad komplettiert, Zertifikat erzeugen
  const { data: lesson, error: leseError } = await supabase
    .from("lessons")
    .select("modules:module_id ( learning_path_id )")
    .eq("id", lessonId)
    .maybeSingle();
  if (leseError) {
    console.error("[lektionAbschliessen] Lesson-Lookup-Fehler:", leseError.message);
  }
  const pfadId = (lesson as unknown as {
    modules: { learning_path_id: string } | null;
  } | null)?.modules?.learning_path_id;
  if (pfadId) {
    await zertifikatErzeugenWennFertig(user.id, pfadId);
  }

  revalidatePath(`/lektionen/${lessonId}`);
  revalidatePath("/dashboard");
  revalidatePath("/lernpfade");
  if (pfadId) revalidatePath(`/lernpfade/${pfadId}`);
}

export async function lektionZurueckSetzen(lessonId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  const { error } = await supabase.from("user_lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      status: "in_bearbeitung",
      completed_at: null,
    },
    { onConflict: "user_id,lesson_id" },
  );

  if (error) {
    console.error("[lektionZurueckSetzen] Upsert-Fehler:", error.message);
    return;
  }

  revalidatePath(`/lektionen/${lessonId}`);
  revalidatePath("/dashboard");
  revalidatePath("/lernpfade");
}
