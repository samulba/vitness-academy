import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { rolleAnlegen } from "../actions";

export default async function NeueRollePage() {
  await requireRole(["superadmin"]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Rollen", href: "/admin/rollen" },
          { label: "Neu" },
        ]}
        eyebrow="Rolle"
        title="Neue Rolle"
        description="Custom-Rolle anlegen — Berechtigungen pflegst du im nächsten Schritt."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <form action={rolleAnlegen} className="space-y-4 p-5">
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-[12px] font-medium text-muted-foreground"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={60}
              autoFocus
              placeholder="z.B. Standortleitung"
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="beschreibung"
              className="text-[12px] font-medium text-muted-foreground"
            >
              Beschreibung{" "}
              <span className="text-[10px] font-normal opacity-70">(optional)</span>
            </label>
            <textarea
              id="beschreibung"
              name="beschreibung"
              maxLength={400}
              rows={3}
              placeholder="Wofür ist diese Rolle gedacht?"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="base_level"
              className="text-[12px] font-medium text-muted-foreground"
            >
              Basis-Level
            </label>
            <select
              id="base_level"
              name="base_level"
              defaultValue="fuehrungskraft"
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="mitarbeiter">Mitarbeiter</option>
              <option value="fuehrungskraft">Führungskraft</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
            <p className="text-[11px] text-muted-foreground">
              Bestimmt die DB-Rechte (RLS). Verwaltungs-Rollen brauchen mindestens
              „Führungskraft&ldquo;, echte Admin-Rechte erfordern „Admin&ldquo;.
            </p>
          </div>
          <div className="flex justify-end pt-1">
            <Button type="submit" variant="primary">
              <Plus />
              Rolle anlegen
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
