import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, FileText } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import {
  aktuellerMonat,
  formatStunden,
  ladeLohnabrechnung,
  ladeShiftsImMonat,
  monatLabel,
  monatPlus,
  summeStunden,
} from "@/lib/lohn";
import {
  getAktiverStandort,
  ladeMeineStandorte,
} from "@/lib/standort-context";
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

  const [shifts, lohn, standorte, aktiv] = await Promise.all([
    ladeShiftsImMonat(profile.id, monat),
    ladeLohnabrechnung(profile.id, monat),
    ladeMeineStandorte(profile.id),
    getAktiverStandort(),
  ]);
  const standortOptions = standorte.map((s) => ({ id: s.id, name: s.name }));

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

  const sollDeltaTone: "success" | "warn" | undefined =
    sollDelta === null ? undefined : sollDelta >= -1 ? "success" : "warn";

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page-Header — minimal auf Mobile */}
      <header className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))] sm:text-[11px]">
          Schichten & Lohn
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {monatLabel(monat)}
        </h1>
        <p className="hidden text-sm text-muted-foreground sm:block">
          Schichten eintragen, Stunden tracken, Lohnabrechnung abgleichen.
        </p>
      </header>

      {/* Hero-Card: Stunden-Anzeige + Monats-Switcher + Mini-Stats */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Monats-Switcher als Top-Bar */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-2 py-2">
          <Link
            href={`?monat=${monatPlus(monat, -1)}`}
            aria-label={`Vorheriger Monat (${monatLabel(monatPlus(monat, -1))})`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="text-sm font-semibold tabular-nums">
            {monatLabel(monat)}
          </span>
          <Link
            href={`?monat=${monatPlus(monat, 1)}`}
            aria-label={`Nächster Monat (${monatLabel(monatPlus(monat, 1))})`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Hero: grosse Stunden-Zahl */}
        <div className="relative overflow-hidden p-5 sm:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-[-10%] h-[280px] w-[280px] rounded-full opacity-[0.08] blur-[80px]"
            style={{
              background:
                "radial-gradient(closest-side, hsl(var(--primary)), transparent)",
            }}
          />
          <div className="relative flex items-baseline justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Stunden gesamt
              </p>
              <p className="mt-1 text-4xl font-bold leading-none tracking-tight tabular-nums sm:text-5xl">
                {formatStunden(stunden)}
              </p>
              {sollDelta !== null && (
                <p
                  className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                    sollDeltaTone === "success"
                      ? "border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.08)] text-[hsl(var(--success))]"
                      : "border-[hsl(var(--brand-pink)/0.3)] bg-[hsl(var(--brand-pink)/0.08)] text-[hsl(var(--brand-pink))]"
                  }`}
                >
                  {sollDelta >= 0
                    ? `+${formatStunden(sollDelta)}`
                    : `−${formatStunden(-sollDelta)}`}{" "}
                  vs. Soll
                </p>
              )}
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
              <Clock className="h-5 w-5" strokeWidth={1.75} />
            </span>
          </div>

          {/* Mini-Stats: Schichten + Pause als Pills (kompakter als 4 Cards) */}
          <div className="relative mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
            <MiniStat label="Schichten" value={String(shifts.length)} />
            <MiniStat
              label="Pause"
              value={`${Math.floor(pauseSumme / 60)}h ${String(pauseSumme % 60).padStart(2, "0")}m`}
            />
            {soll !== null && (
              <MiniStat
                label="Soll"
                value={formatStunden(soll)}
                muted
              />
            )}
          </div>
        </div>
      </section>

      {/* Schichten-Sektion */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            Meine Schichten
          </h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {shifts.length}{" "}
            {shifts.length === 1 ? "Eintrag" : "Einträge"}
          </span>
        </div>

        {/* Quick-Add */}
        <ShiftHinzufuegen
          monat={monat}
          standorte={standortOptions}
          aktiverStandortId={aktiv?.id ?? null}
        />

        {/* Liste */}
        {shifts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground sm:p-8">
            Noch keine Schichten in diesem Monat. Trag die erste oben ein.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {/* Tabellen-Header (nur Desktop) */}
            <div className="hidden grid-cols-[110px_140px_90px_90px_70px_1fr_60px] items-center gap-3 border-b border-border bg-muted/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
              <span>Datum</span>
              <span>Wo</span>
              <span>Von</span>
              <span>Bis</span>
              <span className="text-right">Stunden</span>
              <span>Notiz</span>
              <span></span>
            </div>
            <ul className="divide-y divide-border">
              {shifts.map((s) => (
                <li key={s.id}>
                  <ShiftRow
                    shift={s}
                    standorte={standortOptions}
                    aktiverStandortId={aktiv?.id ?? null}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Lohnabrechnung-Sektion */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            Lohnabrechnung
          </h2>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            PDF
          </span>
        </div>
        <LohnabrechnungCard lohn={lohn} monat={monat} />
      </section>
    </div>
  );
}

function MiniStat({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline gap-1.5 rounded-lg border px-2.5 py-1 text-xs ${
        muted
          ? "border-dashed border-border bg-transparent"
          : "border-border bg-background"
      }`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
