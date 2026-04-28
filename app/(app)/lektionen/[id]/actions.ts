"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function lektionAbschliessen(lessonId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from("user_lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      status: "abgeschlossen",
      completed_at: new Date().toISOString(),
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
