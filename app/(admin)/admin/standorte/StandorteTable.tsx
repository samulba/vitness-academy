"use client";

import { MapPin, Users } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import type { Standort } from "@/lib/standorte";

export function StandorteTable({ standorte }: { standorte: Standort[] }) {
  const columns: Column<Standort>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
            <MapPin className="h-3.5 w-3.5" />
          </span>
          <span className="font-medium text-foreground">{s.name}</span>
        </div>
      ),
    },
    {
      key: "mitarbeiter_count",
      label: "Mitarbeiter",
      sortable: true,
      align: "right",
      render: (s) => (
        <span className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
          <Users className="h-3 w-3" />
          {s.mitarbeiter_count}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Standort>
      data={standorte}
      columns={columns}
      searchable={{ placeholder: "Standort suchen…", keys: ["name"] }}
      rowHref={(s) => `/admin/standorte/${s.id}`}
      defaultSort={{ key: "name", direction: "asc" }}
    />
  );
}
