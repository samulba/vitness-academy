import { createClient } from "@/lib/supabase/server";

export type Kategorie = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  artikel_anzahl: number;
};

export type Artikel = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  updated_at: string;
};

export type ArtikelKurz = Omit<Artikel, "body">;

/**
 * Alle Kategorien inkl. Anzahl aktiver Artikel.
 */
export async function ladeKategorien(): Promise<Kategorie[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("knowledge_categories")
    .select(
      `id, name, slug, description, sort_order,
       knowledge_articles ( id, status )`,
    )
    .order("sort_order", { ascending: true });

  type Roh = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    knowledge_articles: { id: string; status: string }[] | null;
  };

  return ((data ?? []) as unknown as Roh[]).map((k) => ({
    id: k.id,
    name: k.name,
    slug: k.slug,
    description: k.description,
    artikel_anzahl: (k.knowledge_articles ?? []).filter(
      (a) => a.status === "aktiv",
    ).length,
  }));
}

/**
 * Aktive Artikel, optional gefiltert nach Suche oder Kategorie-Slug.
 */
export async function ladeArtikel(opts: {
  query?: string;
  kategorieSlug?: string;
}): Promise<ArtikelKurz[]> {
  const supabase = await createClient();
  let q = supabase
    .from("knowledge_articles")
    .select(
      `id, title, slug, summary, category_id, updated_at,
       knowledge_categories:category_id ( name, slug )`,
    )
    .eq("status", "aktiv")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (opts.kategorieSlug) {
    q = q.eq("knowledge_categories.slug", opts.kategorieSlug);
  }

  if (opts.query && opts.query.trim().length > 0) {
    const wert = `%${opts.query.trim()}%`;
    q = q.or(`title.ilike.${wert},summary.ilike.${wert},body.ilike.${wert}`);
  }

  const { data } = await q;

  type Roh = {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    category_id: string | null;
    updated_at: string;
    knowledge_categories: { name: string; slug: string } | null;
  };

  let zeilen = ((data ?? []) as unknown as Roh[]).map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    summary: a.summary,
    category_id: a.category_id,
    category_name: a.knowledge_categories?.name ?? null,
    category_slug: a.knowledge_categories?.slug ?? null,
    updated_at: a.updated_at,
  }));

  // Wenn ein kategorieSlug gesetzt ist, ueber die Beziehung filtern
  if (opts.kategorieSlug) {
    zeilen = zeilen.filter((z) => z.category_slug === opts.kategorieSlug);
  }

  return zeilen;
}

export async function ladeArtikelDetail(slug: string): Promise<Artikel | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("knowledge_articles")
    .select(
      `id, title, slug, summary, body, category_id, updated_at,
       knowledge_categories:category_id ( name, slug )`,
    )
    .eq("slug", slug)
    .eq("status", "aktiv")
    .maybeSingle();

  if (!data) return null;

  type Roh = {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    body: string;
    category_id: string | null;
    updated_at: string;
    knowledge_categories: { name: string; slug: string } | null;
  };

  const r = data as unknown as Roh;
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    summary: r.summary,
    body: r.body,
    category_id: r.category_id,
    category_name: r.knowledge_categories?.name ?? null,
    category_slug: r.knowledge_categories?.slug ?? null,
    updated_at: r.updated_at,
  };
}
