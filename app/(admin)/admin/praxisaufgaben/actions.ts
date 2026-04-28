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

export async function aufgabeAnlegen(formData: FormData): Promise<void> {
  const profile = await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("practical_tasks")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((maxRow?.sort_order as number | undefined) ?? 0) + 1;

  const { data: neu } = await supabase
    .from("practical_tasks")
    .insert({
      title,
      description: nullbar(formData.get("description")),
      learning_path_id: nullbar(formData.get("learning_path_id")),
      module_id: nullbar(formData.get("module_id")),
      lesson_id: nullbar(formData.get("lesson_id")),
      status: String(formData.get("status") ?? "aktiv"),
      sort_order,
      created_by: profile.id,
    })
    .select("id")
    .single();

  revalidatePath("/admin/praxisaufgaben");
  revalidatePath("/praxisfreigaben");
  if (neu?.id) redirect(`/admin/praxisaufgaben/${neu.id}`);
}

export async function aufgabeAktualisieren(
  id: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();
  await supabase
    .from("practical_tasks")
    .update({
      title,
      description: nullbar(formData.get("description")),
      learning_path_id: nullbar(formData.get("learning_path_id")),
      module_id: nullbar(formData.get("module_id")),
      lesson_id: nullbar(formData.get("lesson_id")),
      status: String(formData.get("status") ?? "aktiv"),
    })
    .eq("id", id);

  revalidatePath("/admin/praxisaufgaben");
  revalidatePath(`/admin/praxisaufgaben/${id}`);
  revalidatePath("/praxisfreigaben");
}

export async function aufgabeLoeschen(id: string): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  await supabase.from("practical_tasks").delete().eq("id", id);
  revalidatePath("/admin/praxisaufgaben");
  revalidatePath("/praxisfreigaben");
  redirect("/admin/praxisaufgaben");
}

export async function aufgabeReihenfolge(
  id: string,
  richtung: "hoch" | "runter",
): Promise<void> {
  await ensureAdmin();
  await reorderSwap({ tabelle: "practical_tasks", id, richtung });
  revalidatePath("/admin/praxisaufgaben");
}
