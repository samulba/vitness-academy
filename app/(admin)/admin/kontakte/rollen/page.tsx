import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { requireRole } from "@/lib/auth";
import { ladeRollen } from "@/lib/contact-roles";
import { rolleAnlegen, rolleLoeschen } from "../actions";

export default async function RollenAdminPage() {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const rollen = await ladeRollen();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Kontakte", href: "/admin/kontakte" },
          { label: "Rollen" },
        ]}
        eyebrow="Stammdaten"
        title="Rollen-Katalog"
        description="Lege fest, welche Rollen-Tags den Kontakten zugewiesen werden können."
      />

      <Link
        href="/admin/kontakte"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu Kontakten
      </Link>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">
            Neue Rolle anlegen
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Wird sofort im Kontakt-Formular als Auswahl verfügbar.
          </p>
        </div>
        <form
          action={rolleAnlegen}
          className="flex flex-wrap items-end gap-3 p-5"
        >
          <div className="min-w-[200px] flex-1 space-y-1.5">
            <Label htmlFor="role-name">Name</Label>
            <Input
              id="role-name"
              name="name"
              required
              maxLength={40}
              placeholder="z.B. „Marketing"
            />
          </div>
          <Button type="submit" className="gap-2">
            <Plus className="h-4 w-4" />
            Anlegen
          </Button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">
            Vorhandene Rollen
          </h2>
        </div>
        {rollen.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            Noch keine Rollen angelegt.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {rollen.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <span className="font-medium">{r.name}</span>
                {r.id.startsWith("fb-") ? (
                  <span className="text-[11px] italic text-muted-foreground">
                    Standard (Migration noch nicht eingespielt)
                  </span>
                ) : (
                  <LoeschenButton
                    action={rolleLoeschen.bind(null, r.id)}
                    label="Entfernen"
                    bestaetigung={`„${r.name}" wirklich entfernen?`}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        <Trash2 className="mr-1 inline h-3 w-3" />
        Beim Entfernen einer Rolle bleiben die bestehenden Zuweisungen auf
        Kontakten unverändert — die Rolle steht nur nicht mehr zur Auswahl.
      </p>
    </div>
  );
}
