"use client";

import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
import type { Template } from "@/lib/formulare";

function StatusBadge({ status }: { status: string }) {
  if (status === "aktiv")
    return (
      <StatusPill ton="success" dot>
        Aktiv
      </StatusPill>
    );
  if (status === "entwurf") return <StatusPill ton="warn">Entwurf</StatusPill>;
  return <StatusPill ton="neutral">Archiviert</StatusPill>;
}

export function FormulareTable({ templates }: { templates: Template[] }) {
  const columns: Column<Template>[] = [
    {
      key: "title",
      label: "Titel",
      sortable: true,
      render: (t) => (
        <span className="font-medium text-foreground">{t.title}</span>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      sortable: true,
      render: (t) => (
        <span className="font-mono text-xs text-muted-foreground">
          /{t.slug}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: "fields",
      label: "Felder",
      align: "right",
      accessor: (t) => t.fields.length,
      render: (t) => (
        <span className="tabular-nums">{t.fields.length}</span>
      ),
    },
  ];

  return (
    <DataTable<Template>
      data={templates}
      columns={columns}
      searchable={{
        placeholder: "Formular suchen…",
        keys: ["title", "slug"],
      }}
      filters={[
        {
          key: "status",
          label: "Status",
          options: [
            { value: "aktiv", label: "Aktiv" },
            { value: "entwurf", label: "Entwurf" },
            { value: "archiviert", label: "Archiviert" },
          ],
          multi: true,
        },
      ]}
      rowHref={(t) => `/admin/formulare/${t.id}`}
      defaultSort={{ key: "title", direction: "asc" }}
    />
  );
}
