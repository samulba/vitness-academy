import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2, Clock, Lock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/admin/StatusPill";
import { requirePermission } from "@/lib/auth";
import { formatEuro, ladePayouts } from "@/lib/provisionen";

function letzteMonate(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

function monatsLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split("-").map(Number);
  const monate = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ];
  return `${monate[m - 1]} ${y}`;
}

export default async function AbrechnungUebersichtPage() {
  await requirePermission("provisionen", "view");

  // Alle Payouts laden -- gruppiere pro Monat
  const payouts = await ladePayouts();
  const proMonat = new Map<
    string,
    {
      anzahl: number;
      offen: number;
      ausgezahlt: number;
      total: number;
    }
  >();
  for (const p of payouts) {
    const cur = proMonat.get(p.monat_yyyymm);
    if (cur) {
      cur.anzahl += 1;
      if (p.status === "offen") cur.offen += 1;
      if (p.status === "ausgezahlt") cur.ausgezahlt += 1;
      cur.total += p.total;
    } else {
      proMonat.set(p.monat_yyyymm, {
        anzahl: 1,
        offen: p.status === "offen" ? 1 : 0,
        ausgezahlt: p.status === "ausgezahlt" ? 1 : 0,
        total: p.total,
      });
    }
  }

  const monateMitPayouts = Array.from(proMonat.keys()).sort((a, b) =>
    b.localeCompare(a),
  );
  const monateOhne = letzteMonate(12).filter((m) => !proMonat.has(m));

  // KPIs
  const offeneTotal = payouts
    .filter((p) => p.status === "offen")
    .reduce((s, p) => s + p.total, 0);
  const ausgezahltTotal = payouts
    .filter((p) => p.status === "ausgezahlt")
    .reduce((s, p) => s + p.total, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Provisionen", href: "/admin/provisionen" },
          { label: "Abrechnung" },
        ]}
        eyebrow="Verkauf"
        title="Monats-Abrechnung"
        description="Monat abschließen → Provisionen werden gefroren → Auszahlung pro Vertriebler:in tracken."
      />

      <StatGrid cols={3}>
        <StatCard
          label="Abgerechnete Monate"
          value={monateMitPayouts.length}
          icon={<Calendar />}
        />
        <StatCard
          label="Offen zur Auszahlung"
          value={formatEuro(offeneTotal)}
          icon={<Clock />}
        />
        <StatCard
          label="Bereits ausgezahlt"
          value={formatEuro(ausgezahltTotal)}
          icon={<CheckCircle2 />}
        />
      </StatGrid>

      {/* Bereits abgerechnete Monate */}
      {monateMitPayouts.length > 0 && (
        <section className="space-y-2">
          <header>
            <h2 className="text-[14px] font-semibold tracking-tight">
              <Lock className="mr-2 inline h-4 w-4 text-[hsl(var(--brand-pink))]" />
              Abgerechnet
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Diese Monate sind gesperrt. Eintrags-Änderungen werden vom
              System blockiert.
            </p>
          </header>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {monateMitPayouts.map((m) => {
              const info = proMonat.get(m)!;
              const allesAusgezahlt = info.offen === 0 && info.anzahl > 0;
              return (
                <li key={m}>
                  <Link
                    href={`/admin/provisionen/abrechnung/${m}`}
                    className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {monatsLabel(m)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {info.anzahl}{" "}
                        {info.anzahl === 1 ? "Vertriebler:in" : "Vertriebler:innen"}{" "}
                        · {formatEuro(info.total)} gesamt
                      </p>
                    </div>
                    {allesAusgezahlt ? (
                      <StatusPill ton="success" dot>
                        Komplett ausgezahlt
                      </StatusPill>
                    ) : info.ausgezahlt > 0 ? (
                      <StatusPill ton="warn">
                        {info.ausgezahlt}/{info.anzahl} ausgezahlt
                      </StatusPill>
                    ) : (
                      <StatusPill ton="warn" dot>
                        Offen zur Auszahlung
                      </StatusPill>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Noch nicht abgerechnete Monate (zur Vorschau) */}
      <section className="space-y-2">
        <header>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Noch nicht abgerechnet
          </h2>
          <p className="text-[12px] text-muted-foreground">
            Klick auf einen Monat → Vorschau pro Vertriebler:in →
            sperren mit &bdquo;Monat abschließen&ldquo;.
          </p>
        </header>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {monateOhne.map((m) => (
            <li key={m}>
              <Link
                href={`/admin/provisionen/abrechnung/${m}`}
                className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{monatsLabel(m)}</p>
                </div>
                <StatusPill ton="neutral">Vorschau</StatusPill>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
