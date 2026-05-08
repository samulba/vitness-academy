import Link from "next/link";
import { CheckCircle2, FileText, Inbox, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { RealtimeRefresh } from "@/lib/hooks/useRealtimeRefresh";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { requireRole } from "@/lib/auth";
import { ladeSubmissions } from "@/lib/formulare";
import { EingaengeTable } from "./EingaengeTable";

export default async function EingaengePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const sp = await searchParams;
  const filter = sp.template ?? null;

  const [offenAlle, erledigtAlle] = await Promise.all([
    ladeSubmissions({ status: ["eingereicht", "in_bearbeitung"] }),
    ladeSubmissions({ status: ["erledigt", "abgelehnt"] }),
  ]);

  const offen = filter
    ? offenAlle.filter((s) => s.template_title === filter)
    : offenAlle;
  const erledigt = filter
    ? erledigtAlle.filter((s) => s.template_title === filter)
    : erledigtAlle;
  const erledigtAnzahl = erledigt.filter((e) => e.status === "erledigt").length;

  // Filter-Optionen aus tatsaechlich vorhandenen Templates ableiten
  const templateZaehlung = new Map<string, number>();
  for (const s of [...offenAlle, ...erledigtAlle]) {
    const k = s.template_title ?? "Sonstige";
    templateZaehlung.set(k, (templateZaehlung.get(k) ?? 0) + 1);
  }
  const filterOptionen = Array.from(templateZaehlung.entries()).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <div className="space-y-6">
      <RealtimeRefresh table="form_submissions" />
      <PageHeader
        eyebrow="Operations"
        title="Eingänge"
        description="Eingereichte Krankmeldungen, Urlaubsanträge & Co. Klick öffnet die Details mit Status-Setzung. Vorlagen verwalten unter Formulare."
        secondaryActions={[
          {
            label: "Vorlagen verwalten",
            href: "/admin/formulare",
            icon: <FileText />,
          },
        ]}
      />

      <StatGrid cols={3}>
        <StatCard label="Aktuell offen" value={offen.length} icon={<Inbox />} />
        <StatCard
          label="Erledigt"
          value={erledigtAnzahl}
          icon={<CheckCircle2 />}
        />
        <StatCard
          label="Gesamt"
          value={offen.length + erledigt.length}
          icon={<Sparkles />}
        />
      </StatGrid>

      {filterOptionen.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <Link
            href="/admin/formulare/eingaenge"
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              !filter
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "border-border bg-card text-muted-foreground hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground",
            )}
          >
            Alle ({offenAlle.length + erledigtAlle.length})
          </Link>
          {filterOptionen.map(([titel, count]) => {
            const aktiv = filter === titel;
            return (
              <Link
                key={titel}
                href={`/admin/formulare/eingaenge?template=${encodeURIComponent(titel)}`}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  aktiv
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "border-border bg-card text-muted-foreground hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground",
                )}
              >
                {titel} ({count})
              </Link>
            );
          })}
        </div>
      )}

      <section className="space-y-2">
        <header>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Aktuell offen ({offen.length})
          </h2>
        </header>
        {offen.length === 0 ? (
          <div className="rounded-xl border border-border bg-card">
            <EmptyState
              illustration={<EmptyStateTablePreview />}
              title="Keine offenen Einreichungen"
              description="Alles bearbeitet — neue Eingänge tauchen hier auf."
            />
          </div>
        ) : (
          <EingaengeTable data={offen} />
        )}
      </section>

      {erledigt.length > 0 && (
        <section className="space-y-2">
          <header>
            <h2 className="text-[14px] font-semibold tracking-tight">
              Erledigt ({Math.min(30, erledigt.length)})
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Letzte 30 abgeschlossene Einreichungen.
            </p>
          </header>
          <EingaengeTable data={erledigt.slice(0, 30)} />
        </section>
      )}
    </div>
  );
}
