import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { auswertungZeitraum } from "@/lib/putzprotokoll_stats";
import { formatDatum, formatDatumUhrzeitBerlin } from "@/lib/format";
import { Logo } from "@/components/brand/Logo";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function ComplianceReportPrint({
  searchParams,
}: {
  searchParams: Promise<{
    locationId?: string;
    von?: string;
    bis?: string;
  }>;
}) {
  await requirePermission("putzprotokolle", "view");
  const sp = await searchParams;
  if (!sp.locationId || !sp.von || !sp.bis) notFound();

  const supabase = await createClient();
  const { data: location } = await supabase
    .from("locations")
    .select("name")
    .eq("id", sp.locationId)
    .maybeSingle();
  if (!location) notFound();

  const bundle = await auswertungZeitraum({
    locationId: sp.locationId,
    vonDatum: sp.von,
    bisDatum: sp.bis,
  });

  return (
    <main className="theme-light-locked min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-10 print:py-0">
        {/* Print-Toolbar (im Print versteckt) */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Logo size={28} />
            <span className="font-semibold">Vitness Crew</span>
            <span>· Compliance-Report</span>
          </div>
          <PrintButton />
        </div>

        {/* Header */}
        <header className="border-b-2 border-foreground pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
                Compliance-Report
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                Putzprotokoll · {location.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Zeitraum {formatDatum(sp.von)} – {formatDatum(sp.bis)} ·{" "}
                {bundle.tageImRange} Tage
              </p>
            </div>
            <Logo size={44} />
          </div>
        </header>

        {/* Stat-Cards */}
        <section className="mt-6 grid grid-cols-2 gap-3 break-inside-avoid sm:grid-cols-4">
          <Stat
            label="Abdeckung"
            value={`${bundle.protokolleAnzahl} / ${bundle.tageImRange}`}
            sub={`${Math.round(bundle.abdeckungQuote * 100)}%`}
          />
          <Stat
            label="Aufgaben-Quote"
            value={`${Math.round(bundle.aufgabenQuote * 100)}%`}
            sub={
              bundle.aufgabenQuote >= 0.85
                ? "Sehr gut"
                : bundle.aufgabenQuote >= 0.7
                ? "OK"
                : "Verbesserung nötig"
            }
          />
          <Stat label="Mängel gemeldet" value={bundle.maengelTotal} />
          <Stat label="Fotos" value={bundle.photosTotal} />
        </section>

        {/* Tabelle: Compliance pro Bereich */}
        <section className="mt-8 break-inside-avoid">
          <h2 className="text-base font-bold tracking-tight">
            Aufgaben-Compliance pro Bereich
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Anteil der Aufgaben die im Schnitt erledigt wurden
          </p>
          <table className="mt-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-foreground text-left">
                <th className="py-1.5 pr-2 font-semibold">Bereich</th>
                <th className="py-1.5 pr-2 text-right font-semibold">
                  Aufgaben gesamt
                </th>
                <th className="py-1.5 pr-2 text-right font-semibold">
                  Erledigt
                </th>
                <th className="py-1.5 text-right font-semibold">Quote</th>
              </tr>
            </thead>
            <tbody>
              {bundle.bereicheCompliance.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 text-center italic text-muted-foreground"
                  >
                    Keine Daten im Zeitraum.
                  </td>
                </tr>
              ) : (
                bundle.bereicheCompliance.map((b) => (
                  <tr key={b.titel} className="border-b border-border">
                    <td className="py-2 pr-2">{b.titel}</td>
                    <td className="py-2 pr-2 text-right tabular-nums">
                      {b.total}
                    </td>
                    <td className="py-2 pr-2 text-right tabular-nums">
                      {b.erledigt}
                    </td>
                    <td className="py-2 text-right font-semibold tabular-nums">
                      {b.quote >= 0
                        ? `${Math.round(b.quote * 100)}%`
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* Tabelle: Top vergessene Aufgaben */}
        <section className="mt-8 break-inside-avoid">
          <h2 className="text-base font-bold tracking-tight">
            Top 10 vergessene Aufgaben
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Aufgaben die im Zeitraum am häufigsten nicht abgehakt wurden
          </p>
          <table className="mt-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-foreground text-left">
                <th className="py-1.5 pr-2 font-semibold">Aufgabe</th>
                <th className="py-1.5 pr-2 font-semibold">Bereich</th>
                <th className="py-1.5 text-right font-semibold">Anzahl</th>
              </tr>
            </thead>
            <tbody>
              {bundle.topVergessen.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-4 text-center italic text-muted-foreground"
                  >
                    Keine vergessenen Aufgaben — alles erledigt.
                  </td>
                </tr>
              ) : (
                bundle.topVergessen.map((t, i) => (
                  <tr key={`${t.bereich}-${t.aufgabe}`} className="border-b border-border">
                    <td className="py-2 pr-2">
                      <span className="mr-2 font-mono text-xs text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {t.aufgabe}
                    </td>
                    <td className="py-2 pr-2 text-muted-foreground">
                      {t.bereich}
                    </td>
                    <td className="py-2 text-right font-semibold tabular-nums">
                      {t.anzahl}×
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <footer className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
          Erstellt mit Vitness Crew · {location.name} · Stand{" "}
          {formatDatumUhrzeitBerlin(new Date())}
        </footer>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 1.5cm; }
          html, body { background: white !important; }
          section { page-break-inside: avoid; }
        }
      `}</style>
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold leading-none tabular-nums">
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}
