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

export async function modulAktualisieren(
  modulId: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!title) {
    redirect(`/admin/module/${modulId}?toast=error`);
  }

  const supabase = await createClient();

  // Pfad-ID separat holen (für saubere Revalidierung). NICHT chained mit
  // dem Update -- das war fehleranfaellig wenn RLS den SELECT nach UPDATE
  // blockt: data wurde null und der TypeScript-Cast `data.learning_path_id`
  // crashte mit Cannot read properties of null.
  const { data: m } = await supabase
    .from("modules")
    .select("learning_path_id")
    .eq("id", modulId)
    .maybeSingle();

  const { error } = await supabase
    .from("modules")
    .update({ title, description })
    .eq("id", modulId);

  if (error) {
    console.error("[modulAktualisieren]", error);
    redirect(`/admin/module/${modulId}?toast=error`);
  }

  const pfadId = (m?.learning_path_id as string | null | undefined) ?? null;
  revalidatePath(`/admin/module/${modulId}`);
  if (pfadId) {
    revalidatePath(`/admin/lernpfade/${pfadId}`);
    revalidatePath(`/lernpfade/${pfadId}`);
  }
  redirect(`/admin/module/${modulId}?toast=saved`);
}

export async function modulLoeschen(modulId: string): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  const { data: m, error: leseError } = await supabase
    .from("modules")
    .select("learning_path_id")
    .eq("id", modulId)
    .maybeSingle();

  if (leseError || !m) {
    redirect("/admin/lernpfade?toast=error");
  }

  await supabase.from("modules").delete().eq("id", modulId);
  const pfadId = m.learning_path_id as string | null;
  if (pfadId) {
    revalidatePath(`/admin/lernpfade/${pfadId}`);
    revalidatePath(`/lernpfade/${pfadId}`);
    redirect(`/admin/lernpfade/${pfadId}?toast=deleted`);
  }
  redirect("/admin/lernpfade?toast=deleted");
}

export async function lektionAnlegen(
  modulId: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  if (!title) return;

  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("lessons")
    .select("sort_order")
    .eq("module_id", modulId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((maxRow?.sort_order as number | undefined) ?? 0) + 1;

  const { error } = await supabase.from("lessons").insert({
    module_id: modulId,
    title,
    summary,
    sort_order,
  });
  if (error) {
    console.error("[lektionAnlegen]", error);
  }

  revalidatePath(`/admin/module/${modulId}`);
}

export async function lektionAktualisieren(
  modulId: string,
  lessonId: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  if (!title) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({ title, summary })
    .eq("id", lessonId);
  if (error) {
    console.error("[lektionAktualisieren]", error);
  }
  revalidatePath(`/admin/module/${modulId}`);
}

export async function lektionLoeschen(
  modulId: string,
  lessonId: string,
): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) {
    console.error("[lektionLoeschen]", error);
  }
  revalidatePath(`/admin/module/${modulId}`);
}

export async function lektionReihenfolge(
  modulId: string,
  lessonId: string,
  richtung: "hoch" | "runter",
): Promise<void> {
  await ensureAdmin();
  await reorderSwap({
    tabelle: "lessons",
    id: lessonId,
    richtung,
    scopeFeld: "module_id",
    scopeWert: modulId,
  });
  revalidatePath(`/admin/module/${modulId}`);
}

/**
 * Bulk-Reorder für Drag-and-Drop. Kein revalidatePath -- lokaler
 * State im Client zeigt schon korrekt, DB-Persistierung im Hintergrund.
 */
export async function lektionReihenfolgeBulk(
  modulId: string,
  neueIds: string[],
): Promise<{ ok: boolean; message?: string }> {
  await ensureAdmin();
  return await reorderBulk({
    tabelle: "lessons",
    ids: neueIds,
    scopeFeld: "module_id",
    scopeWert: modulId,
  });
}
