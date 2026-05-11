import { AlertOctagon, Bug, CheckCircle2, Wrench } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { RealtimeRefresh } from "@/lib/hooks/useRealtimeRefresh";
import { requirePermission } from "@/lib/auth";
import { ladeBugReports } from "@/lib/bug-reports";
import { BugReportsTable } from "./BugReportsTable";

export default async function BugReportsAdminPage() {
  await requirePermission("bug_reports", "view");

  const offen = await ladeBugReports({ status: ["neu", "in_bearbeitung"] });
  const erledigt = await ladeBugReports({
    status: ["behoben", "verworfen", "duplikat"],
  });

  const neu = offen.filter((b) => b.status === "neu").length;
  const inBearbeitung = offen.filter((b) => b.status === "in_bearbeitung")
    .length;
  const kritisch = offen.filter((b) => b.prioritaet === "kritisch").length;
  const behoben = erledigt.filter((b) => b.status === "behoben").length;

  return (
    <div className="space-y-6">
      <RealtimeRefresh table="bug_reports" />
      <PageHeader
        eyebrow="System"
        title="Bug-Reports"
        description="Gemeldete Fehler und Probleme aus der App. Häufig gemeldete Bugs erscheinen mit Mehrfach-Zähler."
      />

      <StatGrid cols={4}>
        <StatCard label="Neu" value={neu} icon={<Bug />} />
        <StatCard label="In Bearbeitung" value={inBearbeitung} icon={<Wrench />} />
        <StatCard label="Behoben" value={behoben} icon={<CheckCircle2 />} />
        <StatCard
          label="Kritisch offen"
          value={kritisch}
          icon={<AlertOctagon />}
        />
      </StatGrid>

      <section className="space-y-2">
        <header>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Offen ({offen.length})
          </h2>
          <p className="text-[12px] text-muted-foreground">
            Warten auf Bearbeitung oder sind in Arbeit.
          </p>
        </header>
        {offen.length === 0 ? (
          <div className="rounded-xl border border-border bg-card">
            <EmptyState
              title="Keine offenen Bug-Reports"
              description="Alle Meldungen sind bearbeitet."
            />
          </div>
        ) : (
          <BugReportsTable data={offen} withFilters />
        )}
      </section>

      {erledigt.length > 0 && (
        <section className="space-y-2">
          <header>
            <h2 className="text-[14px] font-semibold tracking-tight">
              Erledigt
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Letzte 20 abgeschlossene Meldungen.
            </p>
          </header>
          <BugReportsTable data={erledigt.slice(0, 20)} />
        </section>
      )}
    </div>
  );
}
