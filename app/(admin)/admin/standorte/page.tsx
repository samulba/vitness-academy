import Link from "next/link";
import { ArrowRight, MapPin, Plus, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ladeStandorte } from "@/lib/standorte";

export default async function StandorteAdminPage() {
  await requireRole(["admin", "superadmin"]);
  const standorte = await ladeStandorte();

  return (
    <div className="space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
            Verwaltung
          </p>
          <h1 className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.75rem)]">
            Standorte
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            Studios, denen Mitarbeiter zugeordnet werden können.
            Mehrstandort-Inhalte folgen wenn ein zweiter Standort live geht.
          </p>
        </div>
        <Link
          href="/admin/standorte/neu"
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          <Plus className="h-4 w-4" />
          Neuer Standort
        </Link>
      </header>

      {standorte.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            Noch keine Standorte angelegt.
          </p>
          <Link
            href="/admin/standorte/neu"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--brand-pink))] hover:underline"
          >
            Ersten Standort anlegen
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
          {standorte.map((s, i) => (
            <li
              key={s.id}
              className={i > 0 ? "border-t border-border" : ""}
            >
              <Link
                href={`/admin/standorte/${s.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
                  <MapPin className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight">{s.name}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {s.mitarbeiter_count}{" "}
                    {s.mitarbeiter_count === 1 ? "Mitarbeiter" : "Mitarbeiter"}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
