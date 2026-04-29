import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import {
  fotoUrlFuerPfad,
  ladeMangel,
  SEVERITY_LABEL,
  STATUS_LABEL,
} from "@/lib/maengel";
import { formatDatum } from "@/lib/format";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { MangelStatusBadge } from "@/components/maengel/StatusBadge";
import {
  mangelLoeschen,
  mangelStatusSetzen,
} from "@/app/(app)/maengel/actions";

export default async function MangelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const { id } = await params;
  const m = await ladeMangel(id);
  if (!m) notFound();

  const url = fotoUrlFuerPfad(m.photo_path);
  const setStatus = (next: typeof m.status) =>
    mangelStatusSetzen.bind(null, id, next);
  const loeschen = mangelLoeschen.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/admin/maengel"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu allen Mängeln
      </Link>

      <header className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Studio · Mängel
        </p>
        <h1 className="text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.5rem)]">
          {m.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <MangelStatusBadge status={m.status} />
          <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {SEVERITY_LABEL[m.severity]}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDatum(m.created_at)}
            {m.reported_by_name && <> · {m.reported_by_name}</>}
          </span>
        </div>
      </header>

      {url && (
        <div className="overflow-hidden rounded-2xl border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="w-full object-cover" />
        </div>
      )}

      {m.description && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Beschreibung
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
            {m.description}
          </p>
        </div>
      )}

      {/* Status setzen */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Status setzen
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Optional: kurze Notiz zum Vorgehen / der Lösung.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {(
            ["offen", "in_bearbeitung", "behoben", "verworfen"] as const
          ).map((s) => (
            <form key={s} action={setStatus(s)} className="contents">
              <input
                type="hidden"
                name="resolution_note"
                value={m.resolution_note ?? ""}
              />
              <button
                type="submit"
                disabled={s === m.status}
                className={
                  s === m.status
                    ? "rounded-lg border-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] px-4 py-3 text-left text-sm font-medium opacity-60"
                    : "rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.04)]"
                }
              >
                {STATUS_LABEL[s]}
                {s === m.status && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    aktuell
                  </span>
                )}
              </button>
            </form>
          ))}
        </div>

        {/* Notiz Form (separater submit) */}
        <form action={setStatus(m.status)} className="mt-6 space-y-3">
          <label
            htmlFor="resolution_note"
            className="text-sm font-medium"
          >
            Notiz (optional)
          </label>
          <textarea
            id="resolution_note"
            name="resolution_note"
            rows={3}
            defaultValue={m.resolution_note ?? ""}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="z.B. „Techniker bestellt, Liefertermin Mittwoch“"
          />
          <button
            type="submit"
            className="rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
          >
            Notiz speichern
          </button>
        </form>

        {m.resolved_at && (
          <p className="mt-4 text-xs text-muted-foreground">
            Erledigt am {formatDatum(m.resolved_at)}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold">Eintrag löschen</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Inkl. Foto. Kann nicht rückgängig gemacht werden.
        </p>
        <div className="mt-4">
          <LoeschenButton
            action={loeschen}
            label="Mangel endgültig löschen"
            bestaetigung="Diesen Mangel wirklich löschen?"
          />
        </div>
      </div>
    </div>
  );
}
