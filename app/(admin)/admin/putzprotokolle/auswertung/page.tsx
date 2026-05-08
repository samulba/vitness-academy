import Link from "next/link";
import {
  Camera,
  ClipboardCheck,
  MapPin,
  Printer,
  Sparkles,
  Wrench,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ladeStandorte } from "@/lib/standorte";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { PutzprotokolleNav } from "@/components/admin/PutzprotokolleNav";
import { AktivitaetsHeatmap } from "@/components/charts/AktivitaetsHeatmap";
import { AufgabenComplianceChart } from "@/components/charts/AufgabenComplianceChart";
import { TopVergessenChart } from "@/components/charts/TopVergessenChart";
import { TagesverlaufChart } from "@/components/charts/TagesverlaufChart";
import {
  auswertungZeitraum,
  rangeAusKey,
  type RangeKey,
} from "@/lib/putzprotokoll_stats";
import { formatDatum } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RangeFilter } from "./RangeFilter";

export const dynamic = "force-dynamic";

const VALID_RANGES: RangeKey[] = ["week", "30days", "90days", "year", "custom"];

export default async function AuswertungPage({
  searchParams,
}: {
  searchParams: Promise<{
    range?: string;
    von?: string;
    bis?: string;
    locationId?: string;
  }>;
}) {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const standorte = await ladeStandorte();
  const sp = await searchParams;

  // Aktiv-Standort: aus URL-Param oder erster verfuegbarer Standort.
  // KEIN Fallback auf Topbar-Switcher — Admin soll immer alle Studios
  // sehen koennen, der Switcher hat hier keine Bedeutung.
  const aktiv =
    standorte.find((s) => s.id === sp.locationId) ?? standorte[0] ?? null;

  const rangeKey: RangeKey = (VALID_RANGES as string[]).includes(
    sp.range ?? "",
  )
    ? (sp.range as RangeKey)
    : "30days";
  const { vonDatum, bisDatum } = rangeAusKey(rangeKey, {
    von: sp.von,
    bis: sp.bis,
  });

  const bundle = await auswertungZeitraum({
    locationId: aktiv?.id ?? null,
    vonDatum,
    bisDatum,
  });

  const printHref = `/admin/putzprotokolle/auswertung/print?von=${vonDatum}&bis=${bisDatum}${
    aktiv ? `&locationId=${aktiv.id}` : ""
  }`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio · Putzprotokoll"
        title="Auswertung"
        description={`Compliance-Stats ${
          aktiv ? `· ${aktiv.name}` : "(alle Standorte)"
        }. Zeitraum ${formatDatum(vonDatum)} – ${formatDatum(bisDatum)}.`}
        primaryAction={{
          label: "Compliance-Report",
          icon: <Printer />,
          href: printHref,
        }}
      />
      <PutzprotokolleNav />

      {/* Standort-Picker — nur wenn mehrere Standorte existieren.
       *  URL-Param ?locationId=, default: erster verfuegbarer Standort. */}
      {standorte.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Standort
          </span>
          {standorte.map((s) => {
            const linkRange = sp.range ? `&range=${sp.range}` : "";
            const linkVon = sp.von ? `&von=${sp.von}` : "";
            const linkBis = sp.bis ? `&bis=${sp.bis}` : "";
            return (
              <Link
                key={s.id}
                href={`?locationId=${s.id}${linkRange}${linkVon}${linkBis}`}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  aktiv?.id === s.id
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                {s.name}
              </Link>
            );
          })}
        </div>
      )}

      <RangeFilter
        aktivRange={rangeKey}
        aktivVon={rangeKey === "custom" ? sp.von ?? vonDatum : vonDatum}
        aktivBis={rangeKey === "custom" ? sp.bis ?? bisDatum : bisDatum}
      />

      {!aktiv && (
        <div className="rounded-xl border border-[hsl(var(--brand-pink)/0.4)] bg-[hsl(var(--brand-pink)/0.06)] px-4 py-3 text-xs text-muted-foreground">
          <span className="font-semibold text-[hsl(var(--brand-pink))]">
            Hinweis:
          </span>{" "}
          Noch keine Standorte angelegt.
        </div>
      )}

      <StatGrid cols={4}>
        <StatCard
          label="Abdeckung"
          value={`${bundle.protokolleAnzahl} / ${bundle.tageImRange}`}
          icon={<ClipboardCheck />}
          trend={
            bundle.tageImRange > 0
              ? {
                  value: Math.round(bundle.abdeckungQuote * 100),
                  direction: bundle.abdeckungQuote >= 0.8 ? "up" : "down",
                  hint: "Tage mit Protokoll",
                }
              : undefined
          }
        />
        <StatCard
          label="Aufgaben-Quote"
          value={`${Math.round(bundle.aufgabenQuote * 100)}%`}
          icon={<Sparkles />}
          trend={
            bundle.protokolleAnzahl > 0
              ? {
                  value: Math.round(bundle.aufgabenQuote * 100),
                  direction: bundle.aufgabenQuote >= 0.85 ? "up" : "down",
                  hint: "Ø erledigt",
                }
              : undefined
          }
        />
        <StatCard
          label="Mängel gemeldet"
          value={bundle.maengelTotal}
          icon={<Wrench />}
        />
        <StatCard
          label="Photos"
          value={bundle.photosTotal}
          icon={<Camera />}
        />
      </StatGrid>

      {/* Compliance pro Bereich */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Compliance pro Bereich
          </h2>
          <span className="text-[11px] text-muted-foreground">
            % der Aufgaben die im Schnitt erledigt wurden
          </span>
        </div>
        <AufgabenComplianceChart data={bundle.bereicheCompliance} />
      </section>

      {/* Top vergessene Aufgaben */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Top vergessene Aufgaben
          </h2>
          <span className="text-[11px] text-muted-foreground">
            Häufigkeit nicht-erledigter Aufgaben (Top 10)
          </span>
        </div>
        <TopVergessenChart data={bundle.topVergessen} />
      </section>

      {/* Tagesverlauf */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Tagesverlauf
          </h2>
          <span className="text-[11px] text-muted-foreground">
            Aufgaben-Quote pro Tag
          </span>
        </div>
        <TagesverlaufChart data={bundle.tagesverlauf} />
      </section>

      {/* Mängel-Heatmap */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Mängel-Aktivität
          </h2>
          <span className="text-[11px] text-muted-foreground">
            Letzte 52 Wochen — Tage mit gemeldeten Mängeln
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <AktivitaetsHeatmap
            data={bundle.maengelHeatmap}
            beschriftung="Mängel pro Tag"
          />
        </div>
      </section>

      <div className="flex items-center justify-end">
        <Link
          href={printHref}
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.5)] transition-all hover:bg-[hsl(var(--primary)/0.9)]"
        >
          <Printer className="h-4 w-4" />
          Als Compliance-Report exportieren
        </Link>
      </div>
    </div>
  );
}
