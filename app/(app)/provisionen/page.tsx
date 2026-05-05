import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { requireProfile } from "@/lib/auth";
import {
  aggregiere,
  formatEuro,
  ladeBonusStufen,
  ladeEntries,
  ladeMonatsHistorie,
  ladePayouts,
  ladeRates,
  ladeTarget,
  laufzeitLabel,
  PAYOUT_STATUS_LABEL,
  STATUS_LABEL,
  type EntryStatus,
} from "@/lib/provisionen";
import { StatusPill } from "@/components/admin/StatusPill";
import { formatDatum } from "@/lib/format";
import { MonatsTrend } from "@/components/provisionen/MonatsTrend";
import { TargetTracker } from "@/components/provisionen/TargetTracker";
import { BonusStatus } from "@/components/provisionen/BonusStatus";
import { AbschlussForm } from "./AbschlussForm";
import { LoeschenButton } from "./LoeschenButton";

function StatusBadge({ status }: { status: EntryStatus }) {
  if (status === "eingereicht")
    return (
      <StatusPill ton="warn" dot>
        {STATUS_LABEL[status]}
      </StatusPill>
    );
  if (status === "genehmigt")
    return (
      <StatusPill ton="success" dot>
        {STATUS_LABEL[status]}
      </StatusPill>
    );
  if (status === "abgelehnt")
    return <StatusPill ton="danger">{STATUS_LABEL[status]}</StatusPill>;
  return <StatusPill ton="neutral">{STATUS_LABEL[status]}</StatusPill>;
}

function aktuellerMonat(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monatsLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split("-").map(Number);
  const monate = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ];
  return `${monate[m - 1]} ${y}`;
}

function letzteMonate(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

export default async function ProvisionenPage({
  searchParams,
}: {
  searchParams: Promise<{ monat?: string }>;
}) {
  const profile = await requireProfile();
  if (!profile.kann_provisionen) redirect("/dashboard");

  const sp = await searchParams;
  const monat = sp.monat?.match(/^\d{4}-\d{2}$/) ? sp.monat : aktuellerMonat();

  const [entries, rates, historie, bonusStufen, payouts] = await Promise.all([
    ladeEntries({ vertrieblerId: profile.id, monatYYYYMM: monat }),
    ladeRates(),
    ladeMonatsHistorie(profile.id, 6),
    ladeBonusStufen(),
    ladePayouts({ vertrieblerId: profile.id }),
  ]);
  const stats = aggregiere(entries);

  // Auch aktueller Monat-Total, falls anderer Monat gewählt
  const aktMonth = aktuellerMonat();
  const aktEntries =
    monat === aktMonth
      ? entries
      : await ladeEntries({ vertrieblerId: profile.id, monatYYYYMM: aktMonth });
  const aktStats = aggregiere(aktEntries);

  // Target für aktuellen Monat (oder gewählten Monat)
  const target = await ladeTarget(profile.id, monat);

  const monateOptions = letzteMonate(12);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Verkauf"
        title="Provisionen"
        description="Abschlüsse eintragen, Provision wird automatisch aus den aktuellen Sätzen berechnet."
      />

      {/* Dashboard: Trend + Target + Bonus-Status */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-border bg-card p-5">
          <header className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-tight">
              Provisions-Trend (6 Monate)
            </h2>
            <span className="text-[11px] text-muted-foreground">
              Magenta-Balken = ausgezahlte Provision
            </span>
          </header>
          <MonatsTrend daten={historie} modus="provision" />
        </div>
        <div className="space-y-4">
          {target && (
            <TargetTracker
              target={target}
              istProvision={stats.provision_total}
              istAbschluesse={stats.abschluesse}
            />
          )}
          <BonusStatus
            abschluesseAktuell={aktStats.abschluesse}
            monatYYYYMM={aktMonth}
            vertrieblerId={profile.id}
            stufen={bonusStufen}
          />
        </div>
      </section>

      <StatGrid cols={3}>
        <StatCard
          label={`${monatsLabel(monat)} · Abschlüsse`}
          value={stats.abschluesse}
          icon={<Receipt />}
        />
        <StatCard
          label={`${monatsLabel(monat)} · Provision`}
          value={formatEuro(stats.provision_total)}
          icon={<TrendingUp />}
        />
        <StatCard
          label="Aktueller Monat"
          value={formatEuro(aktStats.provision_total)}
          icon={<CheckCircle2 />}
        />
      </StatGrid>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <header className="mb-5">
          <h2 className="text-base font-semibold tracking-tight">
            Neuer Abschluss
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Provision wird live in der Vorschau berechnet.
          </p>
        </header>
        <AbschlussForm rates={rates} />
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight">
            {monatsLabel(monat)}
          </h2>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {monateOptions.map((m) => {
              const aktiv = m === monat;
              return (
                <Link
                  key={m}
                  href={`/provisionen?monat=${m}`}
                  className={
                    aktiv
                      ? "rounded-full bg-[hsl(var(--primary))] px-3 py-1 font-medium text-[hsl(var(--primary-foreground))]"
                      : "rounded-full border border-border bg-card px-3 py-1 font-medium text-muted-foreground hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground"
                  }
                >
                  {monatsLabel(m)}
                </Link>
              );
            })}
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <Receipt className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="mt-3 text-sm font-medium">
              Keine Abschlüsse in {monatsLabel(monat)}
            </p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Trag deinen ersten Abschluss oben ein.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <Th>Datum</Th>
                    <Th>Mitglied</Th>
                    <Th>Status</Th>
                    <Th align="right">Laufzeit</Th>
                    <Th align="right">Beitrag Netto</Th>
                    <Th align="right">Startpaket</Th>
                    <Th align="right">Provision</Th>
                    <Th align="right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entries.map((e) => (
                    <tr
                      key={e.id}
                      className={
                        e.status === "abgelehnt" || e.status === "storniert"
                          ? "bg-muted/20 hover:bg-muted/30"
                          : "hover:bg-muted/30"
                      }
                    >
                      <Td>{formatDatum(e.datum)}</Td>
                      <Td>
                        <span className="font-medium">{e.mitglied_name}</span>
                        {e.mitglied_nummer && (
                          <span className="ml-1 text-[11px] text-muted-foreground">
                            · {e.mitglied_nummer}
                          </span>
                        )}
                        {e.review_note && (
                          <span
                            title={e.review_note}
                            className="ml-1 cursor-help text-[11px] text-muted-foreground underline decoration-dotted"
                          >
                            · Notiz
                          </span>
                        )}
                      </Td>
                      <Td>
                        <StatusBadge status={e.status} />
                      </Td>
                      <Td align="right">{laufzeitLabel(e.laufzeit)}</Td>
                      <Td align="right">{formatEuro(e.beitrag_netto)}</Td>
                      <Td align="right">{formatEuro(e.startpaket)}</Td>
                      <Td align="right">
                        <span
                          className={
                            e.status === "genehmigt"
                              ? "font-bold text-[hsl(var(--brand-pink))]"
                              : e.status === "abgelehnt"
                                ? "text-muted-foreground line-through"
                                : "text-muted-foreground"
                          }
                        >
                          {formatEuro(e.provision)}
                        </span>
                      </Td>
                      <Td align="right">
                        {e.status === "eingereicht" ? (
                          <LoeschenButton id={e.id} />
                        ) : (
                          <span className="text-[11px] text-muted-foreground/50">
                            —
                          </span>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/40">
                  <tr>
                    <Td colSpan={6}>
                      <span className="font-bold uppercase tracking-wider text-[10px]">
                        Total {monatsLabel(monat)} · genehmigt
                      </span>
                    </Td>
                    <Td align="right">
                      <span className="text-base font-bold text-[hsl(var(--brand-pink))]">
                        {formatEuro(stats.provision_total)}
                      </span>
                    </Td>
                    <Td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Payouts/Auszahlungen-Historie */}
      {payouts.length > 0 && (
        <section>
          <header className="mb-3">
            <h2 className="text-base font-semibold tracking-tight">
              Meine Auszahlungen
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Abgerechnete Monate und ihr Auszahlungsstatus.
            </p>
          </header>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {payouts.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-3 px-5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {monatsLabel(p.monat_yyyymm)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {p.abschluesse_anzahl}{" "}
                    {p.abschluesse_anzahl === 1
                      ? "Abschluss"
                      : "Abschlüsse"}{" "}
                    · Provision {formatEuro(p.provision_summe)}
                    {p.bonus_summe > 0 && (
                      <span className="text-[hsl(var(--brand-pink))]">
                        {" "}
                        + Bonus {formatEuro(p.bonus_summe)}
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-base font-bold text-[hsl(var(--brand-pink))] tabular-nums">
                  {formatEuro(p.total)}
                </span>
                {p.status === "ausgezahlt" ? (
                  <StatusPill ton="success" dot>
                    {p.ausgezahlt_am
                      ? `Ausgezahlt ${formatDatum(p.ausgezahlt_am)}`
                      : PAYOUT_STATUS_LABEL[p.status]}
                  </StatusPill>
                ) : (
                  <StatusPill ton="warn" dot>
                    {PAYOUT_STATUS_LABEL[p.status]}
                  </StatusPill>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
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
}: {
  children?: React.ReactNode;
  align?: "right";
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"}`}
    >
      {children}
    </td>
  );
}
