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
import { requireRole } from "@/lib/auth";
import { ladeMaengel } from "@/lib/maengel";
import { getAktiverStandort } from "@/lib/standort-context";
import { MaengelTable } from "./MaengelTable";

export default async function MaengelAdminPage() {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const aktiv = await getAktiverStandort();
  const locId = aktiv?.id ?? null;
  const offen = await ladeMaengel({
    status: ["offen", "in_bearbeitung"],
    locationId: locId,
  });
  const erledigt = await ladeMaengel({
    status: ["behoben", "verworfen"],
    locationId: locId,
  });
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
        />
        <StatCard
          label="In Bearbeitung"
          value={inBearbeitung}
          icon={<Wrench />}
        />
        <StatCard
          label="Behoben gesamt"
          value={behoben}
          icon={<CheckCircle2 />}
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
