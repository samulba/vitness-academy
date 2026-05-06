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
  redirect(`/admin/lektionen/${lessonId}?toast=saved`);
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
    redirect(`/admin/module/${modulId}?toast=deleted`);
  }
  redirect("/admin/lernpfade?toast=deleted");
}

// =========================================================
// Inhalts-Blöcke
// =========================================================
type BlockTyp =
  | "text"
  | "checkliste"
  | "video_url"
  | "hinweis"
  | "aufdeck_karte"
  | "inline_quiz"
  | "akkordeon"
  | "sortieren"
  | "szenario"
  | "schritte";

const ERLAUBTE_TYPEN: BlockTyp[] = [
  "text",
  "checkliste",
  "video_url",
  "hinweis",
  "aufdeck_karte",
  "inline_quiz",
  "akkordeon",
  "sortieren",
  "szenario",
  "schritte",
];

function parseJsonField<T>(formData: FormData, name: string, fallback: T): T {
  const raw = String(formData.get(name) ?? "").trim();
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

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
    case "aufdeck_karte": {
      const frage = String(formData.get("frage") ?? "").trim();
      const antwort_markdown = String(formData.get("antwort_markdown") ?? "");
      return { frage, antwort_markdown };
    }
    case "inline_quiz": {
      const typQuiz =
        String(formData.get("quiz_typ") ?? "single") === "multiple"
          ? "multiple"
          : "single";
      const frage = String(formData.get("frage") ?? "").trim();
      const optionen = parseJsonField<
        { text: string; korrekt: boolean; erklaerung?: string }[]
      >(formData, "optionen_json", []);
      return { typ: typQuiz, frage, optionen };
    }
    case "akkordeon": {
      const einleitung = String(formData.get("einleitung") ?? "").trim() || null;
      const items = parseJsonField<{ frage: string; antwort_markdown: string }[]>(
        formData,
        "items_json",
        [],
      );
      return { einleitung, items };
    }
    case "sortieren": {
      const aufgabe = String(formData.get("aufgabe") ?? "").trim();
      const raw = String(formData.get("schritte_korrekt") ?? "");
      const schritte_korrekt = raw
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      return { aufgabe, schritte_korrekt };
    }
    case "szenario": {
      const situation_markdown = String(formData.get("situation_markdown") ?? "");
      const optionen = parseJsonField<
        { text: string; korrekt: boolean; feedback_markdown: string }[]
      >(formData, "szenario_optionen_json", []);
      return { situation_markdown, optionen };
    }
    case "schritte": {
      const titel = String(formData.get("schritte_titel") ?? "").trim();
      const schritte = parseJsonField<
        { titel: string; body_markdown: string; hinweis?: string | null }[]
      >(formData, "schritte_json", []);
      return { titel, schritte };
    }
  }
}

export async function blockAnlegen(
  lessonId: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const block_type = String(formData.get("block_type") ?? "text") as BlockTyp;
  if (!ERLAUBTE_TYPEN.includes(block_type)) return;

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
  if (!ERLAUBTE_TYPEN.includes(block_type)) return;
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

/**
 * Bulk-Reorder fuer Drag-and-Drop von Inhalts-Bloecken.
 * Kein revalidatePath -- siehe modulReihenfolgeBulk fuer Begruendung.
 */
export async function blockReihenfolgeBulk(
  lessonId: string,
  neueIds: string[],
): Promise<{ ok: boolean; message?: string }> {
  await ensureAdmin();
  return await reorderBulk({
    tabelle: "lesson_content_blocks",
    ids: neueIds,
    scopeFeld: "lesson_id",
    scopeWert: lessonId,
  });
}
