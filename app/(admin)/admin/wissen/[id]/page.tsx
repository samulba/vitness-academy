import { notFound } from "next/navigation";
import { VorschauButton } from "@/components/admin/VorschauButton";
import { PageHeader } from "@/components/ui/page-header";
import { ArtikelFormular } from "@/components/admin/ArtikelFormular";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { createClient } from "@/lib/supabase/server";
import { artikelAktualisieren, artikelLoeschen } from "../actions";

async function ladeKategorien() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("knowledge_categories")
    .select("id, name")
    .order("sort_order", { ascending: true });
  return (data ?? []) as { id: string; name: string }[];
}

async function ladeArtikel(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("knowledge_articles")
    .select("id, title, slug, summary, body, status, category_id")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export default async function ArtikelBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [artikel, kategorien] = await Promise.all([
    ladeArtikel(id),
    ladeKategorien(),
  ]);
  if (!artikel) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Handbuch", href: "/admin/wissen" },
          { label: artikel.title },
        ]}
        eyebrow="Artikel"
        title={artikel.title}
        description="Markdown-Body, Kategorie und Status pflegen."
        extras={<VorschauButton url={`/wissen/${artikel.slug}`} />}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">
            Inhalt
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Markdown unterstützt Headlines, Listen, Code-Blöcke, Links.
          </p>
        </div>
        <div className="p-5">
          <ArtikelFormular
            modus="bearbeiten"
            action={artikelAktualisieren.bind(null, artikel.id)}
            kategorien={kategorien}
            werte={{
              title: artikel.title,
              slug: artikel.slug,
              summary: artikel.summary,
              body: artikel.body,
              status: artikel.status,
              category_id: artikel.category_id,
            }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-destructive/25 bg-destructive/[0.03]">
        <div className="border-b border-destructive/20 px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight text-destructive">
            Artikel löschen
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Mitarbeiter sehen ihn dann nicht mehr.
          </p>
        </div>
        <div className="p-5">
          <LoeschenButton
            action={artikelLoeschen.bind(null, artikel.id)}
            label="Artikel endgültig löschen"
            bestaetigung="Artikel wirklich löschen? Mitarbeiter sehen ihn dann nicht mehr."
          />
        </div>
      </div>
    </div>
  );
}
