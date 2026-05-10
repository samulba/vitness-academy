import Link from "next/link";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { requirePermission } from "@/lib/auth";
import {
  ladeMitarbeiterAnStandort,
  ladeStandort,
} from "@/lib/standorte";
import { rolleLabel } from "@/lib/format";
import {
  standortAktualisieren,
  standortLoeschen,
} from "../actions";

export default async function StandortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("standorte", "view");
  const { id } = await params;
  const standort = await ladeStandort(id);
  if (!standort) notFound();

  const mitarbeiter = await ladeMitarbeiterAnStandort(id);
  const aktualisieren = standortAktualisieren.bind(null, id);
  const loeschen = standortLoeschen.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Standorte", href: "/admin/standorte" },
          { label: standort.name },
        ]}
        eyebrow="Standort"
        title={standort.name}
        description={
          standort.mitarbeiter_count === 1
            ? "1 Mitarbeiter zugeordnet."
            : `${standort.mitarbeiter_count} Mitarbeiter zugeordnet.`
        }
      />

      {/* Stammdaten */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">
            Stammdaten
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Name des Studios.
          </p>
        </div>
        <form action={aktualisieren} className="space-y-4 p-5">
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
              defaultValue={standort.name}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="flex justify-end pt-1">
            <Button type="submit" variant="primary">
              Speichern
            </Button>
          </div>
        </form>
      </div>

      {/* Mitarbeiter */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">
            Mitarbeiter an diesem Standort
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Klick öffnet das Benutzer-Profil.
          </p>
        </div>
        {mitarbeiter.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            Aktuell ist niemand diesem Standort zugeordnet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {mitarbeiter.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/admin/benutzer/${m.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[hsl(var(--brand-pink)/0.04)]"
                >
                  <ColoredAvatar name={m.full_name} size="sm" />
                  <span className="flex-1 text-[13px] font-medium text-foreground">
                    {m.full_name ?? "—"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {rolleLabel(m.role)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Danger-Zone */}
      <div className="overflow-hidden rounded-xl border border-destructive/25 bg-destructive/[0.03]">
        <div className="border-b border-destructive/20 px-5 py-4">
          <h2 className="flex items-center gap-2 text-[14px] font-semibold tracking-tight text-destructive">
            <Users className="h-3.5 w-3.5" />
            Standort löschen
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {mitarbeiter.length > 0
              ? `${mitarbeiter.length} Mitarbeiter werden dadurch standortlos (location_id auf null).`
              : "Aktuell sind keine Mitarbeiter zugeordnet — sicher zu löschen."}
          </p>
        </div>
        <div className="p-5">
          <LoeschenButton
            action={loeschen}
            label="Standort endgültig löschen"
            bestaetigung={`Standort "${standort.name}" wirklich löschen?`}
          />
        </div>
      </div>
    </div>
  );
}
