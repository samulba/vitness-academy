"use client";

import { ExternalLink, Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
import { formatDatum } from "@/lib/format";

export type Zeile = {
  id: string;
  title: string;
  status: string;
  passing_score: number;
  fragen_anzahl: number;
  versuche_anzahl: number;
  bestanden_anzahl: number;
  bindung_typ: string | null;
  bindung_titel: string | null;
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

export function QuizzeTable({ quizze }: { quizze: Zeile[] }) {
  const columns: Column<Zeile>[] = [
    {
      key: "title",
      label: "Titel",
      sortable: true,
      render: (q) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">{q.title}</span>
          {q.bindung_titel && (
            <span className="text-[11px] text-muted-foreground">
              {q.bindung_typ}: {q.bindung_titel}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (q) => <StatusBadge status={q.status} />,
    },
    {
      key: "fragen_anzahl",
      label: "Fragen",
      sortable: true,
      align: "right",
      render: (q) => <span className="tabular-nums">{q.fragen_anzahl}</span>,
    },
    {
      key: "passing_score",
      label: "Pass",
      sortable: true,
      align: "right",
      render: (q) => (
        <span className="tabular-nums text-xs text-muted-foreground">
          {q.passing_score}%
        </span>
      ),
    },
    {
      key: "versuche_anzahl",
      label: "Versuche",
      sortable: true,
      align: "right",
      render: (q) => <span className="tabular-nums">{q.versuche_anzahl}</span>,
    },
    {
      key: "bestanden_anzahl",
      label: "Bestanden",
      sortable: true,
      align: "right",
      render: (q) => <span className="tabular-nums">{q.bestanden_anzahl}</span>,
    },
    {
      key: "updated_at",
      label: "Aktualisiert",
      sortable: true,
      render: (q) => (
        <span className="text-xs text-muted-foreground">
          {formatDatum(q.updated_at)}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Zeile>
      data={quizze}
      columns={columns}
      searchable={{ placeholder: "Quiz suchen…", keys: ["title"] }}
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
      rowHref={(q) => `/admin/quizze/${q.id}`}
      rowActions={[
        {
          icon: <ExternalLink />,
          label: "Vorschau",
          href: (q) => `/quiz/${q.id}`,
        },
        {
          icon: <Pencil />,
          label: "Bearbeiten",
          href: (q) => `/admin/quizze/${q.id}`,
        },
      ]}
      defaultSort={{ key: "title", direction: "asc" }}
    />
  );
}
