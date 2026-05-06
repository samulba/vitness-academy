"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, istAdmin } from "@/lib/auth";
import { reorderBulk, reorderSwap } from "@/lib/admin/reorder";

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

  const { data: neu, error: insError } = await supabase
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
    .maybeSingle();

  revalidatePath("/admin/quizze");
  if (insError || !neu?.id) {
    redirect("/admin/quizze?toast=error");
  }
  redirect(`/admin/quizze/${neu.id}?toast=created`);
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
  const { error: updError } = await supabase
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
  if (updError) {
    console.error("[quizAktualisieren]", updError);
    redirect(`/admin/quizze/${id}?toast=error`);
  }

  revalidatePath("/admin/quizze");
  revalidatePath(`/admin/quizze/${id}`);
  revalidatePath(`/quiz/${id}`);
  redirect(`/admin/quizze/${id}?toast=saved`);
}

export async function quizLoeschen(id: string): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("quizzes").delete().eq("id", id);
  if (error) {
    console.error("[quizLoeschen]", error);
    redirect(`/admin/quizze/${id}?toast=error`);
  }
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

  const { error: insError } = await supabase.from("quiz_questions").insert({
    quiz_id: quizId,
    prompt,
    question_type,
    sort_order,
  });
  if (insError) {
    console.error("[frageAnlegen]", insError);
  }

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
  const { error } = await supabase
    .from("quiz_questions")
    .update({ prompt, question_type })
    .eq("id", frageId);
  if (error) {
    console.error("[frageAktualisieren]", error);
  }

  revalidatePath(`/admin/quizze/${quizId}`);
  revalidatePath(`/quiz/${quizId}`);
}

export async function frageLoeschen(
  quizId: string,
  frageId: string,
): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("quiz_questions")
    .delete()
    .eq("id", frageId);
  if (error) {
    console.error("[frageLoeschen]", error);
  }
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

  const { error: insError } = await supabase.from("quiz_options").insert({
    question_id: frageId,
    label,
    is_correct,
    sort_order,
  });
  if (insError) {
    console.error("[optionAnlegen]", insError);
  }

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
  const { error } = await supabase
    .from("quiz_options")
    .update({ label, is_correct })
    .eq("id", optionId);
  if (error) {
    console.error("[optionAktualisieren]", error);
  }

  revalidatePath(`/admin/quizze/${quizId}`);
  revalidatePath(`/quiz/${quizId}`);
}

export async function optionLoeschen(
  quizId: string,
  optionId: string,
): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("quiz_options")
    .delete()
    .eq("id", optionId);
  if (error) {
    console.error("[optionLoeschen]", error);
  }
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

/**
 * Bulk-Reorder fuer Drag-and-Drop von Fragen + Optionen. Kein
 * revalidatePath -- lokaler Client-State zeigt schon korrekt.
 */
export async function frageReihenfolgeBulk(
  quizId: string,
  neueIds: string[],
): Promise<{ ok: boolean; message?: string }> {
  await ensureAdmin();
  return await reorderBulk({
    tabelle: "quiz_questions",
    ids: neueIds,
    scopeFeld: "quiz_id",
    scopeWert: quizId,
  });
}

export async function optionReihenfolgeBulk(
  frageId: string,
  neueIds: string[],
): Promise<{ ok: boolean; message?: string }> {
  await ensureAdmin();
  return await reorderBulk({
    tabelle: "quiz_options",
    ids: neueIds,
    scopeFeld: "question_id",
    scopeWert: frageId,
  });
}
