import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Pencil,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReihenfolgeButtons } from "@/components/admin/ReihenfolgeButtons";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { SpeichernButton } from "@/components/admin/SpeichernButton";
import { BildUpload } from "@/components/admin/BildUpload";
import { createClient } from "@/lib/supabase/server";
import {
  lernpfadAktualisieren,
  lernpfadLoeschen,
  modulAnlegen,
  modulLoeschen,
  modulReihenfolge,
} from "../actions";

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
    hero_image_path: (data as { hero_image_path: string | null }).hero_image_path ?? null,
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
  const modulNeu = modulAnlegen.bind(null, pfad.id);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/lernpfade"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Liste
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {pfad.title}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Lernpfad bearbeiten und Module verwalten.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/lernpfade/${pfad.id}`}>
            <ExternalLink className="h-4 w-4" />
            Vorschau
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Hero-Bild</CardTitle>
          <CardDescription>
            Erscheint auf der Lernpfad-Übersicht und im Pfad-Header.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BildUpload
            scope="path"
            id={pfad.id}
            aktuellerPfad={pfad.hero_image_path}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stammdaten</CardTitle>
          <CardDescription>Titel, Beschreibung und Status.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={aktualisieren} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                name="title"
                required
                maxLength={150}
                defaultValue={pfad.title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={pfad.description ?? ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={pfad.status}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="entwurf">Entwurf</option>
                <option value="aktiv">Aktiv</option>
                <option value="archiviert">Archiviert</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <LoeschenButton
                action={loeschen}
                label="Lernpfad löschen"
                bestaetigung="Lernpfad inkl. aller Module und Lektionen wirklich löschen?"
              />
              <SpeichernButton />
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Module</h2>
            <p className="text-sm text-muted-foreground">
              Module strukturieren den Lernpfad. Lektionen pflegst du in der
              Modul-Detailseite.
            </p>
          </div>
        </div>

        {pfad.modules.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Noch keine Module – leg unten dein erstes Modul an.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {pfad.modules.map((m, idx) => (
              <Card key={m.id}>
                <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <ReihenfolgeButtons
                      hoch={modulReihenfolge.bind(null, pfad.id, m.id, "hoch")}
                      runter={modulReihenfolge.bind(
                        null,
                        pfad.id,
                        m.id,
                        "runter",
                      )}
                      hochDeaktiviert={idx === 0}
                      runterDeaktiviert={idx === pfad.modules.length - 1}
                    />
                    <div className="min-w-0">
                      <div className="font-medium">{m.title}</div>
                      {m.description ? (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {m.description}
                        </p>
                      ) : null}
                      <div className="mt-1 text-xs text-muted-foreground">
                        <Badge variant="outline">
                          {m.lessons.length}{" "}
                          {m.lessons.length === 1 ? "Lektion" : "Lektionen"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button asChild size="sm">
                      <Link href={`/admin/module/${m.id}`}>
                        <Pencil className="h-3.5 w-3.5" />
                        Modul bearbeiten
                      </Link>
                    </Button>
                    <LoeschenButton
                      action={modulLoeschen.bind(null, pfad.id, m.id)}
                      label="Modul löschen"
                      bestaetigung="Modul inkl. aller Lektionen wirklich löschen?"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Neues Modul anlegen</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={modulNeu} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="modul-title">Titel</Label>
                <Input
                  id="modul-title"
                  name="title"
                  required
                  maxLength={150}
                  placeholder="z.B. Check-in und Check-out"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modul-description">Beschreibung</Label>
                <textarea
                  id="modul-description"
                  name="description"
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm">
                  <Plus className="h-4 w-4" />
                  Modul hinzufügen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
