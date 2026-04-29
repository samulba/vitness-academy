import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import {
  ladeMitarbeiterAnStandort,
  ladeStandort,
} from "@/lib/standorte";
import { rolleLabel } from "@/lib/format";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import {
  standortAktualisieren,
  standortLoeschen,
} from "../actions";

export default async function StandortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin", "superadmin"]);
  const { id } = await params;
  const standort = await ladeStandort(id);
  if (!standort) notFound();

  const mitarbeiter = await ladeMitarbeiterAnStandort(id);
  const aktualisieren = standortAktualisieren.bind(null, id);
  const loeschen = standortLoeschen.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/admin/standorte"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu allen Standorten
      </Link>

      <header className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Verwaltung · Standorte
        </p>
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
            <MapPin className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.5rem)]">
              {standort.name}
            </h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {standort.mitarbeiter_count}{" "}
              {standort.mitarbeiter_count === 1 ? "Mitarbeiter" : "Mitarbeiter"}
            </p>
          </div>
        </div>
      </header>

      <form
        action={aktualisieren}
        className="space-y-4 rounded-2xl border border-border bg-card p-6"
      >
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Stammdaten
        </h2>
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={standort.name}
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-[hsl(var(--primary))] px-5 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          Speichern
        </button>
      </form>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Mitarbeiter an diesem Standort
        </h2>
        {mitarbeiter.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Aktuell ist niemand diesem Standort zugeordnet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {mitarbeiter.map((m) => (
              <li key={m.id} className="py-2.5">
                <Link
                  href={`/admin/benutzer/${m.id}`}
                  className="flex items-center justify-between gap-3 text-sm hover:underline"
                >
                  <span className="font-medium">{m.full_name ?? "—"}</span>
                  <span className="text-xs text-muted-foreground">
                    {rolleLabel(m.role)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-sm font-semibold">Standort löschen</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {mitarbeiter.length > 0
            ? `${mitarbeiter.length} Mitarbeiter werden dadurch standortlos (location_id wird auf null gesetzt).`
            : "Aktuell sind keine Mitarbeiter zugeordnet — sicher zu löschen."}
        </p>
        <div className="mt-4">
          <LoeschenButton
            action={loeschen}
            label="Standort löschen"
            bestaetigung={`Standort "${standort.name}" wirklich löschen?`}
          />
        </div>
      </section>
    </div>
  );
}
