"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, istAdmin } from "@/lib/auth";
import { reorderBulk, reorderSwap } from "@/lib/admin/reorder";

async function ensureAdmin() {
  const p = await getCurrentProfile();
  if (!p || !istAdmin(p.role)) {
    throw new Error("Nicht autorisiert");
  }
  return p;
}

// =========================================================
// Lernpfad CRUD
// =========================================================
export async function lernpfadAnlegen(formData: FormData): Promise<void> {
  const profile = await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "aktiv");
  if (!title) return;

  const supabase = await createClient();

  // sort_order ans Ende
  const { data: maxRow } = await supabase
    .from("learning_paths")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((maxRow?.sort_order as number | undefined) ?? 0) + 1;

  const { data: neu } = await supabase
    .from("learning_paths")
    .insert({
      title,
      description,
      status,
      sort_order,
      created_by: profile.id,
    })
    .select("id")
    .single();

  revalidatePath("/admin/lernpfade");
  if (neu?.id) redirect(`/admin/lernpfade/${neu.id}?toast=created`);
}

export async function lernpfadAktualisieren(
  id: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "aktiv");
  if (!title) return;

  const supabase = await createClient();
  await supabase
    .from("learning_paths")
    .update({ title, description, status })
    .eq("id", id);

  revalidatePath("/admin/lernpfade");
  revalidatePath(`/admin/lernpfade/${id}`);
  revalidatePath(`/lernpfade/${id}`);
  revalidatePath("/lernpfade");
  redirect(`/admin/lernpfade/${id}?toast=saved`);
}

export async function lernpfadLoeschen(id: string): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  await supabase.from("learning_paths").delete().eq("id", id);

  revalidatePath("/admin/lernpfade");
  revalidatePath("/lernpfade");
  redirect("/admin/lernpfade?toast=deleted");
}

export async function lernpfadReihenfolge(
  id: string,
  richtung: "hoch" | "runter",
): Promise<void> {
  await ensureAdmin();
  await reorderSwap({ tabelle: "learning_paths", id, richtung });
  revalidatePath("/admin/lernpfade");
  revalidatePath("/lernpfade");
}

// =========================================================
// Modul CRUD
// =========================================================
export async function modulAnlegen(
  pfadId: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!title) return;

  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("modules")
    .select("sort_order")
    .eq("learning_path_id", pfadId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((maxRow?.sort_order as number | undefined) ?? 0) + 1;

  await supabase.from("modules").insert({
    learning_path_id: pfadId,
    title,
    description,
    sort_order,
  });

  revalidatePath(`/admin/lernpfade/${pfadId}`);
  revalidatePath(`/lernpfade/${pfadId}`);
}

export async function modulAktualisieren(
  pfadId: string,
  modulId: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!title) return;

  const supabase = await createClient();
  await supabase
    .from("modules")
    .update({ title, description })
    .eq("id", modulId);

  revalidatePath(`/admin/lernpfade/${pfadId}`);
  revalidatePath(`/lernpfade/${pfadId}`);
}

export async function modulLoeschen(
  pfadId: string,
  modulId: string,
): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  await supabase.from("modules").delete().eq("id", modulId);
  revalidatePath(`/admin/lernpfade/${pfadId}`);
  revalidatePath(`/lernpfade/${pfadId}`);
}

export async function modulReihenfolge(
  pfadId: string,
  modulId: string,
  richtung: "hoch" | "runter",
): Promise<void> {
  await ensureAdmin();
  await reorderSwap({
    tabelle: "modules",
    id: modulId,
    richtung,
    scopeFeld: "learning_path_id",
    scopeWert: pfadId,
  });
  revalidatePath(`/admin/lernpfade/${pfadId}`);
  revalidatePath(`/lernpfade/${pfadId}`);
}

/**
 * Bulk-Reorder fuer Drag-and-Drop. Bekommt die NEUE Reihenfolge der
 * Module-IDs und setzt sort_order entsprechend (10er-Schritte).
 */
export async function modulReihenfolgeBulk(
  pfadId: string,
  neueIds: string[],
): Promise<{ ok: boolean; message?: string }> {
  await ensureAdmin();
  const res = await reorderBulk({
    tabelle: "modules",
    ids: neueIds,
    scopeFeld: "learning_path_id",
    scopeWert: pfadId,
  });
  revalidatePath(`/admin/lernpfade/${pfadId}`);
  revalidatePath(`/lernpfade/${pfadId}`);
  return res;
}
