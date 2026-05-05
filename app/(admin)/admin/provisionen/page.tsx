import Link from "next/link";
import { Inbox, Receipt, Settings, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/admin/StatusPill";
import { requireRole } from "@/lib/auth";
import {
  aggregiere,
  formatEuro,
  ladeAusstehend,
  ladeEntries,
  ladeVertriebler,
  laufzeitLabel,
  STATUS_LABEL,
  type EntryStatus,
} from "@/lib/provisionen";
import { getAktiverStandort } from "@/lib/standort-context";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { formatDatum } from "@/lib/format";
import { LoeschenButton } from "./LoeschenButton";
import { StornoButton } from "./StornoButton";

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
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

export default async function ProvisionenAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    monat?: string;
    vertriebler?: string;
    status?: string;
  }>;
}) {
  await requireRole(["admin", "superadmin"]);
  const sp = await searchParams;
  const monat = sp.monat?.match(/^\d{4}-\d{2}$/) ? sp.monat : aktuellerMonat();
  const vertrieblerFilter = sp.vertriebler ?? null;
  const statusFilter = (
    ["eingereicht", "genehmigt", "abgelehnt", "storniert"].includes(
      sp.status ?? "",
    )
      ? sp.status
      : null
  ) as EntryStatus | null;
  const aktiv = await getAktiverStandort();

  const [vertriebler, entries, ausstehend] = await Promise.all([
    ladeVertriebler(),
    ladeEntries({
      monatYYYYMM: monat,
      vertrieblerId: vertrieblerFilter ?? undefined,
      locationId: aktiv?.id ?? null,
      status: statusFilter ? [statusFilter] : undefined,
    }),
    ladeAusstehend({ locationId: aktiv?.id ?? null }),
  ]);
  const stats = aggregiere(entries);

  // Provision pro Vertriebler -- nur 'genehmigt'-Einträge zaehlen
  const proVertriebler = new Map<
    string,
    { name: string | null; abschluesse: number; provision: number }
  >();
  for (const e of entries) {
    if (e.status !== "genehmigt") continue;
    const delta = e.storno_von_id ? -1 : 1;
    const cur = proVertriebler.get(e.vertriebler_id);
    if (cur) {
      cur.abschluesse += delta;
      cur.provision += e.provision;
    } else {
      proVertriebler.set(e.vertriebler_id, {
        name: e.vertriebler_name,
        abschluesse: delta,
        provision: e.provision,
      });
    }
  }
  const ranking = Array.from(proVertriebler.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.provision - a.provision);

  const monateOptions = letzteMonate(12);
  const statusFilterOptionen: { key: EntryStatus | "alle"; label: string }[] =
    [
      { key: "alle", label: "Alle" },
      { key: "eingereicht", label: "Eingereicht" },
      { key: "genehmigt", label: "Genehmigt" },
      { key: "abgelehnt", label: "Abgelehnt" },
      { key: "storniert", label: "Storniert" },
    ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Verkauf"
        title="Provisionen"
        description='Alle Abschlüsse pro Monat. Sätze pflegst du unter „Sätze konfigurieren".'
        primaryAction={{
          label: "Sätze konfigurieren",
          icon: <Settings />,
          href: "/admin/provisionen/saetze",
        }}
        secondaryActions={[
          {
            icon: <Inbox />,
            label:
              ausstehend.length > 0
                ? `Inbox (${ausstehend.length})`
                : "Inbox",
            href: "/admin/provisionen/inbox",
          },
        ]}
      />

      {ausstehend.length > 0 && (
        <Link
          href="/admin/provisionen/inbox"
          className="flex items-center justify-between gap-3 rounded-xl border-2 border-[hsl(var(--brand-pink)/0.4)] bg-[hsl(var(--brand-pink)/0.06)] px-5 py-3 transition-colors hover:bg-[hsl(var(--brand-pink)/0.1)]"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--brand-pink))] text-[hsl(var(--primary-foreground))]">
              <Inbox className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                {ausstehend.length}{" "}
                {ausstehend.length === 1 ? "Abschluss wartet" : "Abschlüsse warten"}{" "}
                auf Genehmigung
              </p>
              <p className="text-xs text-muted-foreground">
                Klick öffnet die Inbox.
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-[hsl(var(--brand-pink))]">
            Inbox öffnen →
          </span>
        </Link>
      )}

      <StatGrid cols={3}>
        <StatCard
          label={`${monatsLabel(monat)} · Abschlüsse`}
          value={stats.abschluesse}
          icon={<Receipt />}
        />
        <StatCard
          label={`${monatsLabel(monat)} · Provision Total`}
          value={formatEuro(stats.provision_total)}
          icon={<TrendingUp />}
        />
        <StatCard
          label="Aktive Vertriebler"
          value={vertriebler.length}
          icon={<Users />}
        />
      </StatGrid>

      {/* Filter */}
      <section className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {monateOptions.map((m) => {
            const aktivMonat = m === monat;
            const params = new URLSearchParams();
            params.set("monat", m);
            if (vertrieblerFilter) params.set("vertriebler", vertrieblerFilter);
            return (
              <Link
                key={m}
                href={`/admin/provisionen?${params.toString()}`}
                className={
                  aktivMonat
                    ? "rounded-full bg-[hsl(var(--primary))] px-3 py-1 text-xs font-medium text-[hsl(var(--primary-foreground))]"
                    : "rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground"
                }
              >
                {monatsLabel(m)}
              </Link>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={`/admin/provisionen?monat=${monat}`}
            className={
              !vertrieblerFilter
                ? "rounded-full bg-[hsl(var(--primary))] px-3 py-1 text-xs font-medium text-[hsl(var(--primary-foreground))]"
                : "rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground"
            }
          >
            Alle Vertriebler
          </Link>
          {vertriebler.map((v) => (
            <Link
              key={v.id}
              href={`/admin/provisionen?monat=${monat}&vertriebler=${v.id}`}
              className={
                vertrieblerFilter === v.id
                  ? "rounded-full bg-[hsl(var(--primary))] px-3 py-1 text-xs font-medium text-[hsl(var(--primary-foreground))]"
                  : "rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground"
              }
            >
              {v.full_name ?? "Unbekannt"}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {statusFilterOptionen.map((s) => {
            const istAktiv =
              (s.key === "alle" && !statusFilter) || s.key === statusFilter;
            const params = new URLSearchParams();
            params.set("monat", monat);
            if (vertrieblerFilter) params.set("vertriebler", vertrieblerFilter);
            if (s.key !== "alle") params.set("status", s.key);
            return (
              <Link
                key={s.key}
                href={`/admin/provisionen?${params.toString()}`}
                className={
                  istAktiv
                    ? "rounded-full bg-[hsl(var(--primary))] px-3 py-1 text-xs font-medium text-[hsl(var(--primary-foreground))]"
                    : "rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground"
                }
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Ranking */}
      {ranking.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <header className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold tracking-tight">
              Ranking {monatsLabel(monat)}
            </h2>
          </header>
          <ul className="divide-y divide-border">
            {ranking.map((r, i) => (
              <li
                key={r.id}
                className="flex items-center gap-4 px-5 py-3"
              >
                <span className="w-6 text-center text-xs font-bold tabular-nums text-muted-foreground">
                  {i + 1}.
                </span>
                <ColoredAvatar name={r.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{r.name ?? "—"}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.abschluesse}{" "}
                    {r.abschluesse === 1 ? "Abschluss" : "Abschlüsse"}
                  </p>
                </div>
                <span className="text-base font-bold text-[hsl(var(--brand-pink))] tabular-nums">
                  {formatEuro(r.provision)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Eintraege-Tabelle */}
      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <Receipt className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" />
          <p className="mt-3 text-sm font-medium">
            Keine Abschlüsse in {monatsLabel(monat)}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <Th>Datum</Th>
                  <Th>Vertriebler</Th>
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
                        ? "bg-muted/20 hover:bg-muted/40"
                        : "hover:bg-muted/30"
                    }
                  >
                    <Td>{formatDatum(e.datum)}</Td>
                    <Td>
                      <span className="text-xs">
                        {e.vertriebler_name ?? "—"}
                      </span>
                    </Td>
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
                      <div className="flex items-center justify-end gap-1.5">
                        {e.status === "genehmigt" && !e.storno_von_id && (
                          <StornoButton id={e.id} />
                        )}
                        <LoeschenButton id={e.id} />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/40">
                <tr>
                  <Td colSpan={7}>
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

      <div className="flex justify-end">
        <Button asChild variant="outline" className="h-9 rounded-lg">
          <a href={`/api/admin/provisionen/csv?monat=${monat}`}>
            CSV exportieren
          </a>
        </Button>
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
