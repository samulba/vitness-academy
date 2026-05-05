"use client";

import { ImageIcon } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
import { fotoUrlFuerPfad, type Mangel } from "@/lib/maengel-types";
import { formatDatum } from "@/lib/format";

function StatusBadge({ status }: { status: string }) {
  if (status === "offen")
    return (
      <StatusPill ton="warn" dot>
        Offen
      </StatusPill>
    );
  if (status === "in_bearbeitung")
    return (
      <StatusPill ton="info" dot>
        In Bearbeitung
      </StatusPill>
    );
  if (status === "behoben")
    return (
      <StatusPill ton="success" dot>
        Behoben
      </StatusPill>
    );
  return <StatusPill ton="neutral">Verworfen</StatusPill>;
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "kritisch")
    return (
      <StatusPill ton="danger" dot pulse>
        Kritisch
      </StatusPill>
    );
  if (severity === "normal")
    return <StatusPill ton="warn">Normal</StatusPill>;
  return <StatusPill ton="neutral">Niedrig</StatusPill>;
}

function MangelThumb({ m }: { m: Mangel }) {
  const paths = Array.isArray(m.photo_paths) ? m.photo_paths : [];
  const url = fotoUrlFuerPfad(paths[0] ?? null);
  const extra = paths.length - 1;
  return (
    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <ImageIcon className="h-3.5 w-3.5" />
      )}
      {extra > 0 && (
        <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(var(--primary))] px-1 text-[9px] font-bold text-[hsl(var(--primary-foreground))]">
          +{extra}
        </span>
      )}
    </span>
  );
}

export function MaengelTable({
  data,
  withFilters,
}: {
  data: Mangel[];
  withFilters?: boolean;
}) {
  const columns: Column<Mangel>[] = [
    {
      key: "title",
      label: "Titel",
      sortable: true,
      render: (m) => (
        <div className="flex items-center gap-3">
          <MangelThumb m={m} />
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground">{m.title}</span>
            {m.description && (
              <span className="line-clamp-1 text-[11px] text-muted-foreground">
                {m.description}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (m) => <StatusBadge status={m.status} />,
    },
    {
      key: "severity",
      label: "Schwere",
      sortable: true,
      render: (m) => <SeverityBadge severity={m.severity} />,
    },
    {
      key: "reported_by_name",
      label: "Gemeldet",
      render: (m) => (
        <span className="text-xs text-muted-foreground">
          {formatDatum(m.created_at)}
          {m.reported_by_name && (
            <span className="ml-1">· {m.reported_by_name}</span>
          )}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Mangel>
      data={data}
      columns={columns}
      searchable={
        withFilters
          ? { placeholder: "Mangel suchen…", keys: ["title", "description"] }
          : undefined
      }
      filters={
        withFilters
          ? [
              {
                key: "severity",
                label: "Schwere",
                options: [
                  { value: "kritisch", label: "Kritisch" },
                  { value: "normal", label: "Normal" },
                  { value: "niedrig", label: "Niedrig" },
                ],
                multi: true,
              },
              {
                key: "status",
                label: "Status",
                options: [
                  { value: "offen", label: "Offen" },
                  { value: "in_bearbeitung", label: "In Bearbeitung" },
                ],
                multi: true,
              },
            ]
          : undefined
      }
      rowHref={(m) => `/admin/maengel/${m.id}`}
      defaultSort={{ key: "reported_by_name", direction: "desc" }}
    />
  );
}
