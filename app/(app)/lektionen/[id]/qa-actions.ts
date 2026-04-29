"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { istFuehrungskraftOderHoeher } from "@/lib/rollen";

export async function frageStellen(
  lessonId: string,
  formData: FormData,
): Promise<void> {
  const profile = await requireProfile();
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 5) return;
  if (body.length > 2000) return;

  const supabase = await createClient();
  await supabase.from("lesson_questions").insert({
    lesson_id: lessonId,
    asked_by: profile.id,
    body,
  });
  revalidatePath(`/lektionen/${lessonId}`);
}

export async function antwortGeben(
  lessonId: string,
  questionId: string,
  formData: FormData,
): Promise<void> {
  const profile = await requireProfile();
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 2) return;
  if (body.length > 4000) return;

  const supabase = await createClient();
  await supabase.from("lesson_answers").insert({
    question_id: questionId,
    answered_by: profile.id,
    body,
    is_official: istFuehrungskraftOderHoeher(profile.role),
  });
  revalidatePath(`/lektionen/${lessonId}`);
}

export async function frageLoeschen(
  lessonId: string,
  questionId: string,
): Promise<void> {
  await requireProfile();
  const supabase = await createClient();
  await supabase.from("lesson_questions").delete().eq("id", questionId);
  revalidatePath(`/lektionen/${lessonId}`);
}

export async function antwortLoeschen(
  lessonId: string,
  answerId: string,
): Promise<void> {
  await requireProfile();
  const supabase = await createClient();
  await supabase.from("lesson_answers").delete().eq("id", answerId);
  revalidatePath(`/lektionen/${lessonId}`);
}

export async function frageAlsGeloestMarkieren(
  lessonId: string,
  questionId: string,
  resolved: boolean,
): Promise<void> {
  await requireProfile();
  const supabase = await createClient();
  await supabase
    .from("lesson_questions")
    .update({ resolved })
    .eq("id", questionId);
  revalidatePath(`/lektionen/${lessonId}`);
}
