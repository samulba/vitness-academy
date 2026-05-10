"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  Search,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type Column<T> = {
  /** Eindeutiger Spalten-Key, z.B. ein Property-Name */
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  /** CSS-width oder Tailwind-Klassen, z.B. "w-[200px]" */
  width?: string;
  /** Custom Renderer für die Zelle. Default: row[key] als String. */
  render?: (row: T) => React.ReactNode;
  /** Wenn nicht selber rendert: Property zum Lesen. Standard ist `key`. */
  accessor?: (row: T) => unknown;
};

export type Filter = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  /** Aktuell aktive Werte (controlled) */
  value?: string[];
  onChange?: (values: string[]) => void;
  /** Erlaubt mehrere Werte gleichzeitig (Default: single) */
  multi?: boolean;
};

export type RowAction<T> = {
  icon: React.ReactNode;
  label: string;
  /** Klick auf das Action-Icon -- z.B. Modal öffnen, löschen. */
  onClick?: (row: T) => void;
  /** Wenn `href` gesetzt, wird der Action-Button zum Link */
  href?: (row: T) => string;
  /** Visuelle Variante: "default" (muted->foreground) oder "danger" (->destructive) */
  variant?: "default" | "danger";
};

/**
 * Tabelle mit Toolbar, Sort und Row-Actions im Linear/Vercel-Stil.
 *
 * Zentrale Eigenschaften:
 *  - Toolbar oben: Such-Input links, Filter-Chips mit Caret, rechts optionale
 *    Sort-Dropdown.
 *  - Header-Zellen mit Sort-Icons (sortable: true).
 *  - Zeilen: Hover bekommt Magenta-Tint, Action-Icons fade rechts ein.
 *  - Eine Zeile kann optional über rowHref komplett zum Link werden
 *    (z.B. Detail-Page).
 *  - Empty: nutzt den übergebenen <EmptyState/> oder zeigt Default-Text.
 *
 * Sortierung und Filterung sind clientseitig in dieser Komponente. Wenn
 * Server-Side gewünscht ist, kann man `controlledSort` und
 * `controlledFilters` setzen -- siehe Props.
 *
 * @example
 *   type Mitarbeiter = { id: string; name: string; rolle: string; anzahl: number };
 *   <DataTable<Mitarbeiter>
 *     data={mitarbeiter}
 *     columns={[
 *       { key: "name", label: "Name", sortable: true, render: (r) => <NameCell r={r} /> },
 *       { key: "rolle", label: "Rolle", sortable: true },
 *       { key: "anzahl", label: "Lernpfade", sortable: true, align: "right" },
 *     ]}
 *     searchable={{ placeholder: "Suchen…", keys: ["name"] }}
 *     filters={[
 *       {
 *         key: "rolle",
 *         label: "Rolle",
 *         options: [
 *           { value: "mitarbeiter", label: "Mitarbeiter" },
 *           { value: "admin", label: "Admin" },
 *         ],
 *       },
 *     ]}
 *     rowHref={(r) => `/admin/benutzer/${r.id}`}
 *     rowActions={[
 *       { icon: <Pencil />, label: "Bearbeiten", href: (r) => `/admin/benutzer/${r.id}` },
 *       { icon: <Trash2 />, label: "Löschen", onClick: (r) => deleteRow(r), variant: "danger" },
 *     ]}
 *     emptyState={<EmptyState ... />}
 *   />
 */
export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  searchable,
  filters,
  rowActions,
  rowHref,
  emptyState,
  defaultSort,
  className,
}: {
  columns: Column<T>[];
  data: T[];
  /** Wenn `true`: Standard-Search über alle string-cols. Object: customizable. */
  searchable?: boolean | { placeholder?: string; keys?: (keyof T)[] };
  filters?: Filter[];
  rowActions?: RowAction<T>[];
  /** Wenn gesetzt: Title-Zelle (erste Spalte) wird zum Link */
  rowHref?: (row: T) => string;
  /** Custom Empty-State, sonst Default-Text */
  emptyState?: React.ReactNode;
  defaultSort?: { key: string; direction: "asc" | "desc" };
  className?: string;
}) {
  const searchConfig =
    typeof searchable === "object" ? searchable : { placeholder: "Suchen…" };
  const showSearch = Boolean(searchable);

  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<
    { key: string; direction: "asc" | "desc" } | null
  >(defaultSort ?? null);
  const [activeFilters, setActiveFilters] = React.useState<
    Record<string, string[]>
  >({});

  // ---- Filtering / Searching / Sorting ----
  const filtered = React.useMemo(() => {
    let rows = data;

    // Filter
    for (const f of filters ?? []) {
      const active = f.value ?? activeFilters[f.key] ?? [];
      if (active.length > 0) {
        rows = rows.filter((r) => {
          const v = (r as unknown as Record<string, unknown>)[f.key];
          return active.includes(String(v));
        });
      }
    }

    // Search
    if (showSearch && query.trim()) {
      const q = query.trim().toLowerCase();
      const keys =
        typeof searchable === "object" && searchable.keys
          ? searchable.keys
          : (Object.keys(rows[0] ?? {}).filter((k) => {
              const v = (rows[0] as Record<string, unknown>)?.[k];
              return typeof v === "string";
            }) as (keyof T)[]);

      rows = rows.filter((r) =>
        keys.some((k) => {
          const v = (r as unknown as Record<string, unknown>)[k as string];
          return typeof v === "string" && v.toLowerCase().includes(q);
        }),
      );
    }

    // Sort
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col) {
        const get = col.accessor ?? ((r: T) => (r as unknown as Record<string, unknown>)[col.key]);
        rows = [...rows].sort((a, b) => {
          const va = get(a);
          const vb = get(b);
          const res = compare(va, vb);
          return sort.direction === "asc" ? res : -res;
        });
      }
    }

    return rows;
  }, [data, filters, searchable, showSearch, query, sort, columns, activeFilters]);

  const isEmpty = filtered.length === 0;

  function toggleSort(key: string) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      {(showSearch || (filters && filters.length > 0)) && (
        <Toolbar
          showSearch={showSearch}
          searchPlaceholder={searchConfig.placeholder}
          query={query}
          onQuery={setQuery}
          filters={filters}
          activeFilters={activeFilters}
          onFiltersChange={setActiveFilters}
        />
      )}

      {isEmpty ? (
        emptyState ?? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            Keine Einträge.
          </div>
        )
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    style={c.width ? { width: c.width } : undefined}
                    className={cn(
                      "px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
                      c.align === "right" && "text-right",
                      c.align === "center" && "text-center",
                    )}
                  >
                    {c.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded transition-colors hover:text-foreground",
                          c.align === "right" && "flex-row-reverse",
                        )}
                      >
                        {c.label}
                        {sort?.key === c.key ? (
                          sort.direction === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </button>
                    ) : (
                      c.label
                    )}
                  </th>
                ))}
                {rowActions && rowActions.length > 0 && (
                  <th className="w-px px-4 py-2.5" />
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <Row
                  key={String(row.id)}
                  row={row}
                  columns={columns}
                  rowHref={rowHref}
                  rowActions={rowActions}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------- internal pieces ----------

function Toolbar({
  showSearch,
  searchPlaceholder,
  query,
  onQuery,
  filters,
  activeFilters,
  onFiltersChange,
}: {
  showSearch: boolean;
  searchPlaceholder?: string;
  query: string;
  onQuery: (q: string) => void;
  filters?: Filter[];
  activeFilters: Record<string, string[]>;
  onFiltersChange: (next: Record<string, string[]>) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
      {showSearch && (
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="search"
            placeholder={searchPlaceholder ?? "Suchen…"}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-2.5 text-[13px] placeholder:text-muted-foreground/60 focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      )}

      {filters?.map((f) => (
        <FilterChip
          key={f.key}
          filter={f}
          active={f.value ?? activeFilters[f.key] ?? []}
          onChange={(values) => {
            if (f.onChange) f.onChange(values);
            else onFiltersChange({ ...activeFilters, [f.key]: values });
          }}
        />
      ))}
    </div>
  );
}

function FilterChip({
  filter,
  active,
  onChange,
}: {
  filter: Filter;
  active: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const labelExtra =
    active.length > 0
      ? filter.multi
        ? ` · ${active.length}`
        : ` · ${filter.options.find((o) => o.value === active[0])?.label ?? ""}`
      : "";

  function toggle(value: string) {
    if (filter.multi) {
      onChange(
        active.includes(value)
          ? active.filter((v) => v !== value)
          : [...active, value],
      );
    } else {
      onChange(active[0] === value ? [] : [value]);
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-[12px] font-medium transition-colors",
          "hover:border-[hsl(var(--brand-pink)/0.4)]",
          active.length > 0
            ? "text-foreground"
            : "text-muted-foreground",
        )}
      >
        {filter.label}
        <span className="text-muted-foreground">{labelExtra}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[180px] overflow-hidden rounded-md border border-border bg-popover shadow-md">
          {filter.options.map((o) => {
            const isActive = active.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggle(o.value)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-muted",
                  isActive && "text-foreground",
                )}
              >
                {o.label}
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-pink))]" />
                )}
              </button>
            );
          })}
          {active.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="block w-full border-t border-border px-3 py-1.5 text-left text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Row<T extends { id: string | number }>({
  row,
  columns,
  rowHref,
  rowActions,
}: {
  row: T;
  columns: Column<T>[];
  rowHref?: (row: T) => string;
  rowActions?: RowAction<T>[];
}) {
  const href = rowHref?.(row);

  return (
    <tr className="group border-b border-border transition-colors last:border-b-0 hover:bg-[hsl(var(--brand-pink)/0.04)]">
      {columns.map((c, idx) => {
        const get = c.accessor ?? ((r: T) => (r as unknown as Record<string, unknown>)[c.key]);
        const v = c.render ? c.render(row) : (get(row) as React.ReactNode);

        const cellClass = cn(
          "px-4 py-3 align-middle",
          c.align === "right" && "text-right",
          c.align === "center" && "text-center",
        );

        // Erste Spalte wird zum Link, falls rowHref gesetzt
        if (idx === 0 && href) {
          return (
            <td key={c.key} className={cellClass}>
              <Link
                href={href}
                className="-mx-1 -my-1 block rounded px-1 py-1 group-hover:text-foreground"
              >
                {v}
              </Link>
            </td>
          );
        }
        return (
          <td key={c.key} className={cellClass}>
            {v}
          </td>
        );
      })}

      {rowActions && rowActions.length > 0 && (
        <td className="w-px whitespace-nowrap px-4 py-2">
          <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            {rowActions.map((a, i) => (
              <RowActionButton key={i} action={a} row={row} />
            ))}
          </div>
        </td>
      )}
    </tr>
  );
}

function RowActionButton<T>({ action, row }: { action: RowAction<T>; row: T }) {
  const cls = cn(
    "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors sm:h-7 sm:w-7 [&_svg]:size-3.5",
    action.variant === "danger"
      ? "text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive"
      : "text-muted-foreground/70 hover:bg-muted hover:text-foreground",
  );
  if (action.href) {
    return (
      <Link
        href={action.href(row)}
        aria-label={action.label}
        title={action.label}
        className={cls}
      >
        {action.icon}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => action.onClick?.(row)}
      aria-label={action.label}
      title={action.label}
      className={cls}
    >
      {action.icon}
    </button>
  );
}

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "de", { sensitivity: "base" });
}
