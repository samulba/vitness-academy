"use client";

import { DataTable, type Column } from "@/components/ui/data-table";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { StatusPill } from "@/components/admin/StatusPill";
import {
  STATUS_LABEL,
  type Submission,
  type SubmissionStatus,
} from "@/lib/formulare-types";
import { formatDatum } from "@/lib/format";

function StatusBadge({ status }: { status: SubmissionStatus }) {
  if (status === "eingereicht")
    return (
      <StatusPill ton="primary" dot>
        {STATUS_LABEL[status]}
      </StatusPill>
    );
  if (status === "in_bearbeitung")
    return <StatusPill ton="warn">{STATUS_LABEL[status]}</StatusPill>;
  if (status === "erledigt")
    return <StatusPill ton="success">{STATUS_LABEL[status]}</StatusPill>;
  return <StatusPill ton="neutral">{STATUS_LABEL[status]}</StatusPill>;
}

export function EingaengeTable({ data }: { data: Submission[] }) {
  const columns: Column<Submission>[] = [
    {
      key: "template_title",
      label: "Formular",
      sortable: true,
      render: (s) => (
        <span className="font-medium text-foreground">
          {s.template_title ?? "Formular"}
        </span>
      ),
    },
    {
      key: "submitted_by_name",
      label: "Eingereicht von",
      render: (s) => (
        <div className="flex items-center gap-2.5">
          <ColoredAvatar name={s.submitted_by_name} size="sm" />
          <span className="text-[13px]">{s.submitted_by_name ?? "—"}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: "submitted_at",
      label: "Datum",
      sortable: true,
      render: (s) => (
        <span className="text-xs text-muted-foreground">
          {formatDatum(s.submitted_at)}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Submission>
      data={data}
      columns={columns}
      rowHref={(s) => `/admin/formulare/eingaenge/${s.id}`}
      defaultSort={{ key: "submitted_at", direction: "desc" }}
    />
  );
}
