import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { SpeichernButton } from "@/components/admin/SpeichernButton";
import { BildUpload } from "@/components/admin/BildUpload";
import { LernpfadStatusSelector } from "@/components/admin/LernpfadStatusSelector";
import { VorschauButton } from "@/components/admin/VorschauButton";
import { createClient } from "@/lib/supabase/server";
import { lernpfadAktualisieren, lernpfadLoeschen } from "../actions";
import { ModuleListe } from "./ModuleListe";

type Lektion = { id: string; title: string; sort_order: number };
type Modul = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  lessons: Lektion[];
};
type Pfad = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  hero_image_path: string | null;
  modules: Modul[];
};

async function ladePfad(id: string): Promise<Pfad | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("learning_paths")
    .select(
      `id, title, description, status, hero_image_path,
       modules (
         id, title, description, sort_order,
         lessons ( id, title, sort_order )
       )`,
    )
    .eq("id", id)
    .single();

  if (!data) return null;

  type RohModul = {
    id: string;
    title: string;
    description: string | null;
    sort_order: number;
    lessons: { id: string; title: string; sort_order: number }[] | null;
  };

  const moduleListe = ((data.modules ?? []) as unknown as RohModul[])
    .map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      sort_order: m.sort_order,
      lessons: (m.lessons ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order),
    }))
    .sort((a, b) => a.sort_order - b.sort_order);

  return {
    id: data.id as string,
    title: data.title as string,
    description: data.description as string | null,
    status: data.status as string,
    hero_image_path:
      (data as { hero_image_path: string | null }).hero_image_path ?? null,
    modules: moduleListe,
  };
}

export default async function LernpfadBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pfad = await ladePfad(id);
  if (!pfad) notFound();

  const aktualisieren = lernpfadAktualisieren.bind(null, pfad.id);
  const loeschen = lernpfadLoeschen.bind(null, pfad.id);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Lernpfade", href: "/admin/lernpfade" },
          { label: pfad.title },
        ]}
        eyebrow="Lernpfad"
        title={pfad.title}
        description="Stammdaten, Hero-Bild und Module verwalten."
        extras={<VorschauButton url={`/lernpfade/${pfad.id}`} />}
      />

      {/* Stammdaten + Hero in einer Card mit zwei Spalten auf Desktop */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <header className="border-b border-border bg-muted/30 px-6 py-4 sm:px-8">
          <h2 className="text-base font-semibold tracking-tight">Stammdaten</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Titel, Beschreibung, Status und Hero-Bild des Lernpfads.
          </p>
        </header>
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_360px]">
          <form action={aktualisieren} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                name="title"
                required
                maxLength={150}
                defaultValue={pfad.title}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Beschreibung</Label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={pfad.description ?? ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <LernpfadStatusSelector defaultValue={pfad.status} />
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <LoeschenButton
                action={loeschen}
                label="Lernpfad löschen"
                bestaetigung="Lernpfad inkl. aller Module und Lektionen wirklich löschen?"
              />
              <SpeichernButton />
            </div>
          </form>
          <div>
            <BildUpload
              scope="path"
              id={pfad.id}
              aktuellerPfad={pfad.hero_image_path}
            />
          </div>
        </div>
      </section>

      <ModuleListe pfadId={pfad.id} module={pfad.modules} />
    </div>
  );
}
