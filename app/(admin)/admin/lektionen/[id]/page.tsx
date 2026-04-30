import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ContentBlockView } from "@/components/lektion/ContentBlock";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { BlockBearbeitenInline } from "@/components/admin/BlockBearbeitenInline";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { ReihenfolgeButtons } from "@/components/admin/ReihenfolgeButtons";
import { SpeichernButton } from "@/components/admin/SpeichernButton";
import { BildUpload } from "@/components/admin/BildUpload";
import { createClient } from "@/lib/supabase/server";
import {
  blockAktualisieren,
  blockAnlegen,
  blockLoeschen,
  blockReihenfolge,
  lektionAktualisieren,
  lektionLoeschen,
} from "./actions";

type Block = {
  id: string;
  block_type: "text" | "checkliste" | "video_url" | "hinweis";
  content: Record<string, unknown>;
  sort_order: number;
};

type LektionDetail = {
  id: string;
  title: string;
  summary: string | null;
  module_id: string;
  module_title: string;
  learning_path_id: string;
  hero_image_path: string | null;
  blocks: Block[];
};

async function ladeLektion(id: string): Promise<LektionDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select(
      `id, title, summary, module_id, hero_image_path,
       modules:module_id ( title, learning_path_id ),
       lesson_content_blocks ( id, block_type, content, sort_order )`,
    )
    .eq("id", id)
    .single();

  if (!data) return null;

  type Roh = {
    id: string;
    title: string;
    summary: string | null;
    module_id: string;
    hero_image_path: string | null;
    modules: { title: string; learning_path_id: string } | null;
    lesson_content_blocks:
      | {
          id: string;
          block_type: Block["block_type"];
          content: Record<string, unknown>;
          sort_order: number;
        }[]
      | null;
  };
  const r = data as unknown as Roh;

  return {
    id: r.id,
    title: r.title,
    summary: r.summary,
    module_id: r.module_id,
    module_title: r.modules?.title ?? "",
    learning_path_id: r.modules?.learning_path_id ?? "",
    hero_image_path: r.hero_image_path,
    blocks: (r.lesson_content_blocks ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order),
  };
}

export default async function LektionBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lekt = await ladeLektion(id);
  if (!lekt) notFound();

  const aktualisieren = lektionAktualisieren.bind(null, lekt.id);
  const loeschen = lektionLoeschen.bind(null, lekt.id);
  const blockNeu = blockAnlegen.bind(null, lekt.id);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Lernpfade", href: "/admin/lernpfade" },
          {
            label: lekt.module_title,
            href: `/admin/module/${lekt.module_id}`,
          },
          { label: lekt.title },
        ]}
        eyebrow="Lektion"
        title={lekt.title}
        description="Stammdaten, Hero-Bild und Inhalts-Blöcke pflegen."
        secondaryActions={[
          {
            icon: <ExternalLink />,
            label: "Vorschau",
            href: `/lektionen/${lekt.id}`,
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Stammdaten</CardTitle>
          <CardDescription>Titel und Kurzbeschreibung.</CardDescription>
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
                defaultValue={lekt.title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Kurzbeschreibung</Label>
              <textarea
                id="summary"
                name="summary"
                rows={2}
                defaultValue={lekt.summary ?? ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <LoeschenButton
                action={loeschen}
                label="Lektion löschen"
                bestaetigung="Lektion inkl. Inhalts-Blöcken und Fortschritten wirklich löschen?"
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
            Optionales Hero-Bild oben in der Lektion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BildUpload
            scope="lesson"
            id={lekt.id}
            aktuellerPfad={lekt.hero_image_path}
          />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Inhalts-Blöcke</h2>
        <p className="text-sm text-muted-foreground">
          Reihenfolge bestimmt die Anzeige in der Lektion. Du kannst Markdown
          (mit Listen, Fettdruck, Code), Checklisten, Hinweis-Boxen und
          Video-Links kombinieren.
        </p>

        {lekt.blocks.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Noch keine Inhalts-Blöcke – leg unten den ersten an.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {lekt.blocks.map((b, idx) => (
              <Card key={b.id}>
                <CardContent className="space-y-3 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <ReihenfolgeButtons
                        hoch={blockReihenfolge.bind(null, lekt.id, b.id, "hoch")}
                        runter={blockReihenfolge.bind(
                          null,
                          lekt.id,
                          b.id,
                          "runter",
                        )}
                        hochDeaktiviert={idx === 0}
                        runterDeaktiviert={idx === lekt.blocks.length - 1}
                      />
                      <Badge variant="outline">{blockTypLabel(b.block_type)}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <BlockBearbeitenInline
                        initial={{ block_type: b.block_type, content: b.content }}
                        action={blockAktualisieren.bind(null, lekt.id, b.id)}
                      />
                      <LoeschenButton
                        action={blockLoeschen.bind(null, lekt.id, b.id)}
                        label="Block löschen"
                        bestaetigung="Diesen Inhalts-Block wirklich löschen?"
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <ContentBlockView block={b} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Neuer Inhalts-Block</CardTitle>
            <CardDescription>
              Wähle den Typ und befülle die Felder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BlockEditor modus="anlegen" action={blockNeu} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function blockTypLabel(typ: Block["block_type"]): string {
  switch (typ) {
    case "text":
      return "Text";
    case "checkliste":
      return "Checkliste";
    case "video_url":
      return "Video";
    case "hinweis":
      return "Hinweis";
  }
}
