import {
  CheckCircle2,
  ListTodo,
  Plus,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth";
import { ladeAlleAufgabenAdmin } from "@/lib/aufgaben";
import { InstancesTable, TemplatesTable } from "./AufgabenTables";

export default async function AufgabenAdminPage() {
  await requireRole(["admin", "superadmin"]);
  // Admin sieht Aufgaben ueber alle Standorte.
  const alle = await ladeAlleAufgabenAdmin(null);
  const templates = alle.filter((a) => a.recurrence !== "none");
  const instances = alle.filter((a) => a.recurrence === "none");
  const offen = instances.filter((i) => !i.completed_at).length;
  const erledigt = instances.filter((i) => i.completed_at).length;
  const aktiveTemplates = templates.filter((t) => t.active).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio-Daten"
        title="Aufgaben"
        description="Tägliche ToDo's, einmalige Aufgaben und wiederkehrende Templates."
        primaryAction={{
          label: "Neue Aufgabe",
          icon: <Plus />,
          href: "/admin/aufgaben/neu",
        }}
      />

      <StatGrid cols={4}>
        <StatCard label="Aktuell offen" value={offen} icon={<ListTodo />} />
        <StatCard label="Erledigt" value={erledigt} icon={<CheckCircle2 />} />
        <StatCard
          label="Templates aktiv"
          value={`${aktiveTemplates}/${templates.length}`}
          icon={<RotateCw />}
        />
        <StatCard
          label="Aufgaben gesamt"
          value={alle.length}
          icon={<Sparkles />}
        />
      </StatGrid>

      {templates.length > 0 && (
        <section className="space-y-2">
          <header>
            <h2 className="text-[14px] font-semibold tracking-tight">
              Wiederholende Templates
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Generieren beim ersten Login des Tages bzw. der Woche eine neue
              Instance.
            </p>
          </header>
          <TemplatesTable data={templates} />
        </section>
      )}

      <section className="space-y-2">
        <header>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Einzelne Aufgaben
          </h2>
          <p className="text-[12px] text-muted-foreground">
            Einmalige Tasks und automatisch generierte Instances.
          </p>
        </header>
        {instances.length === 0 ? (
          <div className="rounded-xl border border-border bg-card">
            <EmptyState
              illustration={<EmptyStateTablePreview />}
              title="Noch keine Aufgaben"
              description="Lege eine einzelne Aufgabe an oder erstelle ein Template das sich täglich/wöchentlich wiederholt."
              actions={[
                {
                  icon: <Plus />,
                  title: "Aufgabe anlegen",
                  description: "Einmaliger Task",
                  href: "/admin/aufgaben/neu",
                },
                {
                  icon: <RotateCw />,
                  title: "Template anlegen",
                  description: "Täglich/wöchentlich",
                  href: "/admin/aufgaben/neu",
                },
              ]}
            />
          </div>
        ) : (
          <InstancesTable data={instances} />
        )}
      </section>
    </div>
  );
}
