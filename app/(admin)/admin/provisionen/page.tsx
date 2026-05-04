import Link from "next/link";
import { Receipt, Settings, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import {
  aggregiere,
  formatEuro,
  ladeEntries,
  ladeVertriebler,
  laufzeitLabel,
} from "@/lib/provisionen";
import { getAktiverStandort } from "@/lib/standort-context";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { formatDatum } from "@/lib/format";
import { LoeschenButton } from "./LoeschenButton";

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
  searchParams: Promise<{ monat?: string; vertriebler?: string }>;
}) {
  await requireRole(["admin", "superadmin"]);
  const sp = await searchParams;
  const monat = sp.monat?.match(/^\d{4}-\d{2}$/) ? sp.monat : aktuellerMonat();
  const vertrieblerFilter = sp.vertriebler ?? null;
  const aktiv = await getAktiverStandort();

  const [vertriebler, entries] = await Promise.all([
    ladeVertriebler(),
    ladeEntries({
      monatYYYYMM: monat,
      vertrieblerId: vertrieblerFilter ?? undefined,
      locationId: aktiv?.id ?? null,
    }),
  ]);
  const stats = aggregiere(entries);

  // Provision pro Vertriebler in dem Monat
  const proVertriebler = new Map<
    string,
    { name: string | null; abschluesse: number; provision: number }
  >();
  for (const e of entries) {
    const cur = proVertriebler.get(e.vertriebler_id);
    if (cur) {
      cur.abschluesse += 1;
      cur.provision += e.provision;
    } else {
      proVertriebler.set(e.vertriebler_id, {
        name: e.vertriebler_name,
        abschluesse: 1,
        provision: e.provision,
      });
    }
  }
  const ranking = Array.from(proVertriebler.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.provision - a.provision);

  const monateOptions = letzteMonate(12);

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
      />

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
                  <Th align="right">Laufzeit</Th>
                  <Th align="right">Beitrag Netto</Th>
                  <Th align="right">Startpaket</Th>
                  <Th align="right">Provision</Th>
                  <Th>Bemerkung</Th>
                  <Th align="right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/30">
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
                    </Td>
                    <Td align="right">{laufzeitLabel(e.laufzeit)}</Td>
                    <Td align="right">{formatEuro(e.beitrag_netto)}</Td>
                    <Td align="right">{formatEuro(e.startpaket)}</Td>
                    <Td align="right">
                      <span className="font-bold text-[hsl(var(--brand-pink))]">
                        {formatEuro(e.provision)}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-xs text-muted-foreground">
                        {e.bemerkung ?? "—"}
                      </span>
                    </Td>
                    <Td align="right">
                      <LoeschenButton id={e.id} />
                    </Td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/40">
                <tr>
                  <Td colSpan={6}>
                    <span className="font-bold uppercase tracking-wider text-[10px]">
                      Total {monatsLabel(monat)}
                    </span>
                  </Td>
                  <Td align="right">
                    <span className="text-base font-bold text-[hsl(var(--brand-pink))]">
                      {formatEuro(stats.provision_total)}
                    </span>
                  </Td>
                  <Td colSpan={2} />
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
