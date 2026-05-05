"use client";

import { DataTable, type Column } from "@/components/ui/data-table";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { StatusPill } from "@/components/admin/StatusPill";
import { vollerName, type Kontakt } from "@/lib/kontakte-types";

export function KontakteTable({
  kontakte,
  rollen,
}: {
  kontakte: Kontakt[];
  rollen: string[];
}) {
  const columns: Column<Kontakt>[] = [
    {
      key: "first_name",
      label: "Name",
      sortable: true,
      accessor: (k) => vollerName(k),
      render: (k) => (
        <div className="flex items-center gap-3">
          <ColoredAvatar name={vollerName(k)} size="sm" />
          <span className="font-medium text-foreground">{vollerName(k)}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Kontakt",
      render: (k) => (
        <span className="text-xs text-muted-foreground">
          {[k.email, k.phone].filter(Boolean).join(" · ") || "—"}
        </span>
      ),
    },
    {
      key: "role_tags",
      label: "Rollen",
      render: (k) => {
        const tags = Array.isArray(k.role_tags) ? k.role_tags : [];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((r) => (
              <StatusPill key={r} ton="primary">
                {r}
              </StatusPill>
            ))}
            {tags.length > 3 && (
              <span className="text-[11px] text-muted-foreground">
                +{tags.length - 3}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable<Kontakt>
      data={kontakte}
      columns={columns}
      searchable={{
        placeholder: "Kontakt suchen…",
        keys: ["first_name", "last_name", "email", "phone"],
      }}
      filters={
        rollen.length > 0
          ? [
              {
                key: "role_tags",
                label: "Rolle",
                options: rollen.map((t) => ({ value: t, label: t })),
                multi: true,
              },
            ]
          : undefined
      }
      rowHref={(k) => `/admin/kontakte/${k.id}`}
      defaultSort={{ key: "first_name", direction: "asc" }}
    />
  );
}
