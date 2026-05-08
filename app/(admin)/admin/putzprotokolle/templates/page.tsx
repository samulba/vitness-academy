import Link from "next/link";
import { ArrowRight, MapPin, Plus, Sparkles } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ladeStandorte } from "@/lib/standorte";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { templateAnlegenWennFehlt } from "./actions";

export const dynamic = "force-dynamic";

export default async function PutzprotokollTemplatesPage() {
  await requireRole(["admin", "superadmin"]);
  const standorte = await ladeStandorte();

  // Pro Standort: existiert Template? Wieviele Sections?
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("cleaning_protocol_templates")
    .select("id, location_id, cleaning_protocol_sections(id)");
  const tplMap = new Map<
    string,
    { templateId: string; sectionCount: number }
  >();
  for (const t of (templates ?? []) as Array<{
    id: string;
    location_id: string;
    cleaning_protocol_sections: { id: string }[];
  }>) {
    tplMap.set(t.location_id, {
      templateId: t.id,
      sectionCount: t.cleaning_protocol_sections.length,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio · Putzprotokoll"
        title="Templates"
        description="Pro Standort die Bereiche und Aufgaben des täglichen Putzprotokolls pflegen."
      />

      {standorte.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Noch keine Standorte angelegt.
        </div>
      ) : (
        <ul className="space-y-2">
          {standorte.map((s) => {
            const tpl = tplMap.get(s.id);
            return (
              <li key={s.id}>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[hsl(var(--primary)/0.4)]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold tracking-tight">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tpl
                        ? `${tpl.sectionCount} ${
                            tpl.sectionCount === 1 ? "Bereich" : "Bereiche"
                          } konfiguriert`
                        : "Noch kein Template"}
                    </p>
                  </div>
                  {tpl ? (
                    <Link
                      href={`/admin/putzprotokolle/templates/${s.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      Bearbeiten
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <form action={templateAnlegenWennFehlt.bind(null, s.id)}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary)/0.9)]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Template anlegen
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-[hsl(var(--brand-pink)/0.3)] bg-[hsl(var(--brand-pink)/0.06)] p-4">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--brand-pink))]" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Änderungen am Template wirken sich auf{" "}
          <span className="font-medium text-foreground">neue</span> Protokolle
          aus. Bereits eingereichte Protokolle behalten ihre Bereiche +
          Aufgaben als Snapshot.
        </p>
      </div>
    </div>
  );
}
