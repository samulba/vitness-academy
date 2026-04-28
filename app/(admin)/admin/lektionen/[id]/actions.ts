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

export async function lektionAktualisieren(
  lessonId: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  if (!title) return;

  const supabase = await createClient();
  await supabase
    .from("lessons")
    .update({ title, summary })
    .eq("id", lessonId);

  revalidatePath(`/admin/lektionen/${lessonId}`);
  revalidatePath(`/lektionen/${lessonId}`);
}

export async function lektionLoeschen(lessonId: string): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  const { data: l } = await supabase
    .from("lessons")
    .select("module_id")
    .eq("id", lessonId)
    .single();
  await supabase.from("lessons").delete().eq("id", lessonId);
  const modulId = l?.module_id as string | undefined;
  if (modulId) {
    revalidatePath(`/admin/module/${modulId}`);
    redirect(`/admin/module/${modulId}`);
  }
  redirect("/admin/lernpfade");
}

// =========================================================
// Inhalts-Blöcke
// =========================================================
type BlockTyp = "text" | "checkliste" | "video_url" | "hinweis";

function buildContent(typ: BlockTyp, formData: FormData): Record<string, unknown> {
  switch (typ) {
    case "text": {
      const markdown = String(formData.get("markdown") ?? "");
      return { markdown };
    }
    case "checkliste": {
      const raw = String(formData.get("items") ?? "");
      const items = raw
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      return { items };
    }
    case "video_url": {
      const url = String(formData.get("url") ?? "").trim();
      const title = String(formData.get("video_title") ?? "").trim() || "Video";
      return { url, title };
    }
    case "hinweis": {
      const variant =
        String(formData.get("variant") ?? "info") === "warnung"
          ? "warnung"
          : "info";
      const markdown = String(formData.get("markdown") ?? "");
      return { variant, markdown };
    }
  }
}

export async function blockAnlegen(
  lessonId: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const block_type = String(formData.get("block_type") ?? "text") as BlockTyp;
  if (!["text", "checkliste", "video_url", "hinweis"].includes(block_type))
    return;

  const content = buildContent(block_type, formData);

  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("lesson_content_blocks")
    .select("sort_order")
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((maxRow?.sort_order as number | undefined) ?? 0) + 1;

  await supabase.from("lesson_content_blocks").insert({
    lesson_id: lessonId,
    block_type,
    content,
    sort_order,
  });

  revalidatePath(`/admin/lektionen/${lessonId}`);
  revalidatePath(`/lektionen/${lessonId}`);
}

export async function blockAktualisieren(
  lessonId: string,
  blockId: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const block_type = String(formData.get("block_type") ?? "text") as BlockTyp;
  if (!["text", "checkliste", "video_url", "hinweis"].includes(block_type))
    return;
  const content = buildContent(block_type, formData);

  const supabase = await createClient();
  await supabase
    .from("lesson_content_blocks")
    .update({ block_type, content })
    .eq("id", blockId);

  revalidatePath(`/admin/lektionen/${lessonId}`);
  revalidatePath(`/lektionen/${lessonId}`);
}

export async function blockLoeschen(
  lessonId: string,
  blockId: string,
): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  await supabase.from("lesson_content_blocks").delete().eq("id", blockId);
  revalidatePath(`/admin/lektionen/${lessonId}`);
  revalidatePath(`/lektionen/${lessonId}`);
}

export async function blockReihenfolge(
  lessonId: string,
  blockId: string,
  richtung: "hoch" | "runter",
): Promise<void> {
  await ensureAdmin();
  await reorderSwap({
    tabelle: "lesson_content_blocks",
    id: blockId,
    richtung,
    scopeFeld: "lesson_id",
    scopeWert: lessonId,
  });
  revalidatePath(`/admin/lektionen/${lessonId}`);
  revalidatePath(`/lektionen/${lessonId}`);
}
