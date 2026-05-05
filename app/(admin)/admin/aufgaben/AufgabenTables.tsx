"use client";

import { CheckCircle2, RotateCw, Users } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
import type { Aufgabe } from "@/lib/aufgaben";
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

export function TemplatesTable({ data }: { data: Aufgabe[] }) {
  const columns: Column<Aufgabe>[] = [
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
  return (
    <DataTable<Aufgabe>
      data={data}
      columns={columns}
      rowHref={(a) => `/admin/aufgaben/${a.id}`}
      defaultSort={{ key: "title", direction: "asc" }}
    />
  );
}

export function InstancesTable({ data }: { data: Aufgabe[] }) {
  const columns: Column<Aufgabe>[] = [
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
    <DataTable<Aufgabe>
      data={data}
      columns={columns}
      searchable={{ placeholder: "Aufgabe suchen…", keys: ["title"] }}
      rowHref={(a) => `/admin/aufgaben/${a.id}`}
      defaultSort={{ key: "due_date", direction: "asc" }}
    />
  );
}
