"use client";

import { ExternalLink, Folder, Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
import { formatDatum } from "@/lib/format";

export type Artikel = {
  id: string;
  title: string;
  slug: string;
  category_name: string | null;
  status: string;
  updated_at: string;
};

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

export function WissenTable({
  artikel,
  kategorien,
}: {
  artikel: Artikel[];
  kategorien: { name: string }[];
}) {
  const columns: Column<Artikel>[] = [
    {
      key: "title",
      label: "Titel",
      sortable: true,
      render: (a) => (
        <span className="font-medium text-foreground">{a.title}</span>
      ),
    },
    {
      key: "category_name",
      label: "Kategorie",
      sortable: true,
      render: (a) =>
        a.category_name ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Folder className="h-3 w-3" />
            {a.category_name}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: "updated_at",
      label: "Aktualisiert",
      sortable: true,
      render: (a) => (
        <span className="text-xs text-muted-foreground">
          {formatDatum(a.updated_at)}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Artikel>
      data={artikel}
      columns={columns}
      searchable={{ placeholder: "Artikel suchen…", keys: ["title"] }}
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
        {
          key: "category_name",
          label: "Kategorie",
          options: kategorien.map((k) => ({
            value: k.name,
            label: k.name,
          })),
        },
      ]}
      rowHref={(a) => `/admin/wissen/${a.id}`}
      rowActions={[
        {
          icon: <ExternalLink />,
          label: "Vorschau",
          href: (a) => `/wissen/${a.slug}`,
        },
        {
          icon: <Pencil />,
          label: "Bearbeiten",
          href: (a) => `/admin/wissen/${a.id}`,
        },
      ]}
      defaultSort={{ key: "title", direction: "asc" }}
    />
  );
}
