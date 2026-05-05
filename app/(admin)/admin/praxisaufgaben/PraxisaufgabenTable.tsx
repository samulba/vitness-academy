"use client";

import { Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";

export type Zeile = {
  id: string;
  title: string;
  status: string;
  pfad_titel: string | null;
  lektion_titel: string | null;
  bereit: number;
  freigegeben: number;
  abgelehnt: number;
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

export function PraxisaufgabenTable({ aufgaben }: { aufgaben: Zeile[] }) {
  const columns: Column<Zeile>[] = [
    {
      key: "title",
      label: "Titel",
      sortable: true,
      render: (a) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">{a.title}</span>
          {(a.pfad_titel || a.lektion_titel) && (
            <span className="text-[11px] text-muted-foreground">
              {[a.pfad_titel, a.lektion_titel].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: "bereit",
      label: "Wartet",
      sortable: true,
      align: "right",
      render: (a) => (
        <span className="tabular-nums text-[hsl(var(--brand-pink))]">
          {a.bereit}
        </span>
      ),
    },
    {
      key: "freigegeben",
      label: "Freigegeben",
      sortable: true,
      align: "right",
      render: (a) => (
        <span className="tabular-nums text-[hsl(var(--success))]">
          {a.freigegeben}
        </span>
      ),
    },
    {
      key: "abgelehnt",
      label: "Abgelehnt",
      sortable: true,
      align: "right",
      render: (a) => (
        <span className="tabular-nums text-muted-foreground">
          {a.abgelehnt}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Zeile>
      data={aufgaben}
      columns={columns}
      searchable={{ placeholder: "Aufgabe suchen…", keys: ["title"] }}
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
      rowHref={(a) => `/admin/praxisaufgaben/${a.id}`}
      rowActions={[
        {
          icon: <Pencil />,
          label: "Bearbeiten",
          href: (a) => `/admin/praxisaufgaben/${a.id}`,
        },
      ]}
      defaultSort={{ key: "title", direction: "asc" }}
    />
  );
}
