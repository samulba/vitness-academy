"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, Pencil, Search } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { StatusPill } from "@/components/admin/StatusPill";
import { formatDatum } from "@/lib/format";
import type { AuthStatus } from "@/lib/admin/auth-status";

export type Zeile = {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
  location_name: string | null;
  zugewiesen: number;
  archived_at: string | null;
  vertragsart: string | null;
  tags: string[];
  onboarding_erledigt: number;
  onboarding_gesamt: number;
  auth_status: AuthStatus;
};

const VERTRAG_LABEL: Record<string, string> = {
  vollzeit: "Vollzeit",
  teilzeit: "Teilzeit",
  minijob: "Minijob",
  aushilfe: "Aushilfe",
  selbstaendig: "Selbstständig",
  praktikant: "Praktikant:in",
  sonstiges: "Sonstiges",
};

function AuthStatusPill({ status }: { status: AuthStatus }) {
  if (status === "eingeladen")
    return <StatusPill ton="warn" dot>Eingeladen</StatusPill>;
  if (status === "inaktiv")
    return <StatusPill ton="neutral">Inaktiv</StatusPill>;
  return <StatusPill ton="success" dot>Aktiv</StatusPill>;
}

function RollenPill({ role }: { role: string }) {
  if (role === "mitarbeiter")
    return <StatusPill ton="neutral">Mitarbeiter</StatusPill>;
  if (role === "fuehrungskraft")
    return <StatusPill ton="info">Führungskraft</StatusPill>;
  if (role === "admin") return <StatusPill ton="primary">Admin</StatusPill>;
  return <StatusPill ton="primary">Superadmin</StatusPill>;
}

export function BenutzerTable({ benutzer }: { benutzer: Zeile[] }) {
  const tagSet = new Set<string>();
  for (const b of benutzer) {
    for (const t of b.tags ?? []) {
      if (typeof t === "string" && t.length > 0) tagSet.add(t);
    }
  }
  const tagOptions = Array.from(tagSet)
    .sort((a, b) => a.localeCompare(b, "de"))
    .map((t) => ({ value: t, label: t }));

  const vertragSet = new Set<string>();
  for (const b of benutzer) {
    if (b.vertragsart) vertragSet.add(b.vertragsart);
  }
  const vertragOptions = Array.from(vertragSet).map((v) => ({
    value: v,
    label: VERTRAG_LABEL[v] ?? v,
  }));

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
            {b.tags.length > 0 && (
              <div className="mt-0.5 flex flex-wrap gap-1">
                {b.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full bg-[hsl(var(--brand-pink)/0.08)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]"
                  >
                    {t}
                  </span>
                ))}
                {b.tags.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{b.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "auth_status",
      label: "Status",
      sortable: true,
      render: (b) => <AuthStatusPill status={b.auth_status} />,
    },
    {
      key: "role",
      label: "Rolle",
      sortable: true,
      render: (b) => <RollenPill role={b.role} />,
    },
    {
      key: "vertragsart",
      label: "Vertrag",
      sortable: true,
      render: (b) =>
        b.vertragsart ? (
          <StatusPill ton="neutral">
            {VERTRAG_LABEL[b.vertragsart] ?? b.vertragsart}
          </StatusPill>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        ),
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
      key: "onboarding_erledigt",
      label: "Onboarding",
      sortable: true,
      align: "right",
      render: (b) => {
        if (b.onboarding_gesamt === 0) {
          return <span className="text-xs text-muted-foreground/50">—</span>;
        }
        const fertig = b.onboarding_erledigt === b.onboarding_gesamt;
        return (
          <StatusPill ton={fertig ? "success" : "warn"}>
            {b.onboarding_erledigt}/{b.onboarding_gesamt}
          </StatusPill>
        );
      },
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

  const filterList = [
    {
      key: "auth_status",
      label: "Status",
      options: [
        { value: "eingeladen", label: "Eingeladen" },
        { value: "aktiv", label: "Aktiv" },
        { value: "inaktiv", label: "Inaktiv" },
      ],
      multi: true,
    },
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
    ...(vertragOptions.length > 0
      ? [{ key: "vertragsart", label: "Vertrag", options: vertragOptions, multi: true }]
      : []),
    ...(tagOptions.length > 0
      ? [{ key: "tags", label: "Tag", options: tagOptions, multi: true }]
      : []),
  ];

  return (
    <>
      <div className="lg:hidden">
        <BenutzerCardsMobile benutzer={benutzer} />
      </div>

      <div className="hidden lg:block">
        <DataTable<Zeile>
          data={benutzer}
          columns={columns}
          searchable={{
            placeholder: "Mitarbeiter suchen…",
            keys: ["full_name", "location_name"],
          }}
          filters={filterList}
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
      </div>
    </>
  );
}

function BenutzerCardsMobile({ benutzer }: { benutzer: Zeile[] }) {
  const [query, setQuery] = useState("");
  const gefiltert = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return benutzer;
    return benutzer.filter((b) => {
      const name = (b.full_name ?? "").toLowerCase();
      const ort = (b.location_name ?? "").toLowerCase();
      return name.includes(q) || ort.includes(q);
    });
  }, [benutzer, query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Mitarbeiter suchen…"
          className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 placeholder:text-muted-foreground/70 focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {gefiltert.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Keine Treffer.
        </div>
      ) : (
        <ul className="space-y-2">
          {gefiltert.map((b) => (
            <li key={b.id}>
              <Link
                href={`/admin/benutzer/${b.id}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-[hsl(var(--primary)/0.4)] active:bg-muted/50"
              >
                <ColoredAvatar name={b.full_name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold leading-tight">
                      {b.full_name ?? "—"}
                    </p>
                    {b.archived_at && (
                      <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        Archiv
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <AuthStatusPill status={b.auth_status} />
                    <RollenPill role={b.role} />
                    {b.onboarding_gesamt > 0 && (
                      <StatusPill
                        ton={
                          b.onboarding_erledigt === b.onboarding_gesamt
                            ? "success"
                            : "warn"
                        }
                      >
                        Onb. {b.onboarding_erledigt}/{b.onboarding_gesamt}
                      </StatusPill>
                    )}
                    {b.zugewiesen > 0 && (
                      <span className="inline-flex items-center rounded-full bg-[hsl(var(--brand-pink)/0.10)] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-[hsl(var(--brand-pink))]">
                        {b.zugewiesen} Pfade
                      </span>
                    )}
                  </div>
                  {b.location_name && (
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
                      {b.location_name}
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
