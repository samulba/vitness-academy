import { notFound } from "next/navigation";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth";
import {
  formatEuro,
  laufzeitLabel,
  ladeEntries,
  ladePayouts,
} from "@/lib/provisionen";
import { formatDatum } from "@/lib/format";
import { PrintTrigger } from "./PrintTrigger";

// Standalone: kein App-Layout, A4-optimiert, druckfähig.
export const dynamic = "force-dynamic";

function monatsLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split("-").map(Number);
  const monate = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ];
  return `${monate[m - 1]} ${y}`;
}

export default async function PrintPage({
  params,
}: {
  params: Promise<{ monat: string; vertrieblerId: string }>;
}) {
  await requirePermission("provisionen", "view");
  const { monat, vertrieblerId } = await params;

  if (!/^\d{4}-\d{2}$/.test(monat)) notFound();

  const [entries, payouts] = await Promise.all([
    ladeEntries({
      vertrieblerId,
      monatYYYYMM: monat,
      status: ["genehmigt"],
    }),
    ladePayouts({ vertrieblerId, monatYYYYMM: monat }),
  ]);

  if (entries.length === 0 && payouts.length === 0) notFound();

  const payout = payouts[0] ?? null;
  const vertrieblerName =
    payout?.vertriebler_name ??
    entries[0]?.vertriebler_name ??
    "—";

  const provisionSumme = payout
    ? payout.provision_summe
    : entries.reduce((s, e) => s + e.provision, 0);
  const bonusSumme = payout?.bonus_summe ?? 0;
  const total = payout?.total ?? provisionSumme;

  return (
    <div className="mx-auto max-w-[210mm] bg-white p-8 text-zinc-900 print:p-0 print:shadow-none">
      {/* Print-Toolbar (nur Bildschirm) */}
      <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 p-3 print:hidden">
        <p className="text-xs text-muted-foreground">
          Drucken als PDF: Strg/Cmd&nbsp;+&nbsp;P
        </p>
        <PrintTrigger>
          <Button size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Drucken
          </Button>
        </PrintTrigger>
      </div>

      {/* A4-Inhalt */}
      <header className="mb-8 flex items-start justify-between border-b-2 border-[hsl(var(--brand-pink))] pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
            Provisions-Abrechnung
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {monatsLabel(monat)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            für <strong>{vertrieblerName}</strong>
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-base font-bold text-[hsl(var(--primary-foreground))]">
            VA
          </span>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Vitness Crew
          </p>
        </div>
      </header>

      {/* Abschlüsse-Tabelle */}
      <section className="mb-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Genehmigte Abschlüsse ({entries.length})
        </h2>
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-zinc-300 text-left">
              <th className="px-2 py-2 font-semibold">Datum</th>
              <th className="px-2 py-2 font-semibold">Mitglied</th>
              <th className="px-2 py-2 text-right font-semibold">Laufzeit</th>
              <th className="px-2 py-2 text-right font-semibold">
                Beitrag Netto
              </th>
              <th className="px-2 py-2 text-right font-semibold">Startpaket</th>
              <th className="px-2 py-2 text-right font-semibold">Provision</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr
                key={e.id}
                className="border-b border-zinc-100"
              >
                <td className="px-2 py-1.5">{formatDatum(e.datum)}</td>
                <td className="px-2 py-1.5">
                  <span className="font-medium">{e.mitglied_name}</span>
                  {e.mitglied_nummer && (
                    <span className="ml-1 text-zinc-500">
                      · {e.mitglied_nummer}
                    </span>
                  )}
                  {e.storno_von_id && (
                    <span className="ml-1 text-[10px] uppercase text-red-600">
                      Storno
                    </span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-right">
                  {laufzeitLabel(e.laufzeit)}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {formatEuro(e.beitrag_netto)}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {formatEuro(e.startpaket)}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {formatEuro(e.provision)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Summen */}
      <section className="mt-8 border-t-2 border-[hsl(var(--brand-pink))] pt-4">
        <table className="ml-auto w-72 text-sm">
          <tbody>
            <tr>
              <td className="py-1 text-zinc-600">Provision aus Abschlüssen</td>
              <td className="py-1 text-right tabular-nums">
                {formatEuro(provisionSumme)}
              </td>
            </tr>
            {bonusSumme > 0 && (
              <tr>
                <td className="py-1 text-zinc-600">
                  Monats-Bonus
                  {payout?.bonus_stufe_info && (
                    <span className="block text-[10px] text-zinc-500">
                      {payout.bonus_stufe_info}
                    </span>
                  )}
                </td>
                <td className="py-1 text-right tabular-nums">
                  +{formatEuro(bonusSumme)}
                </td>
              </tr>
            )}
            <tr className="border-t-2 border-zinc-900">
              <td className="py-2 font-bold">Gesamt</td>
              <td className="py-2 text-right text-lg font-bold tabular-nums text-[hsl(var(--brand-pink))]">
                {formatEuro(total)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Status-Footer */}
      {payout && (
        <footer className="mt-8 text-[11px] text-zinc-500">
          {payout.status === "ausgezahlt" ? (
            <p>
              Ausgezahlt am{" "}
              {payout.ausgezahlt_am
                ? formatDatum(payout.ausgezahlt_am)
                : "—"}
              {payout.ausgezahlt_via && ` per ${payout.ausgezahlt_via}`}
              {payout.ausgezahlt_note && ` · ${payout.ausgezahlt_note}`}
            </p>
          ) : (
            <p>Status: {payout.status}</p>
          )}
          <p className="mt-1">
            Abgerechnet am {formatDatum(payout.locked_at)}
            {payout.locked_by_name && ` von ${payout.locked_by_name}`}
          </p>
        </footer>
      )}
    </div>
  );
}
