"use client";

import { Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { StatusPill } from "@/components/admin/StatusPill";
import { formatDatum } from "@/lib/format";

export type Zeile = {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
  location_name: string | null;
  zugewiesen: number;
  archived_at: string | null;
};

function RollenPill({ role }: { role: string }) {
  if (role === "mitarbeiter")
    return <StatusPill ton="neutral">Mitarbeiter</StatusPill>;
  if (role === "fuehrungskraft")
    return <StatusPill ton="info">Führungskraft</StatusPill>;
  if (role === "admin") return <StatusPill ton="primary">Admin</StatusPill>;
  return <StatusPill ton="primary">Superadmin</StatusPill>;
}

export function BenutzerTable({ benutzer }: { benutzer: Zeile[] }) {
  const columns: Column<Zeile>[] = [
    {
      key: "full_name",
      label: "Name",
      sortable: true,
      render: (b) => (
        <div className="flex items-center gap-3">
          <ColoredAvatar name={b.full_name} size="sm" />
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {b.full_name ?? "—"}
            </span>
            {b.archived_at && (
              <span className="text-[11px] text-muted-foreground">
                archiviert seit {formatDatum(b.archived_at)}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Rolle",
      sortable: true,
      render: (b) => <RollenPill role={b.role} />,
    },
    {
      key: "location_name",
      label: "Standort",
      sortable: true,
      render: (b) => (
        <span className="text-xs text-muted-foreground">
          {b.location_name ?? "—"}
        </span>
      ),
    },
    {
      key: "zugewiesen",
      label: "Lernpfade",
      sortable: true,
      align: "right",
      render: (b) =>
        b.zugewiesen > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--brand-pink)/0.08)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[hsl(var(--brand-pink))]">
            {b.zugewiesen}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50">0</span>
        ),
    },
    {
      key: "created_at",
      label: "Angelegt",
      sortable: true,
      render: (b) => (
        <span className="text-xs text-muted-foreground">
          {formatDatum(b.created_at)}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Zeile>
      data={benutzer}
      columns={columns}
      searchable={{
        placeholder: "Mitarbeiter suchen…",
        keys: ["full_name", "location_name"],
      }}
      filters={[
        {
          key: "role",
          label: "Rolle",
          options: [
            { value: "mitarbeiter", label: "Mitarbeiter" },
            { value: "fuehrungskraft", label: "Führungskraft" },
            { value: "admin", label: "Admin" },
            { value: "superadmin", label: "Superadmin" },
          ],
          multi: true,
        },
      ]}
      rowHref={(b) => `/admin/benutzer/${b.id}`}
      rowActions={[
        {
          icon: <Pencil />,
          label: "Bearbeiten",
          href: (b) => `/admin/benutzer/${b.id}`,
        },
      ]}
      defaultSort={{ key: "created_at", direction: "desc" }}
    />
  );
}
