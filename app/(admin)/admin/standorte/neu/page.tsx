import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { standortAnlegen } from "../actions";

export default async function NeuerStandortPage() {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Standorte", href: "/admin/standorte" },
          { label: "Neu" },
        ]}
        eyebrow="Standort"
        title="Neuer Standort"
        description="Studio anlegen, dem Mitarbeiter zugeordnet werden können."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <form action={standortAnlegen} className="space-y-4 p-5">
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
              autoFocus
              placeholder="z.B. Studio Süd"
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="flex justify-end pt-1">
            <Button type="submit" variant="primary">
              <Plus />
              Standort anlegen
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
