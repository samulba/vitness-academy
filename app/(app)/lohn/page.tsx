import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import {
  aktuellerMonat,
  formatStunden,
  ladeLohnabrechnung,
  ladeShiftsImMonat,
  monatLabel,
  monatPlus,
  summeStunden,
} from "@/lib/lohn";
import { ShiftHinzufuegen } from "./ShiftHinzufuegen";
import { ShiftRow } from "./ShiftRow";
import { LohnabrechnungCard } from "./LohnabrechnungCard";

export const dynamic = "force-dynamic";

const VALID_MONAT = /^\d{4}-\d{2}$/;

export default async function LohnPage({
  searchParams,
}: {
  searchParams: Promise<{ monat?: string }>;
}) {
  const profile = await requireProfile();
  const sp = await searchParams;
  const monat =
    sp.monat && VALID_MONAT.test(sp.monat) ? sp.monat : aktuellerMonat();

  const [shifts, lohn] = await Promise.all([
    ladeShiftsImMonat(profile.id, monat),
    ladeLohnabrechnung(profile.id, monat),
  ]);

  const stunden = summeStunden(shifts);
  const pauseSumme = shifts.reduce((s, sh) => s + sh.pause_minuten, 0);

  // Soll-Stunden aus profile.wochenstunden ableiten (4.33 Wochen pro Monat)
  const wochenstundenRaw = (
    profile as unknown as { wochenstunden?: number | null }
  ).wochenstunden;
  const soll =
    wochenstundenRaw && wochenstundenRaw > 0
      ? wochenstundenRaw * 4.33
      : null;
  const sollDelta = soll === null ? null : stunden - soll;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Schichten & Lohn"
        title={monatLabel(monat)}
        description="Trag deine Schichten ein und gleich sie mit der Lohnabrechnung ab. Daten gehen nicht weiter — sind nur fuer dich (und im Bedarf fuer Studioleitung)."
      />

      {/* Monats-Switcher */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3">
        <Link
          href={`?monat=${monatPlus(monat, -1)}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
          {monatLabel(monatPlus(monat, -1))}
        </Link>
        <span className="text-sm font-semibold tabular-nums">
          {monatLabel(monat)}
        </span>
        <Link
          href={`?monat=${monatPlus(monat, 1)}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          {monatLabel(monatPlus(monat, 1))}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Schichten"
          value={String(shifts.length)}
          icon={<Clock className="h-4 w-4" />}
        />
        <Stat label="Stunden" value={formatStunden(stunden)} />
        <Stat
          label="Pause"
          value={`${Math.floor(pauseSumme / 60)}h ${String(pauseSumme % 60).padStart(2, "0")}m`}
        />
        <Stat
          label={soll === null ? "Differenz" : "Soll vs. Ist"}
          value={
            sollDelta === null
              ? "—"
              : sollDelta >= 0
                ? `+${formatStunden(sollDelta)}`
                : `−${formatStunden(-sollDelta)}`
          }
          tone={
            sollDelta === null
              ? undefined
              : sollDelta >= -1
                ? "success"
                : "warn"
          }
        />
      </div>

      {/* Schichten-Sektion */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
              Meine Schichten
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              {monatLabel(monat)}
            </h2>
          </div>
        </div>

        {/* Quick-Add */}
        <ShiftHinzufuegen monat={monat} />

        {/* Tabelle */}
        {shifts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Noch keine Schichten in diesem Monat. Trag die erste oben ein.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {/* Tabellen-Header (nur Desktop) */}
            <div className="hidden grid-cols-[120px_120px_120px_80px_1fr_60px] items-center gap-3 border-b border-border bg-muted/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
              <span>Datum</span>
              <span>Von</span>
              <span>Bis</span>
              <span className="text-right">Stunden</span>
              <span>Notiz</span>
              <span></span>
            </div>
            <ul className="divide-y divide-border">
              {shifts.map((s) => (
                <li key={s.id}>
                  <ShiftRow shift={s} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Lohnabrechnung-Sektion */}
      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
            Lohnabrechnung
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            {monatLabel(monat)}
          </h2>
        </div>
        <LohnabrechnungCard lohn={lohn} monat={monat} />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: "success" | "warn";
}) {
  const valueClass =
    tone === "success"
      ? "text-[hsl(var(--success))]"
      : tone === "warn"
        ? "text-[hsl(var(--brand-pink))]"
        : "";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        {icon}
      </div>
      <p
        className={`mt-2 text-2xl font-bold leading-none tabular-nums ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}
