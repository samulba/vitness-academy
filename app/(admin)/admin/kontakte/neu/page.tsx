import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { KontaktForm } from "../KontaktForm";
import { kontaktAnlegen } from "../actions";

export default async function NeuerKontaktPage() {
  await requireRole(["admin", "superadmin"]);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Kontakte", href: "/admin/kontakte" },
          { label: "Neu" },
        ]}
        eyebrow="Kontakt"
        title="Neuer Kontakt"
        description="Mitarbeiter:innen, externe Trainer, Lieferanten — alles, was im Studio-Alltag erreichbar sein soll."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">
            Stammdaten
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Mindestens Vorname oder Nachname pflichtfeld.
          </p>
        </div>
        <div className="p-5">
          <KontaktForm action={kontaktAnlegen} modus="neu" />
        </div>
      </div>
    </div>
  );
}
