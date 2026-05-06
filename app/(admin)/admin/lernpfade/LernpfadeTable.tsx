"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Pencil,
  Search,
} from "lucide-react";
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
    <>
      {/* Mobile: Card-Liste */}
      <div className="lg:hidden">
        <LernpfadeCardsMobile pfade={pfade} />
      </div>

      {/* Desktop: Volle DataTable */}
      <div className="hidden lg:block">
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
      </div>
    </>
  );
}

function LernpfadeCardsMobile({ pfade }: { pfade: Zeile[] }) {
  const [query, setQuery] = useState("");
  const gefiltert = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pfade;
    return pfade.filter((p) => p.title.toLowerCase().includes(q));
  }, [pfade, query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Lernpfad suchen…"
          className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 placeholder:text-muted-foreground/70 focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {gefiltert.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Keine Treffer.
        </div>
      ) : (
        <ul className="space-y-2">
          {gefiltert.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/lernpfade/${p.id}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-[hsl(var(--primary)/0.4)] active:bg-muted/50"
              >
                <PfadThumb pfad={p} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold leading-tight">
                      {p.title}
                    </p>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={p.status} />
                    <span className="text-[11px] text-muted-foreground">
                      {p.module_anzahl} Module · {p.lektion_anzahl} Lektionen
                    </span>
                  </div>
                  {p.zugewiesen > 0 && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {p.zugewiesen}{" "}
                      {p.zugewiesen === 1 ? "Zuweisung" : "Zuweisungen"}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-[hsl(var(--primary))]" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
