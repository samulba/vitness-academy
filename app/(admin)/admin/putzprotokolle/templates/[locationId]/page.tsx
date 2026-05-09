import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ladeTemplateMitSections } from "@/lib/putzprotokoll";
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { PutzprotokolleNav } from "@/components/admin/PutzprotokolleNav";
import {
  sectionAnlegen,
  sectionAktualisieren,
  sectionLoeschen,
  sectionVerschieben,
} from "../actions";
import { AufgabenEditor } from "./AufgabenEditor";

export const dynamic = "force-dynamic";

export default async function TemplateEditorPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const { locationId } = await params;

  const supabase = await createClient();
  const { data: location } = await supabase
    .from("locations")
    .select("name")
    .eq("id", locationId)
    .maybeSingle();
  if (!location) notFound();

  const tpl = await ladeTemplateMitSections(locationId);
  if (!tpl) notFound();

  const sectionAnlegenAction = sectionAnlegen.bind(null, tpl.template.id);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/putzprotokolle/templates"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu allen Templates
      </Link>

      <PutzprotokolleNav />

      <header className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Putzprotokoll-Template
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {location.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bereiche definieren wovon das Protokoll handelt. Pro Bereich eine
          Aufgaben-Liste, eine Aufgabe pro Zeile.
        </p>
      </header>

      {/* Sections-Liste */}
      {tpl.sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Noch keine Bereiche angelegt.
        </div>
      ) : (
        <ul className="space-y-3">
          {tpl.sections.map((sec, i) => {
            const istErster = i === 0;
            const istLetzter = i === tpl.sections.length - 1;
            const aktualisieren = sectionAktualisieren.bind(null, sec.id);
            const loeschen = sectionLoeschen.bind(null, sec.id);
            const hoch = sectionVerschieben.bind(null, sec.id, "up");
            const runter = sectionVerschieben.bind(null, sec.id, "down");
            return (
              <li
                key={sec.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-pink)/0.12)] text-sm font-bold tabular-nums text-[hsl(var(--brand-pink))]">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <form action={aktualisieren} className="space-y-3">
                      <div>
                        <label
                          htmlFor={`titel-${sec.id}`}
                          className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          Bereich
                        </label>
                        <Input
                          id={`titel-${sec.id}`}
                          name="titel"
                          defaultValue={sec.titel}
                          className="mt-1 h-10 rounded-lg"
                          required
                        />
                      </div>
                      <AufgabenEditor defaultValue={sec.aufgaben} />
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary)/0.9)]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Speichern
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    {!istErster && (
                      <form action={hoch}>
                        <button
                          type="submit"
                          aria-label="Nach oben verschieben"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    )}
                    {!istLetzter && (
                      <form action={runter}>
                        <button
                          type="submit"
                          aria-label="Nach unten verschieben"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    )}
                    <form action={loeschen}>
                      <button
                        type="submit"
                        aria-label="Bereich löschen"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-[hsl(var(--destructive)/0.4)] hover:text-[hsl(var(--destructive))]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Neue Section anlegen */}
      <form
        action={sectionAnlegenAction}
        className="rounded-2xl border-2 border-dashed border-input bg-card/50 p-5"
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Neuer Bereich
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Input
            name="titel"
            placeholder="z.B. Außenbereich, Trainingsfläche EG"
            className="h-10 flex-1 min-w-0 rounded-lg"
            required
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary)/0.9)]"
          >
            <Plus className="h-4 w-4" />
            Hinzufügen
          </button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Aufgaben kannst du danach beim Bearbeiten des Bereichs eintragen.
        </p>
      </form>
    </div>
  );
}
