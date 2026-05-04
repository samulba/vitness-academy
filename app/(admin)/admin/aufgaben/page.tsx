import {
  CheckCircle2,
  ListTodo,
  Plus,
  RotateCw,
  Sparkles,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
import { requireRole } from "@/lib/auth";
import { ladeAlleAufgabenAdmin, type Aufgabe } from "@/lib/aufgaben";
import { getAktiverStandort } from "@/lib/standort-context";
import { formatDatum } from "@/lib/format";

function StatusBadge({ task }: { task: Aufgabe }) {
  if (task.completed_at)
    return (
      <StatusPill ton="success" dot>
        <CheckCircle2 className="h-3 w-3" />
        Erledigt
      </StatusPill>
    );
  return <StatusPill ton="warn">Offen</StatusPill>;
}

export default async function AufgabenAdminPage() {
  await requireRole(["admin", "superadmin"]);
  const aktiv = await getAktiverStandort();
  const alle = await ladeAlleAufgabenAdmin(aktiv?.id ?? null);
  const templates = alle.filter((a) => a.recurrence !== "none");
  const instances = alle.filter((a) => a.recurrence === "none");
  const offen = instances.filter((i) => !i.completed_at).length;
  const erledigt = instances.filter((i) => i.completed_at).length;
  const aktiveTemplates = templates.filter((t) => t.active).length;

  const templateColumns: Column<Aufgabe>[] = [
    {
      key: "title",
      label: "Titel",
      sortable: true,
      render: (a) => (
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
            <RotateCw className="h-3.5 w-3.5" />
          </span>
          <span className="font-medium text-foreground">{a.title}</span>
        </div>
      ),
    },
    {
      key: "recurrence",
      label: "Rhythmus",
      sortable: true,
      render: (a) => (
        <span className="text-xs text-muted-foreground">
          {a.recurrence === "daily" ? "Täglich" : "Wöchentlich"}
        </span>
      ),
    },
    {
      key: "assigned_to_name",
      label: "Empfänger",
      render: (a) => (
        <span className="text-xs text-muted-foreground">
          {a.assigned_to_name ?? "Team"}
        </span>
      ),
    },
    {
      key: "active",
      label: "Status",
      sortable: true,
      render: (a) =>
        a.active ? (
          <StatusPill ton="success" dot>
            Aktiv
          </StatusPill>
        ) : (
          <StatusPill ton="neutral">Inaktiv</StatusPill>
        ),
    },
  ];

  const instanceColumns: Column<Aufgabe>[] = [
    {
      key: "title",
      label: "Titel",
      sortable: true,
      render: (a) => (
        <span className="font-medium text-foreground">{a.title}</span>
      ),
    },
    {
      key: "assigned_to_name",
      label: "Empfänger",
      render: (a) => (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          {!a.assigned_to && <Users className="h-3 w-3" />}
          {a.assigned_to_name ?? "Team"}
        </span>
      ),
    },
    {
      key: "due_date",
      label: "Fällig",
      sortable: true,
      render: (a) => (
        <span className="text-xs text-muted-foreground">
          {a.due_date ? formatDatum(a.due_date) : "—"}
        </span>
      ),
    },
    {
      key: "completed_at",
      label: "Status",
      sortable: true,
      render: (a) => <StatusBadge task={a} />,
    },
  ];

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
          <DataTable<Aufgabe>
            data={templates}
            columns={templateColumns}
            rowHref={(a) => `/admin/aufgaben/${a.id}`}
            defaultSort={{ key: "title", direction: "asc" }}
          />
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
          <DataTable<Aufgabe>
            data={instances}
            columns={instanceColumns}
            searchable={{
              placeholder: "Aufgabe suchen…",
              keys: ["title"],
            }}
            rowHref={(a) => `/admin/aufgaben/${a.id}`}
            defaultSort={{ key: "due_date", direction: "asc" }}
          />
        )}
      </section>
    </div>
  );
}
