import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { SpeichernButton } from "@/components/admin/SpeichernButton";
import { VorschauButton } from "@/components/admin/VorschauButton";
import { createClient } from "@/lib/supabase/server";
import { lektionAktualisieren, lektionLoeschen } from "./actions";
import { BloeckeListe, type Block } from "./BloeckeListe";

type LektionDetail = {
  id: string;
  title: string;
  summary: string | null;
  module_id: string;
  module_title: string;
  learning_path_id: string;
  blocks: Block[];
};

async function ladeLektion(id: string): Promise<LektionDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select(
      `id, title, summary, module_id,
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
        extras={<VorschauButton url={`/lektionen/${lekt.id}`} />}
      />

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <header className="border-b border-border bg-muted/30 px-6 py-4 sm:px-8">
          <h2 className="text-base font-semibold tracking-tight">Stammdaten</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Titel und Kurzbeschreibung. Hero-Bild wird auf Lernpfad-Ebene
            gepflegt.
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
              defaultValue={lekt.title}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="summary">Kurzbeschreibung</Label>
            <textarea
              id="summary"
              name="summary"
              rows={3}
              defaultValue={lekt.summary ?? ""}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <LoeschenButton
              action={loeschen}
              label="Lektion löschen"
              bestaetigung="Lektion inkl. Inhalts-Blöcken und Fortschritten wirklich löschen?"
            />
            <SpeichernButton />
          </div>
        </form>
      </section>

      <BloeckeListe lektionId={lekt.id} blocks={lekt.blocks} />
    </div>
  );
}
