"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, istAdmin } from "@/lib/auth";
import { reorderSwap } from "@/lib/admin/reorder";

async function ensureAdmin() {
  const p = await getCurrentProfile();
  if (!p || !istAdmin(p.role)) throw new Error("Nicht autorisiert");
  return p;
}

function nullbar(s: FormDataEntryValue | null): string | null {
  const t = String(s ?? "").trim();
  return t.length > 0 ? t : null;
}

// =========================================================
// Quiz CRUD
// =========================================================
export async function quizAnlegen(formData: FormData): Promise<void> {
  const profile = await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const passing_score = Number(formData.get("passing_score") ?? 80);
  const lesson_id = nullbar(formData.get("lesson_id"));
  const module_id = nullbar(formData.get("module_id"));
  // Genau eine Bindung erforderlich
  if (!lesson_id && !module_id) return;
  if (lesson_id && module_id) return;

  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("quizzes")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((maxRow?.sort_order as number | undefined) ?? 0) + 1;

  const { data: neu } = await supabase
    .from("quizzes")
    .insert({
      title,
      description: nullbar(formData.get("description")),
      passing_score: Math.min(100, Math.max(0, passing_score)),
      lesson_id,
      module_id,
      status: String(formData.get("status") ?? "aktiv"),
      sort_order,
      created_by: profile.id,
    })
    .select("id")
    .single();

  revalidatePath("/admin/quizze");
  if (neu?.id) redirect(`/admin/quizze/${neu.id}?toast=created`);
}

export async function quizAktualisieren(
  id: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const passing_score = Number(formData.get("passing_score") ?? 80);
  const lesson_id = nullbar(formData.get("lesson_id"));
  const module_id = nullbar(formData.get("module_id"));
  if (!lesson_id && !module_id) return;
  if (lesson_id && module_id) return;

  const supabase = await createClient();
  await supabase
    .from("quizzes")
    .update({
      title,
      description: nullbar(formData.get("description")),
      passing_score: Math.min(100, Math.max(0, passing_score)),
      lesson_id,
      module_id,
      status: String(formData.get("status") ?? "aktiv"),
    })
    .eq("id", id);

  revalidatePath("/admin/quizze");
  revalidatePath(`/admin/quizze/${id}`);
  revalidatePath(`/quiz/${id}`);
  redirect(`/admin/quizze/${id}?toast=saved`);
}

export async function quizLoeschen(id: string): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  await supabase.from("quizzes").delete().eq("id", id);
  revalidatePath("/admin/quizze");
  redirect("/admin/quizze?toast=deleted");
}

// =========================================================
// Frage CRUD
// =========================================================
export async function frageAnlegen(
  quizId: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const prompt = String(formData.get("prompt") ?? "").trim();
  if (!prompt) return;
  const question_type =
    String(formData.get("question_type") ?? "single") === "multiple"
      ? "multiple"
      : "single";

  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("quiz_questions")
    .select("sort_order")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((maxRow?.sort_order as number | undefined) ?? 0) + 1;

  await supabase.from("quiz_questions").insert({
    quiz_id: quizId,
    prompt,
    question_type,
    sort_order,
  });

  revalidatePath(`/admin/quizze/${quizId}`);
  revalidatePath(`/quiz/${quizId}`);
}

export async function frageAktualisieren(
  quizId: string,
  frageId: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const prompt = String(formData.get("prompt") ?? "").trim();
  if (!prompt) return;
  const question_type =
    String(formData.get("question_type") ?? "single") === "multiple"
      ? "multiple"
      : "single";

  const supabase = await createClient();
  await supabase
    .from("quiz_questions")
    .update({ prompt, question_type })
    .eq("id", frageId);

  revalidatePath(`/admin/quizze/${quizId}`);
  revalidatePath(`/quiz/${quizId}`);
}

export async function frageLoeschen(
  quizId: string,
  frageId: string,
): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  await supabase.from("quiz_questions").delete().eq("id", frageId);
  revalidatePath(`/admin/quizze/${quizId}`);
  revalidatePath(`/quiz/${quizId}`);
}

export async function frageReihenfolge(
  quizId: string,
  frageId: string,
  richtung: "hoch" | "runter",
): Promise<void> {
  await ensureAdmin();
  await reorderSwap({
    tabelle: "quiz_questions",
    id: frageId,
    richtung,
    scopeFeld: "quiz_id",
    scopeWert: quizId,
  });
  revalidatePath(`/admin/quizze/${quizId}`);
  revalidatePath(`/quiz/${quizId}`);
}

// =========================================================
// Option CRUD
// =========================================================
export async function optionAnlegen(
  quizId: string,
  frageId: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const is_correct = formData.get("is_correct") === "on";

  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("quiz_options")
    .select("sort_order")
    .eq("question_id", frageId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((maxRow?.sort_order as number | undefined) ?? 0) + 1;

  await supabase.from("quiz_options").insert({
    question_id: frageId,
    label,
    is_correct,
    sort_order,
  });

  revalidatePath(`/admin/quizze/${quizId}`);
  revalidatePath(`/quiz/${quizId}`);
}

export async function optionAktualisieren(
  quizId: string,
  optionId: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const is_correct = formData.get("is_correct") === "on";

  const supabase = await createClient();
  await supabase
    .from("quiz_options")
    .update({ label, is_correct })
    .eq("id", optionId);

  revalidatePath(`/admin/quizze/${quizId}`);
  revalidatePath(`/quiz/${quizId}`);
}

export async function optionLoeschen(
  quizId: string,
  optionId: string,
): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  await supabase.from("quiz_options").delete().eq("id", optionId);
  revalidatePath(`/admin/quizze/${quizId}`);
  revalidatePath(`/quiz/${quizId}`);
}

export async function optionReihenfolge(
  quizId: string,
  frageId: string,
  optionId: string,
  richtung: "hoch" | "runter",
): Promise<void> {
  await ensureAdmin();
  await reorderSwap({
    tabelle: "quiz_options",
    id: optionId,
    richtung,
    scopeFeld: "question_id",
    scopeWert: frageId,
  });
  revalidatePath(`/admin/quizze/${quizId}`);
  revalidatePath(`/quiz/${quizId}`);
}
