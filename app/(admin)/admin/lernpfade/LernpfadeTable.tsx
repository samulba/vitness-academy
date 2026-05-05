"use client";

import { ExternalLink, GraduationCap, Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
import { bildUrlFuerPfad } from "@/lib/storage";
import { formatDatum } from "@/lib/format";

export type Zeile = {
  id: string;
  title: string;
  status: string;
  module_anzahl: number;
  lektion_anzahl: number;
  zugewiesen: number;
  updated_at: string;
  hero_image_path: string | null;
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

function PfadThumb({ pfad }: { pfad: Zeile }) {
  const url = bildUrlFuerPfad(pfad.hero_image_path);
  if (url) {
    return (
      <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-md ring-1 ring-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.18)]"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--brand-pink)) 100%)",
      }}
    >
      <GraduationCap className="h-4 w-4" />
    </span>
  );
}

export function LernpfadeTable({ pfade }: { pfade: Zeile[] }) {
  const columns: Column<Zeile>[] = [
    {
      key: "title",
      label: "Titel",
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <PfadThumb pfad={p} />
          <span className="font-medium text-foreground">{p.title}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: "module_anzahl",
      label: "Module",
      sortable: true,
      align: "right",
      render: (p) => <span className="tabular-nums">{p.module_anzahl}</span>,
    },
    {
      key: "lektion_anzahl",
      label: "Lektionen",
      sortable: true,
      align: "right",
      render: (p) => <span className="tabular-nums">{p.lektion_anzahl}</span>,
    },
    {
      key: "zugewiesen",
      label: "Zuweisungen",
      sortable: true,
      align: "right",
      render: (p) =>
        p.zugewiesen > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--brand-pink)/0.08)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[hsl(var(--brand-pink))]">
            {p.zugewiesen}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50">0</span>
        ),
    },
    {
      key: "updated_at",
      label: "Aktualisiert",
      sortable: true,
      render: (p) => (
        <span className="text-xs text-muted-foreground">
          {formatDatum(p.updated_at)}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Zeile>
      data={pfade}
      columns={columns}
      searchable={{ placeholder: "Lernpfad suchen…", keys: ["title"] }}
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
      rowHref={(p) => `/admin/lernpfade/${p.id}`}
      rowActions={[
        {
          icon: <ExternalLink />,
          label: "Vorschau",
          href: (p) => `/lernpfade/${p.id}`,
        },
        {
          icon: <Pencil />,
          label: "Bearbeiten",
          href: (p) => `/admin/lernpfade/${p.id}`,
        },
      ]}
      defaultSort={{ key: "title", direction: "asc" }}
    />
  );
}
