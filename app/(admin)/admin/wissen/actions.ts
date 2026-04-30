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

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// =========================================================
// Kategorien
// =========================================================
export async function kategorieAnlegen(formData: FormData): Promise<void> {
  await ensureAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || name);
  const description = String(formData.get("description") ?? "").trim() || null;

  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("knowledge_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((maxRow?.sort_order as number | undefined) ?? 0) + 1;

  await supabase.from("knowledge_categories").insert({
    name,
    slug,
    description,
    sort_order,
  });

  revalidatePath("/admin/wissen");
  revalidatePath("/wissen");
}

export async function kategorieAktualisieren(
  id: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || name);
  const description = String(formData.get("description") ?? "").trim() || null;

  const supabase = await createClient();
  await supabase
    .from("knowledge_categories")
    .update({ name, slug, description })
    .eq("id", id);

  revalidatePath("/admin/wissen");
  revalidatePath("/wissen");
}

export async function kategorieLoeschen(id: string): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  await supabase.from("knowledge_categories").delete().eq("id", id);
  revalidatePath("/admin/wissen");
  revalidatePath("/wissen");
}

// =========================================================
// Artikel
// =========================================================
export async function artikelAnlegen(formData: FormData): Promise<void> {
  const profile = await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || title);
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "");
  const status = String(formData.get("status") ?? "aktiv");
  const category_id =
    String(formData.get("category_id") ?? "").trim() || null;

  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("knowledge_articles")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((maxRow?.sort_order as number | undefined) ?? 0) + 1;

  const { data: neu } = await supabase
    .from("knowledge_articles")
    .insert({
      title,
      slug,
      summary,
      body,
      status,
      category_id,
      sort_order,
      created_by: profile.id,
    })
    .select("id")
    .single();

  revalidatePath("/admin/wissen");
  revalidatePath("/wissen");
  if (neu?.id) redirect(`/admin/wissen/${neu.id}?toast=created`);
}

export async function artikelAktualisieren(
  id: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || title);
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "");
  const status = String(formData.get("status") ?? "aktiv");
  const category_id =
    String(formData.get("category_id") ?? "").trim() || null;

  const supabase = await createClient();
  await supabase
    .from("knowledge_articles")
    .update({ title, slug, summary, body, status, category_id })
    .eq("id", id);

  revalidatePath("/admin/wissen");
  revalidatePath(`/admin/wissen/${id}`);
  revalidatePath("/wissen");
  revalidatePath(`/wissen/${slug}`);
  redirect(`/admin/wissen/${id}?toast=saved`);
}

export async function artikelLoeschen(id: string): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  await supabase.from("knowledge_articles").delete().eq("id", id);
  revalidatePath("/admin/wissen");
  revalidatePath("/wissen");
  redirect("/admin/wissen?toast=deleted");
}

export async function artikelReihenfolge(
  id: string,
  richtung: "hoch" | "runter",
): Promise<void> {
  await ensureAdmin();
  await reorderSwap({ tabelle: "knowledge_articles", id, richtung });
  revalidatePath("/admin/wissen");
  revalidatePath("/wissen");
}
