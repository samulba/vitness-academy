"use server";

import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export type SuchTreffer = {
  lernpfade: {
    id: string;
    title: string;
  }[];
  lektionen: {
    id: string;
    title: string;
    summary: string | null;
    path_title: string;
    module_title: string;
  }[];
  artikel: {
    id: string;
    title: string;
    slug: string;
    category_name: string | null;
    summary: string | null;
  }[];
};

const LEER: SuchTreffer = { lernpfade: [], lektionen: [], artikel: [] };

/**
 * Globale Suche ueber Lernpfade, Lektionen und Handbuch-Artikel.
 * Lernpfade/Lektionen werden auf die zugewiesenen Pfade des Users
 * eingeschraenkt. Artikel sind oeffentlich fuer alle eingeloggten User.
 */
export async function globaleSuche(query: string): Promise<SuchTreffer> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return LEER;

  const profile = await requireProfile();
  const supabase = await createClient();
  const wert = `%${trimmed}%`;

  // 1) Zugewiesene Lernpfad-IDs vorholen
  const { data: zuweisungen } = await supabase
    .from("user_learning_path_assignments")
    .select("learning_path_id")
    .eq("user_id", profile.id);
  const erlaubteIds = new Set(
    ((zuweisungen ?? []) as { learning_path_id: string }[]).map(
      (z) => z.learning_path_id,
    ),
  );

  // 2) Drei parallele Queries
  const [pfadeRes, lektionenRes, artikelRes] = await Promise.all([
    supabase
      .from("learning_paths")
      .select("id, title")
      .eq("status", "aktiv")
      .ilike("title", wert)
      .limit(5),
    supabase
      .from("lessons")
      .select(
        `id, title, summary,
         modules:module_id (
           id, title, learning_path_id,
           learning_paths:learning_path_id ( id, title )
         )`,
      )
      .or(`title.ilike.${wert},summary.ilike.${wert}`)
      .limit(15),
    supabase
      .from("knowledge_articles")
      .select(
        `id, title, slug, summary,
         knowledge_categories:category_id ( name )`,
      )
      .eq("status", "aktiv")
      .or(`title.ilike.${wert},summary.ilike.${wert},body.ilike.${wert}`)
      .limit(5),
  ]);

  // Lernpfade auf zugewiesene filtern
  const lernpfade = ((pfadeRes.data ?? []) as { id: string; title: string }[])
    .filter((p) => erlaubteIds.has(p.id))
    .slice(0, 5);

  // Lektionen auf zugewiesene Pfade filtern
  type LektionRoh = {
    id: string;
    title: string;
    summary: string | null;
    modules: {
      title: string;
      learning_path_id: string;
      learning_paths: { id: string; title: string } | null;
    } | null;
  };
  const lektionen = ((lektionenRes.data ?? []) as unknown as LektionRoh[])
    .filter((l) => l.modules && erlaubteIds.has(l.modules.learning_path_id))
    .slice(0, 5)
    .map((l) => ({
      id: l.id,
      title: l.title,
      summary: l.summary,
      module_title: l.modules?.title ?? "",
      path_title: l.modules?.learning_paths?.title ?? "",
    }));

  // Artikel
  type ArtikelRoh = {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    knowledge_categories: { name: string } | null;
  };
  const artikel = ((artikelRes.data ?? []) as unknown as ArtikelRoh[]).map(
    (a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      summary: a.summary,
      category_name: a.knowledge_categories?.name ?? null,
    }),
  );

  return { lernpfade, lektionen, artikel };
}
