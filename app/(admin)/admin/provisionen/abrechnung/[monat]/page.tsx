import Link from "next/link";
import { ArrowLeft, Banknote, FileText, Lock, Printer, ShieldAlert, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { StatusPill } from "@/components/admin/StatusPill";
import { requireRole } from "@/lib/auth";
import {
  formatEuro,
  ladeAbrechnungsVorschau,
  ladePayouts,
} from "@/lib/provisionen";
import { formatDatum } from "@/lib/format";
import { monatEntsperren, monatLocken } from "../actions";
import { AuszahlungForm } from "./AuszahlungForm";

function monatsLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split("-").map(Number);
  const monate = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ];
  return `${monate[m - 1]} ${y}`;
}

export default async function AbrechnungDetailPage({
  params,
}: {
  params: Promise<{ monat: string }>;
}) {
  const profile = await requireRole(["admin", "superadmin"]);
  const { monat } = await params;

  if (!/^\d{4}-\d{2}$/.test(monat)) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6">
        Ungültiger Monat.
      </div>
    );
  }

  const [payouts, vorschau] = await Promise.all([
    ladePayouts({ monatYYYYMM: monat }),
    ladeAbrechnungsVorschau(monat),
  ]);

  const istGelocked = payouts.length > 0;
  const istSuperadmin = profile.role === "superadmin";

  // Total
  const total = istGelocked
    ? payouts.reduce((s, p) => s + p.total, 0)
    : vorschau.reduce((s, v) => s + v.total, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Provisionen", href: "/admin/provisionen" },
          { label: "Abrechnung", href: "/admin/provisionen/abrechnung" },
          { label: monatsLabel(monat) },
        ]}
        eyebrow="Verkauf"
        title={`Abrechnung ${monatsLabel(monat)}`}
        description={
          istGelocked
            ? "Monat ist abgerechnet. Werte sind gefroren — Eintrags-Änderungen blockiert."
            : "Vorschau pro Vertriebler:in. Sperren lockt den Monat → ab dann unveränderlich."
        }
      />

      <Link
        href="/admin/provisionen/abrechnung"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Übersicht
      </Link>

      {/* Status-Banner */}
      {istGelocked ? (
        <div className="flex items-start justify-between gap-4 rounded-xl border-2 border-[hsl(var(--brand-pink)/0.4)] bg-[hsl(var(--brand-pink)/0.05)] px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--brand-pink))] text-[hsl(var(--primary-foreground))]">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                {monatsLabel(monat)} ist abgerechnet
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Gesamtsumme: <strong>{formatEuro(total)}</strong> ·
                {payouts.length}{" "}
                {payouts.length === 1
                  ? "Vertriebler:in"
                  : "Vertriebler:innen"}{" "}
                · gesperrt am {formatDatum(payouts[0].locked_at)}
                {payouts[0].locked_by_name &&
                  ` von ${payouts[0].locked_by_name}`}
              </p>
            </div>
          </div>
          {istSuperadmin && (
            <form action={monatEntsperren.bind(null, monat)}>
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Monat entsperren
              </Button>
            </form>
          )}
        </div>
      ) : vorschau.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          Keine genehmigten Abschlüsse in {monatsLabel(monat)}. Sperren ist
          erst sinnvoll, wenn mindestens ein Vertriebler etwas im Monat
          hat.
        </div>
      ) : (
        <form action={monatLocken}>
          <input type="hidden" name="monat_yyyymm" value={monat} />
          <div className="flex items-start justify-between gap-4 rounded-xl border-2 border-amber-300 bg-amber-50 px-5 py-4 dark:border-amber-700 dark:bg-amber-950/30">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">
                  Bereit zum Abschließen
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Vorschau-Total: <strong>{formatEuro(total)}</strong> ·
                  {vorschau.length}{" "}
                  {vorschau.length === 1
                    ? "Vertriebler:in"
                    : "Vertriebler:innen"}.
                  Nach dem Sperren sind diese Beträge endgültig.
                </p>
              </div>
            </div>
            <Button type="submit" className="gap-2">
              <Lock className="h-4 w-4" />
              Monat abschließen
            </Button>
          </div>
        </form>
      )}

      {/* Tabelle */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <Th>Vertriebler:in</Th>
              <Th align="right">Abschlüsse</Th>
              <Th align="right">Provision</Th>
              <Th align="right">Bonus</Th>
              <Th align="right">Total</Th>
              <Th>{istGelocked ? "Auszahlung" : "Bonus-Stufe"}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {istGelocked
              ? payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <Td>
                      <div className="flex items-center gap-2">
                        <ColoredAvatar
                          name={p.vertriebler_name}
                          size="sm"
                        />
                        <span className="font-medium">
                          {p.vertriebler_name ?? "—"}
                        </span>
                      </div>
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {p.abschluesse_anzahl}
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {formatEuro(p.provision_summe)}
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {p.bonus_summe > 0 ? (
                        <span className="text-[hsl(var(--brand-pink))]">
                          +{formatEuro(p.bonus_summe)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td align="right" className="tabular-nums">
                      <strong>{formatEuro(p.total)}</strong>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <AuszahlungForm
                          payoutId={p.id}
                          istAusgezahlt={p.status === "ausgezahlt"}
                          ausgezahltAm={p.ausgezahlt_am}
                          ausgezahltVia={p.ausgezahlt_via}
                          ausgezahltNote={p.ausgezahlt_note}
                        />
                        <Link
                          href={`/admin/provisionen/abrechnung/${monat}/${p.vertriebler_id}`}
                          target="_blank"
                          title="Detail-PDF (Druckansicht)"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-[hsl(var(--brand-pink)/0.5)] hover:text-foreground"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </Td>
                  </tr>
                ))
              : vorschau.map((v) => (
                  <tr key={v.vertriebler_id} className="hover:bg-muted/30">
                    <Td>
                      <div className="flex items-center gap-2">
                        <ColoredAvatar
                          name={v.vertriebler_name}
                          size="sm"
                        />
                        <span className="font-medium">
                          {v.vertriebler_name ?? "—"}
                        </span>
                      </div>
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {v.abschluesse_anzahl}
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {formatEuro(v.provision_summe)}
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {v.bonus_summe > 0 ? (
                        <span className="text-[hsl(var(--brand-pink))]">
                          +{formatEuro(v.bonus_summe)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td align="right" className="tabular-nums">
                      <strong>{formatEuro(v.total)}</strong>
                    </Td>
                    <Td>
                      {v.bonus_stufe_info ? (
                        <span className="text-xs text-muted-foreground">
                          {v.bonus_stufe_info}
                        </span>
                      ) : (
                        <StatusPill ton="neutral">Vorschau</StatusPill>
                      )}
                    </Td>
                  </tr>
                ))}
          </tbody>
          <tfoot className="bg-muted/40">
            <tr>
              <Td colSpan={4}>
                <span className="font-bold uppercase tracking-wider text-[10px]">
                  Total {monatsLabel(monat)}
                </span>
              </Td>
              <Td align="right" className="tabular-nums">
                <span className="text-base font-bold text-[hsl(var(--brand-pink))]">
                  {formatEuro(total)}
                </span>
              </Td>
              <Td>
                {istGelocked && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      title="Alle Einträge als CSV"
                    >
                      <a href={`/api/admin/provisionen/csv?monat=${monat}`}>
                        <Banknote className="h-3.5 w-3.5" />
                        Einträge-CSV
                      </a>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      title="Eine Zeile pro Vertriebler:in für Lohnbuchhaltung"
                    >
                      <a
                        href={`/api/admin/provisionen/lohn-csv?monat=${monat}`}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Lohn-CSV
                      </a>
                    </Button>
                  </div>
                )}
              </Td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  align,
}: {
  children?: React.ReactNode;
  align?: "right";
}) {
  return (
    <th
      className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
  colSpan,
  className,
}: {
  children?: React.ReactNode;
  align?: "right";
  colSpan?: number;
  className?: string;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"} ${
        className ?? ""
      }`}
    >
      {children}
    </td>
  );
}
