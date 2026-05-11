"use client";

import { AlertOctagon, Bug, ImageIcon, Lightbulb, Palette } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
import {
  type BugKategorie,
  type BugPrioritaet,
  type BugReport,
  type BugStatus,
} from "@/lib/bug-reports-types";
import { formatDatum } from "@/lib/format";

function StatusBadge({ status }: { status: BugStatus }) {
  if (status === "neu") return <StatusPill ton="warn" dot>Neu</StatusPill>;
  if (status === "in_bearbeitung")
    return <StatusPill ton="info" dot>In Bearbeitung</StatusPill>;
  if (status === "behoben")
    return <StatusPill ton="success" dot>Behoben</StatusPill>;
  if (status === "duplikat")
    return <StatusPill ton="neutral">Duplikat</StatusPill>;
  return <StatusPill ton="neutral">Verworfen</StatusPill>;
}

function PrioBadge({ prio }: { prio: BugPrioritaet }) {
  if (prio === "kritisch")
    return (
      <StatusPill ton="danger" dot pulse>
        Kritisch
      </StatusPill>
    );
  if (prio === "hoch") return <StatusPill ton="warn">Hoch</StatusPill>;
  if (prio === "normal") return <StatusPill ton="neutral">Normal</StatusPill>;
  return <StatusPill ton="neutral">Niedrig</StatusPill>;
}

function KatIcon({ kat }: { kat: BugKategorie }) {
  if (kat === "ui") return <Palette className="h-3.5 w-3.5" />;
  if (kat === "vorschlag") return <Lightbulb className="h-3.5 w-3.5" />;
  if (kat === "sonstiges") return <ImageIcon className="h-3.5 w-3.5" />;
  return <Bug className="h-3.5 w-3.5" />;
}

export function BugReportsTable({
  data,
  withFilters,
}: {
  data: BugReport[];
  withFilters?: boolean;
}) {
  const columns: Column<BugReport>[] = [
    {
      key: "beschreibung",
      label: "Titel",
      sortable: true,
      render: (b) => {
        const titel =
          b.beschreibung && b.beschreibung.length > 0
            ? b.beschreibung
            : b.fehler_message ?? "(ohne Titel)";
        const sub = b.pfad ?? b.fehler_message ?? "";
        return (
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <KatIcon kat={b.kategorie} />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-2">
                <span className="line-clamp-1 font-medium text-foreground">
                  {titel}
                </span>
                {b.meldungen_count > 1 && (
                  <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[hsl(var(--brand-pink)/0.15)] px-1.5 py-0.5 text-[10px] font-bold text-[hsl(var(--brand-pink))]">
                    <AlertOctagon className="h-3 w-3" />×{b.meldungen_count}
                  </span>
                )}
              </span>
              {sub && (
                <span className="line-clamp-1 font-mono text-[10px] text-muted-foreground">
                  {sub}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (b) => <StatusBadge status={b.status} />,
    },
    {
      key: "prioritaet",
      label: "Priorität",
      sortable: true,
      render: (b) => <PrioBadge prio={b.prioritaet} />,
    },
    {
      key: "letzte_meldung_at",
      label: "Zuletzt gemeldet",
      sortable: true,
      render: (b) => (
        <span className="text-xs text-muted-foreground">
          {formatDatum(b.letzte_meldung_at)}
          {b.reported_by_name && (
            <span className="ml-1">· {b.reported_by_name}</span>
          )}
        </span>
      ),
    },
  ];

  return (
    <DataTable<BugReport>
      data={data}
      columns={columns}
      searchable={
        withFilters
          ? {
              placeholder: "Suchen…",
              keys: ["beschreibung", "fehler_message", "pfad"],
            }
          : undefined
      }
      filters={
        withFilters
          ? [
              {
                key: "prioritaet",
                label: "Priorität",
                options: [
                  { value: "kritisch", label: "Kritisch" },
                  { value: "hoch", label: "Hoch" },
                  { value: "normal", label: "Normal" },
                  { value: "niedrig", label: "Niedrig" },
                ],
                multi: true,
              },
              {
                key: "status",
                label: "Status",
                options: [
                  { value: "neu", label: "Neu" },
                  { value: "in_bearbeitung", label: "In Bearbeitung" },
                ],
                multi: true,
              },
              {
                key: "quelle",
                label: "Quelle",
                options: [
                  { value: "error_popup", label: "Fehler-Popup" },
                  { value: "manuell", label: "Manuell" },
                ],
                multi: true,
              },
            ]
          : undefined
      }
      rowHref={(b) => `/admin/bug-reports/${b.id}`}
      defaultSort={{ key: "letzte_meldung_at", direction: "desc" }}
    />
  );
}
