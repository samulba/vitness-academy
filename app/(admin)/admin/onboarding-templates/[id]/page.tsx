import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ladeTemplate } from "@/lib/onboarding-templates";
import { TemplateForm } from "../TemplateForm";
import { templateAktualisieren, templateLoeschen } from "../actions";

export default async function TemplateBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin", "superadmin"]);
  const { id } = await params;
  const template = await ladeTemplate(id);
  if (!template) notFound();

  const supabase = await createClient();
  const { data: pfade } = await supabase
    .from("learning_paths")
    .select("id, title, description")
    .eq("status", "aktiv")
    .order("sort_order", { ascending: true });

  const aktualisieren = templateAktualisieren.bind(null, id);
  const loeschen = templateLoeschen.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Onboarding-Templates", href: "/admin/onboarding-templates" },
          { label: template.name },
        ]}
        eyebrow="Template"
        title={template.name}
        description={
          template.beschreibung ??
          "Rolle und Lernpfade anpassen — Änderungen wirken sich auf zukünftige Anlage-Vorgänge aus."
        }
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card p-6 sm:p-8">
        <TemplateForm
          action={aktualisieren}
          modus="bearbeiten"
          initial={{
            name: template.name,
            beschreibung: template.beschreibung,
            role: template.role,
            lernpfad_ids: template.lernpfad_ids,
          }}
          lernpfade={
            (pfade ?? []) as {
              id: string;
              title: string;
              description: string | null;
            }[]
          }
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-destructive/25 bg-destructive/[0.03] p-6">
        <h2 className="text-sm font-semibold tracking-tight text-destructive">
          Template löschen
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Bereits angelegte Mitarbeiter:innen sind davon nicht betroffen — die Lernpfad-Zuweisungen bleiben.
        </p>
        <div className="mt-3">
          <LoeschenButton
            action={loeschen}
            label="Template endgültig löschen"
            bestaetigung="Dieses Template wirklich löschen?"
          />
        </div>
      </div>
    </div>
  );
}
