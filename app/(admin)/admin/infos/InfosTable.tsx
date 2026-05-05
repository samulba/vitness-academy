"use client";

import { AlertTriangle, EyeOff, Pin, Siren } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
import {
  INFO_KATEGORIEN,
  kategorieLabel,
  type Announcement,
} from "@/lib/infos-types";
import { formatDatum } from "@/lib/format";

export function InfosTable({
  infos,
  standortById,
}: {
  infos: Announcement[];
  standortById: Record<string, string>;
}) {
  const columns: Column<Announcement>[] = [
    {
      key: "title",
      label: "Titel",
      sortable: true,
      render: (i) => (
        <div className="flex items-center gap-2">
          {i.pinned && <Pin className="h-3 w-3 text-[hsl(var(--brand-pink))]" />}
          <span className="font-medium text-foreground">{i.title}</span>
        </div>
      ),
    },
    {
      key: "importance",
      label: "Wichtigkeit",
      sortable: true,
      render: (i) =>
        i.importance === "critical" ? (
          <StatusPill ton="danger" dot>
            <Siren className="h-3 w-3" />
            Kritisch
          </StatusPill>
        ) : i.importance === "warning" ? (
          <StatusPill ton="warn">
            <AlertTriangle className="h-3 w-3" />
            Warnung
          </StatusPill>
        ) : (
          <StatusPill ton="info">Info</StatusPill>
        ),
    },
    {
      key: "published",
      label: "Status",
      sortable: true,
      render: (i) =>
        i.published ? (
          <StatusPill ton="success" dot>
            Veröffentlicht
          </StatusPill>
        ) : (
          <StatusPill ton="neutral">
            <EyeOff className="h-3 w-3" />
            Entwurf
          </StatusPill>
        ),
    },
    {
      key: "category",
      label: "Kategorie",
      sortable: true,
      render: (i) => (
        <span className="text-xs text-muted-foreground">
          {kategorieLabel(i.category)}
        </span>
      ),
    },
    {
      key: "location_id",
      label: "Standort",
      render: (i) => (
        <span className="text-xs text-muted-foreground">
          {i.location_id ? standortById[i.location_id] ?? "—" : "Alle"}
        </span>
      ),
    },
    {
      key: "author_name",
      label: "Autor",
      render: (i) => (
        <span className="text-xs text-muted-foreground">
          {i.author_name ?? "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Datum",
      sortable: true,
      render: (i) => (
        <span className="text-xs text-muted-foreground">
          {formatDatum(i.created_at)}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Announcement>
      data={infos}
      columns={columns}
      searchable={{
        placeholder: "Info suchen…",
        keys: ["title"],
      }}
      filters={[
        {
          key: "importance",
          label: "Wichtigkeit",
          options: [
            { value: "info", label: "Info" },
            { value: "warning", label: "Warnung" },
            { value: "critical", label: "Kritisch" },
          ],
          multi: true,
        },
        {
          key: "category",
          label: "Kategorie",
          options: INFO_KATEGORIEN.map((k) => ({
            value: k.value,
            label: k.label,
          })),
          multi: true,
        },
      ]}
      rowHref={(i) => `/admin/infos/${i.id}`}
      defaultSort={{ key: "created_at", direction: "desc" }}
    />
  );
}
