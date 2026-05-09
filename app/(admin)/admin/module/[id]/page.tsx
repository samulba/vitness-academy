import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { SpeichernButton } from "@/components/admin/SpeichernButton";
import { createClient } from "@/lib/supabase/server";
import { modulAktualisieren, modulLoeschen } from "./actions";
import { LektionenListe, type Lektion } from "./LektionenListe";

type ModulDetail = {
  id: string;
  title: string;
  description: string | null;
  learning_path_id: string;
  learning_path_title: string;
  lessons: Lektion[];
};

async function ladeModul(id: string): Promise<ModulDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("modules")
    .select(
      `id, title, description, learning_path_id,
       learning_paths:learning_path_id ( title ),
       lessons ( id, title, summary, sort_order )`,
    )
    .eq("id", id)
    .single();

  if (!data) return null;

  type Roh = {
    id: string;
    title: string;
    description: string | null;
    learning_path_id: string;
    learning_paths: { title: string } | null;
    lessons:
      | {
          id: string;
          title: string;
          summary: string | null;
          sort_order: number;
        }[]
      | null;
  };
  const r = data as unknown as Roh;

  return {
    id: r.id,
    title: r.title,
    description: r.description,
    learning_path_id: r.learning_path_id,
    learning_path_title: r.learning_paths?.title ?? "",
    lessons: (r.lessons ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((l) => ({ id: l.id, title: l.title, summary: l.summary })),
  };
}

export default async function ModulBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const modul = await ladeModul(id);
  if (!modul) notFound();

  const aktualisieren = modulAktualisieren.bind(null, modul.id);
  const loeschen = modulLoeschen.bind(null, modul.id);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Lernpfade", href: "/admin/lernpfade" },
          {
            label: modul.learning_path_title,
            href: `/admin/lernpfade/${modul.learning_path_id}`,
          },
          { label: modul.title },
        ]}
        eyebrow="Modul"
        title={modul.title}
        description="Stammdaten, Hero-Bild und Lektionen pflegen."
      />

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <header className="border-b border-border bg-muted/30 px-6 py-4 sm:px-8">
          <h2 className="text-base font-semibold tracking-tight">Stammdaten</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Titel und Beschreibung des Moduls. Hero-Bild wird auf
            Lernpfad-Ebene gepflegt.
          </p>
        </header>
        <form action={aktualisieren} className="space-y-5 p-6 sm:p-8">
          <div className="space-y-1.5">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={150}
              defaultValue={modul.title}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Beschreibung</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={modul.description ?? ""}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <LoeschenButton
              action={loeschen}
              label="Modul löschen"
              bestaetigung="Modul inkl. aller Lektionen wirklich löschen?"
            />
            <SpeichernButton />
          </div>
        </form>
      </section>

      <LektionenListe modulId={modul.id} lektionen={modul.lessons} />
    </div>
  );
}
