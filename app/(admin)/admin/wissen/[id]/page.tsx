import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      <Link
        href="/admin/wissen"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Wissensdatenbank
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {artikel.title}
          </h1>
        </div>
        <Button asChild variant="outline">
          <Link href={`/wissen/${artikel.slug}`}>
            <ExternalLink className="h-4 w-4" />
            Vorschau
          </Link>
        </Button>
      </header>

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

      <Card>
        <CardContent className="flex justify-end py-4">
          <LoeschenButton
            action={artikelLoeschen.bind(null, artikel.id)}
            label="Artikel löschen"
            bestaetigung="Artikel wirklich löschen? Mitarbeiter sehen ihn dann nicht mehr."
          />
        </CardContent>
      </Card>
    </div>
  );
}
