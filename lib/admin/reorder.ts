import { createClient } from "@/lib/supabase/server";

/**
 * Tauscht die sort_order zweier Datensaetze in einer Tabelle.
 * Die Tabellen muessen ein numerisches Feld "sort_order" haben.
 *
 * Hinweis: keine echte Transaktion, aber idempotent genug für Admin-Reorder.
 */
export async function reorderSwap(opts: {
  tabelle:
    | "learning_paths"
    | "modules"
    | "lessons"
    | "lesson_content_blocks"
    | "knowledge_categories"
    | "knowledge_articles"
    | "practical_tasks"
    | "quiz_questions"
    | "quiz_options"
    | "quizzes";
  id: string;
  richtung: "hoch" | "runter";
  scopeFeld?:
    | "learning_path_id"
    | "module_id"
    | "lesson_id"
    | "category_id"
    | "quiz_id"
    | "question_id";
  scopeWert?: string | null;
}): Promise<void> {
  const supabase = await createClient();

  // Aktuellen Eintrag laden
  const { data: aktuell } = await supabase
    .from(opts.tabelle)
    .select("id, sort_order")
    .eq("id", opts.id)
    .single();
  if (!aktuell) return;

  const aktSort = aktuell.sort_order as number;

  let nachbarQuery = supabase
    .from(opts.tabelle)
    .select("id, sort_order")
    .order("sort_order", {
      ascending: opts.richtung === "runter",
    })
    .limit(1);

  if (opts.richtung === "hoch") {
    nachbarQuery = nachbarQuery.lt("sort_order", aktSort);
  } else {
    nachbarQuery = nachbarQuery.gt("sort_order", aktSort);
  }
  if (opts.scopeFeld && opts.scopeWert) {
    nachbarQuery = nachbarQuery.eq(opts.scopeFeld, opts.scopeWert);
  }

  const { data: nachbar } = await nachbarQuery.maybeSingle();
  if (!nachbar) return;

  const nachbarSort = nachbar.sort_order as number;
  const nachbarId = nachbar.id as string;

  // Tausch (nicht atomar, ok für MVP)
  await supabase
    .from(opts.tabelle)
    .update({ sort_order: -1 })
    .eq("id", opts.id);
  await supabase
    .from(opts.tabelle)
    .update({ sort_order: aktSort })
    .eq("id", nachbarId);
  await supabase
    .from(opts.tabelle)
    .update({ sort_order: nachbarSort })
    .eq("id", opts.id);
}
