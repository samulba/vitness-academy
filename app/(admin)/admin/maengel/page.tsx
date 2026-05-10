import {
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { RealtimeRefresh } from "@/lib/hooks/useRealtimeRefresh";
import { requirePermission } from "@/lib/auth";
import { ladeMaengel } from "@/lib/maengel";
import { tagesCounts, trendAusVerlauf } from "@/lib/admin/sparklines";
import { MaengelTable } from "./MaengelTable";

export default async function MaengelAdminPage() {
  await requirePermission("maengel", "view");
  // Admin-Bereich zeigt standardmaessig alle Standorte
  // (kein Standort-Switcher in der Admin-Sidebar/Topbar mehr).
  const sparkGemeldet = await tagesCounts("studio_issues", "created_at");
  const sparkBehoben = await tagesCounts("studio_issues", "resolved_at", 7, (q) =>
    q.eq("status", "behoben"),
  );
  const trendGemeldet = trendAusVerlauf(sparkGemeldet);
  const trendBehoben = trendAusVerlauf(sparkBehoben);
  const offen = await ladeMaengel({ status: ["offen", "in_bearbeitung"] });
  const erledigt = await ladeMaengel({ status: ["behoben", "verworfen"] });
  const inBearbeitung = offen.filter((m) => m.status === "in_bearbeitung").length;
  const kritisch = offen.filter((m) => m.severity === "kritisch").length;
  const behoben = erledigt.filter((m) => m.status === "behoben").length;

  return (
    <div className="space-y-6">
      <RealtimeRefresh table="studio_issues" />
      <PageHeader
        eyebrow="Studio-Daten"
        title="Mängel"
        description="Inbox aller gemeldeten Probleme. Klick öffnet die Details mit Status-Setzung."
      />

      <StatGrid cols={4}>
        <StatCard
          label="Aktuell offen"
          value={offen.length}
          icon={<AlertTriangle />}
          trend={
            sparkGemeldet.some((v) => v > 0)
              ? { ...trendGemeldet, hint: "gemeldet 7 Tage" }
              : undefined
          }
          sparklineData={sparkGemeldet}
        />
        <StatCard
          label="In Bearbeitung"
          value={inBearbeitung}
          icon={<Wrench />}
        />
        <StatCard
          label="Behoben"
          value={behoben}
          icon={<CheckCircle2 />}
          trend={
            sparkBehoben.some((v) => v > 0)
              ? { ...trendBehoben, hint: "behoben 7 Tage" }
              : undefined
          }
          sparklineData={sparkBehoben}
        />
        <StatCard
          label="Gesamt erfasst"
          value={offen.length + erledigt.length}
          icon={<Zap />}
          trend={
            kritisch > 0
              ? { value: kritisch, direction: "down", hint: "kritisch offen" }
              : undefined
          }
        />
      </StatGrid>

      <section className="space-y-2">
        <header>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Aktuell offen ({offen.length})
          </h2>
          <p className="text-[12px] text-muted-foreground">
            Warten auf Bearbeitung oder sind in Arbeit.
          </p>
        </header>
        {offen.length === 0 ? (
          <div className="rounded-xl border border-border bg-card">
            <EmptyState
              title="Keine offenen Mängel"
              description="Alle gemeldeten Probleme sind bearbeitet. Top Studio-Team!"
            />
          </div>
        ) : (
          <MaengelTable data={offen} withFilters />
        )}
      </section>

      {erledigt.length > 0 && (
        <section className="space-y-2">
          <header>
            <h2 className="text-[14px] font-semibold tracking-tight">
              Erledigt
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Letzte 20 abgeschlossene Mängel.
            </p>
          </header>
          <MaengelTable data={erledigt.slice(0, 20)} />
        </section>
      )}
    </div>
  );
}
