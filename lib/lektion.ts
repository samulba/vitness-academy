import { createClient } from "@/lib/supabase/server";
import type { LektionStatus } from "@/lib/lernpfade";

/**
 * Markiert eine Lektion als "gesehen" -- setzt started_at beim
 * ersten Mal, last_seen_at jedes Mal. Wird aus der Server-Component
 * der Lektions-Seite direkt aufgerufen (idempotent, keine
 * revalidate-Kette).
 */
export async function lektionAlsGesehenMarkieren(
  userId: string,
  lessonId: string,
): Promise<void> {
  const supabase = await createClient();
  const jetzt = new Date().toISOString();

  const { data: existing } = await supabase
    .from("user_lesson_progress")
    .select("id, status, started_at")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("user_lesson_progress").insert({
      user_id: userId,
      lesson_id: lessonId,
      status: "in_bearbeitung",
      started_at: jetzt,
      last_seen_at: jetzt,
    });
  } else {
    await supabase
      .from("user_lesson_progress")
      .update({
        started_at: existing.started_at ?? jetzt,
        last_seen_at: jetzt,
        status:
          existing.status === "abgeschlossen"
            ? existing.status
            : "in_bearbeitung",
      })
      .eq("id", existing.id);
  }
}

/**
 * Aktivitaets-Stats fuer das Mitarbeiter-Dashboard.
 * Zaehlt die Anzahl distinkter Tage in den letzten 30 Tagen,
 * an denen mindestens eine Lektion gesehen oder abgeschlossen
 * wurde.
 */
export async function aktivitaetsStats(userId: string): Promise<{
  tageLetzte30: number;
  letzteAktivitaet: string | null;
}> {
  const supabase = await createClient();
  const vor30Tagen = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const { data } = await supabase
    .from("user_lesson_progress")
    .select("last_seen_at")
    .eq("user_id", userId)
    .gte("last_seen_at", vor30Tagen.toISOString())
    .order("last_seen_at", { ascending: false });

  const rows = (data ?? []) as { last_seen_at: string | null }[];
  const tage = new Set<string>();
  for (const r of rows) {
    if (r.last_seen_at) tage.add(r.last_seen_at.slice(0, 10));
  }
  return {
    tageLetzte30: tage.size,
    letzteAktivitaet: rows[0]?.last_seen_at ?? null,
  };
}

export type ContentBlockTyp =
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

export type TextBlockContent = { markdown: string };
export type ChecklisteBlockContent = { items: string[] };
export type VideoUrlBlockContent = { url: string; title?: string };
export type HinweisBlockContent = {
  variant: "info" | "warnung";
  markdown: string;
};

export type AufdeckKarteContent = {
  frage: string;
  antwort_markdown: string;
};

export type InlineQuizOption = {
  text: string;
  korrekt: boolean;
  erklaerung?: string;
};
export type InlineQuizContent = {
  typ: "single" | "multiple";
  frage: string;
  optionen: InlineQuizOption[];
};

export type AkkordeonItem = {
  frage: string;
  antwort_markdown: string;
};
export type AkkordeonContent = {
  einleitung?: string | null;
  items: AkkordeonItem[];
};

export type SortierenContent = {
  aufgabe: string;
  schritte_korrekt: string[];
};

export type SzenarioOption = {
  text: string;
  korrekt: boolean;
  feedback_markdown: string;
};
export type SzenarioContent = {
  situation_markdown: string;
  optionen: SzenarioOption[];
};

export type SchrittItem = {
  titel: string;
  body_markdown: string;
  hinweis?: string | null;
};
export type SchritteContent = {
  titel: string;
  schritte: SchrittItem[];
};

export type ContentBlock = {
  id: string;
  block_type: ContentBlockTyp;
  content: Record<string, unknown>;
  sort_order: number;
};

export type LektionDetail = {
  id: string;
  title: string;
  summary: string | null;
  module_id: string;
  module_title: string;
  module_sort_order: number;
  path_id: string;
  path_title: string;
  blocks: ContentBlock[];
  status: LektionStatus;
  vorherige: { id: string; title: string } | null;
  naechste: { id: string; title: string } | null;
};

export async function ladeLektionFuerUser(
  userId: string,
  lessonId: string,
): Promise<LektionDetail | null> {
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      `id, title, summary, module_id, sort_order,
       modules:module_id ( id, title, sort_order, learning_path_id,
         learning_paths:learning_path_id ( id, title )
       ),
       lesson_content_blocks ( id, block_type, content, sort_order )`,
    )
    .eq("id", lessonId)
    .single();

  if (!lesson) return null;

  const modulRaw = lesson.modules as unknown as
    | {
        id: string;
        title: string;
        sort_order: number;
        learning_path_id: string;
        learning_paths: { id: string; title: string } | null;
      }
    | null;

  if (!modulRaw) return null;

  // Fortschritt
  const { data: progressRow } = await supabase
    .from("user_lesson_progress")
    .select("status")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  const status = (progressRow?.status as LektionStatus | undefined) ??
    "nicht_gestartet";

  // Vorherige/Naechste Lektion innerhalb des gleichen Lernpfads
  const { data: gesch } = await supabase
    .from("lessons")
    .select(
      `id, title, sort_order,
       modules!inner ( learning_path_id, sort_order )`,
    )
    .eq("modules.learning_path_id", modulRaw.learning_path_id);

  const sortable = (gesch ?? [])
    .map((row) => {
      const modules = row.modules as unknown as { sort_order: number };
      return {
        id: row.id as string,
        title: row.title as string,
        moduleSort: modules.sort_order,
        lessonSort: row.sort_order as number,
      };
    })
    .sort((a, b) =>
      a.moduleSort !== b.moduleSort
        ? a.moduleSort - b.moduleSort
        : a.lessonSort - b.lessonSort,
    );

  const idx = sortable.findIndex((l) => l.id === lessonId);
  const vorherige = idx > 0 ? sortable[idx - 1] : null;
  const naechste = idx >= 0 && idx < sortable.length - 1 ? sortable[idx + 1] : null;

  const blocks = ((lesson.lesson_content_blocks ?? []) as ContentBlock[])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  return {
    id: lesson.id as string,
    title: lesson.title as string,
    summary: lesson.summary as string | null,
    module_id: modulRaw.id,
    module_title: modulRaw.title,
    module_sort_order: modulRaw.sort_order,
    path_id: modulRaw.learning_paths?.id ?? modulRaw.learning_path_id,
    path_title: modulRaw.learning_paths?.title ?? "",
    blocks,
    status,
    vorherige: vorherige ? { id: vorherige.id, title: vorherige.title } : null,
    naechste: naechste ? { id: naechste.id, title: naechste.title } : null,
  };
}
