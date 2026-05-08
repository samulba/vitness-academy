import { Activity, History, Pencil, Plus, Trash2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterPills } from "@/components/admin/FilterPills";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import {
  actionLabel,
  geaenderteFelder,
  ladeAuditLog,
  tabellenLabel,
  type AuditAction,
  type AuditEntry,
} from "@/lib/audit";

const ACTION_FILTER: AuditAction[] = ["insert", "update", "delete"];

/**
 * Quick-Filter-Pills: nur die Tabellen, die im Alltag relevant sind.
 * Andere Tabellen (Lernpfade-Inhalte, Quiz-Optionen, etc.) erscheinen
 * weiter im Log, sind aber kein Daily-Quick-Filter.
 */
const TABELLEN: string[] = [
  "profiles",
  "studio_tasks",
  "studio_issues",
  "studio_announcements",
  "studio_contacts",
  "form_templates",
];

function actionStyle(a: AuditAction): {
  label: string;
  icon: React.ReactNode;
  dotClass: string;
  pillClass: string;
} {
  switch (a) {
    case "insert":
      return {
        label: actionLabel(a),
        icon: <Plus className="h-3 w-3" />,
        dotClass: "bg-[hsl(var(--success))]",
        pillClass:
          "bg-[hsl(var(--success)/0.14)] text-[hsl(var(--success))]",
      };
    case "update":
      return {
        label: actionLabel(a),
        icon: <Pencil className="h-3 w-3" />,
        dotClass: "bg-amber-500",
        pillClass: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      };
    case "delete":
      return {
        label: actionLabel(a),
        icon: <Trash2 className="h-3 w-3" />,
        dotClass: "bg-destructive",
        pillClass: "bg-destructive/10 text-destructive",
      };
  }
}

function fmtZeit(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function tagLabel(iso: string): string {
  const d = new Date(iso);
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const dTag = new Date(iso);
  dTag.setHours(0, 0, 0, 0);
  const diffTage = Math.round(
    (heute.getTime() - dTag.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffTage === 0) return "Heute";
  if (diffTage === 1) return "Gestern";
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: heute.getFullYear() === d.getFullYear() ? undefined : "numeric",
  });
}

function tagKey(iso: string): string {
  return iso.slice(0, 10);
}

function shortValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") {
    return v.length > 60 ? `${v.slice(0, 57)}…` : v;
  }
  if (typeof v === "boolean") return v ? "ja" : "nein";
  if (typeof v === "number") return String(v);
  const s = JSON.stringify(v);
  return s.length > 60 ? `${s.slice(0, 57)}…` : s;
}

function entityName(e: AuditEntry): string | null {
  const data = e.action === "delete" ? e.before : e.after;
  if (!data) return null;
  const t =
    (data as Record<string, unknown>).title ??
    (data as Record<string, unknown>).name ??
    (data as Record<string, unknown>).full_name;
  return typeof t === "string" ? t : null;
}

function gruppeNachTag(eintraege: AuditEntry[]): {
  key: string;
  label: string;
  items: AuditEntry[];
}[] {
  const map = new Map<string, AuditEntry[]>();
  for (const e of eintraege) {
    const k = tagKey(e.at);
    const arr = map.get(k) ?? [];
    arr.push(e);
    map.set(k, arr);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, items]) => ({
      key,
      label: tagLabel(items[0].at),
      items,
    }));
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(["admin", "superadmin"]);
  const sp = await searchParams;

  const tableName = typeof sp.tabelle === "string" ? sp.tabelle : undefined;
  const action =
    typeof sp.aktion === "string" &&
    (ACTION_FILTER as string[]).includes(sp.aktion)
      ? (sp.aktion as AuditAction)
      : undefined;

  const roh = await ladeAuditLog({ tableName, action, limit: 200 });
  // Update-Eintraege ausblenden, wenn nach dem Rausch-Filter keine
  // sichtbare Aenderung uebrig bleibt (z.B. nur updated_at touched).
  const eintraege = roh.filter((e) => {
    if (e.action !== "update") return true;
    return geaenderteFelder(e.before, e.after).length > 0;
  });
  const tage = gruppeNachTag(eintraege);
  const inserts = eintraege.filter((e) => e.action === "insert").length;
  const updates = eintraege.filter((e) => e.action === "update").length;
  const deletes = eintraege.filter((e) => e.action === "delete").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Auswertung"
        title="Audit-Log"
        description="Wer hat wann was geändert. Letzte 200 Ereignisse als Timeline."
      />

      <StatGrid cols={4}>
        <StatCard
          label="Ereignisse"
          value={eintraege.length}
          icon={<History />}
        />
        <StatCard label="Anlegen" value={inserts} icon={<Plus />} />
        <StatCard label="Ändern" value={updates} icon={<Pencil />} />
        <StatCard
          label="Löschen"
          value={deletes}
          icon={<Trash2 />}
          trend={
            deletes > 0
              ? { value: deletes, direction: "down", hint: "im Zeitraum" }
              : undefined
          }
        />
      </StatGrid>

      <div className="space-y-2">
        <FilterPills
          items={[
            {
              href: "/admin/audit-log",
              label: "Alle",
              aktiv: !tableName && !action,
            },
            ...ACTION_FILTER.map((a) => ({
              href: tableName
                ? `/admin/audit-log?aktion=${a}&tabelle=${tableName}`
                : `/admin/audit-log?aktion=${a}`,
              label: actionLabel(a),
              aktiv: action === a,
            })),
          ]}
        />
        <FilterPills
          size="sm"
          items={TABELLEN.map((t) => ({
            href: action
              ? `/admin/audit-log?aktion=${action}&tabelle=${t}`
              : `/admin/audit-log?tabelle=${t}`,
            label: tabellenLabel(t),
            aktiv: tableName === t,
          }))}
        />
      </div>

      {eintraege.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            title="Keine Audit-Einträge"
            description="Mit diesem Filter ist nichts passiert. Probier einen anderen Zeitraum oder eine andere Tabelle."
            actions={[
              {
                icon: <Activity />,
                title: "Alle anzeigen",
                description: "Filter zurücksetzen",
                href: "/admin/audit-log",
              },
            ]}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {tage.map((tag) => (
            <section key={tag.key}>
              <div className="sticky top-0 z-10 -mx-1 mb-3 flex items-baseline gap-3 bg-background/85 px-1 py-2 backdrop-blur">
                <h2 className="text-[15px] font-semibold tracking-tight">
                  {tag.label}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {tag.items.length}{" "}
                  {tag.items.length === 1 ? "Ereignis" : "Ereignisse"}
                </span>
              </div>
              <ol className="relative space-y-3 pl-6">
                {/* Vertikale Timeline-Linie */}
                <span
                  aria-hidden
                  className="absolute left-[7px] top-2 bottom-2 w-px bg-border"
                />
                {tag.items.map((e) => (
                  <TimelineEintrag key={e.id} e={e} />
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineEintrag({ e }: { e: AuditEntry }) {
  const style = actionStyle(e.action);
  const diffs = e.action === "update" ? geaenderteFelder(e.before, e.after) : [];
  const name = entityName(e);

  return (
    <li className="relative">
      {/* Dot auf der Timeline */}
      <span
        aria-hidden
        className={`absolute -left-[22px] top-3 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-2 ring-background ${style.dotClass}`}
      />
      <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-[hsl(var(--brand-pink)/0.3)]">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.pillClass}`}
            >
              {style.icon}
              {style.label}
            </span>
            <span className="text-[13px] font-medium">
              {tabellenLabel(e.table_name)}
            </span>
            {name && (
              <span className="text-[13px] text-muted-foreground">
                · {name}
              </span>
            )}
            {e.row_id && !name && (
              <span className="font-mono text-[11px] text-muted-foreground/70">
                {e.row_id.length > 8 ? `…${e.row_id.slice(-8)}` : e.row_id}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {e.actor_name && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ColoredAvatar name={e.actor_name} size="sm" />
                <span>{e.actor_name}</span>
              </span>
            )}
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
              {fmtZeit(e.at)}
            </span>
          </div>
        </div>

        {e.action === "update" && diffs.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {diffs.slice(0, 4).map((d) => (
              <div
                key={d.key}
                className="flex flex-wrap items-baseline gap-2 text-xs"
              >
                <span className="font-medium tabular-nums text-foreground">
                  {d.key}
                </span>
                <span className="text-muted-foreground line-through">
                  {shortValue(d.alt)}
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium text-[hsl(var(--brand-pink))]">
                  {shortValue(d.neu)}
                </span>
              </div>
            ))}
            {diffs.length > 4 && (
              <p className="text-[11px] text-muted-foreground/70">
                +{diffs.length - 4} weitere Felder geändert
              </p>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
