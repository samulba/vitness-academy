import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Pencil, Plus } from "lucide-react";
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
import { ReihenfolgeButtons } from "@/components/admin/ReihenfolgeButtons";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { SpeichernButton } from "@/components/admin/SpeichernButton";
import { BildUpload } from "@/components/admin/BildUpload";
import { createClient } from "@/lib/supabase/server";
import {
  lektionAnlegen,
  lektionLoeschen,
  lektionReihenfolge,
  modulAktualisieren,
  modulLoeschen,
} from "./actions";

type Lektion = { id: string; title: string; summary: string | null; sort_order: number };
type ModulDetail = {
  id: string;
  title: string;
  description: string | null;
  learning_path_id: string;
  learning_path_title: string;
  hero_image_path: string | null;
  lessons: Lektion[];
};

async function ladeModul(id: string): Promise<ModulDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("modules")
    .select(
      `id, title, description, learning_path_id, hero_image_path,
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
    hero_image_path: string | null;
    learning_paths: { title: string } | null;
    lessons: { id: string; title: string; summary: string | null; sort_order: number }[] | null;
  };
  const r = data as unknown as Roh;

  return {
    id: r.id,
    title: r.title,
    description: r.description,
    learning_path_id: r.learning_path_id,
    hero_image_path: r.hero_image_path,
    learning_path_title: r.learning_paths?.title ?? "",
    lessons: (r.lessons ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order),
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
  const lektionNeu = lektionAnlegen.bind(null, modul.id);

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/lernpfade/${modul.learning_path_id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu „{modul.learning_path_title}“
      </Link>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{modul.title}</h1>
        <p className="mt-1 text-muted-foreground">
          Modul bearbeiten und Lektionen verwalten.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Stammdaten</CardTitle>
          <CardDescription>Titel und Beschreibung des Moduls.</CardDescription>
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
                defaultValue={modul.title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={modul.description ?? ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <LoeschenButton
                action={loeschen}
                label="Modul löschen"
                bestaetigung="Modul inkl. aller Lektionen wirklich löschen?"
              />
              <SpeichernButton />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bild</CardTitle>
          <CardDescription>
            Optionales Hero-Bild für dieses Modul. Wird Mitarbeiter:innen
            angezeigt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BildUpload
            scope="module"
            id={modul.id}
            aktuellerPfad={modul.hero_image_path}
          />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Lektionen</h2>

        {modul.lessons.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Noch keine Lektionen – leg unten deine erste Lektion an.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {modul.lessons.map((l, idx) => (
              <Card key={l.id}>
                <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <ReihenfolgeButtons
                      hoch={lektionReihenfolge.bind(null, modul.id, l.id, "hoch")}
                      runter={lektionReihenfolge.bind(
                        null,
                        modul.id,
                        l.id,
                        "runter",
                      )}
                      hochDeaktiviert={idx === 0}
                      runterDeaktiviert={idx === modul.lessons.length - 1}
                    />
                    <div className="min-w-0">
                      <div className="font-medium">{l.title}</div>
                      {l.summary ? (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {l.summary}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/lektionen/${l.id}`}>
                        <ExternalLink className="h-3.5 w-3.5" />
                        Vorschau
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/admin/lektionen/${l.id}`}>
                        <Pencil className="h-3.5 w-3.5" />
                        Inhalte bearbeiten
                      </Link>
                    </Button>
                    <LoeschenButton
                      action={lektionLoeschen.bind(null, modul.id, l.id)}
                      label="Löschen"
                      bestaetigung="Lektion inkl. Inhalts-Blöcken und Fortschritten wirklich löschen?"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Neue Lektion anlegen</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={lektionNeu} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="lekt-title">Titel</Label>
                <Input
                  id="lekt-title"
                  name="title"
                  required
                  maxLength={150}
                  placeholder="z.B. Begrüßung am Empfang"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lekt-summary">Kurzbeschreibung</Label>
                <textarea
                  id="lekt-summary"
                  name="summary"
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Optional, taucht in Listen auf."
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm">
                  <Plus className="h-4 w-4" />
                  Lektion hinzufügen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
