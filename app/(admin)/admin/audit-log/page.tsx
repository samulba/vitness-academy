import {
  Activity,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FilterPills } from "@/components/admin/FilterPills";
import {
  actionLabel,
  geaenderteFelder,
  ladeAuditLog,
  tabellenLabel,
  type AuditAction,
} from "@/lib/audit";

const ACTION_FILTER: AuditAction[] = ["insert", "update", "delete"];

const TABELLEN: string[] = [
  "profiles",
  "learning_paths",
  "modules",
  "lessons",
  "lesson_content_blocks",
  "user_learning_path_assignments",
  "quizzes",
  "quiz_questions",
  "quiz_options",
  "practical_tasks",
  "user_practical_signoffs",
  "knowledge_articles",
  "knowledge_categories",
  "studio_contacts",
  "studio_announcements",
  "studio_tasks",
  "studio_issues",
  "form_templates",
];

function actionStyle(a: AuditAction): {
  label: string;
  icon: React.ReactNode;
  pill: string;
} {
  switch (a) {
    case "insert":
      return {
        label: actionLabel(a),
        icon: <Plus className="h-3.5 w-3.5" />,
        pill: "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]",
      };
    case "update":
      return {
        label: actionLabel(a),
        icon: <Pencil className="h-3.5 w-3.5" />,
        pill: "bg-amber-100 text-amber-700",
      };
    case "delete":
      return {
        label: actionLabel(a),
        icon: <Trash2 className="h-3.5 w-3.5" />,
        pill: "bg-destructive/10 text-destructive",
      };
  }
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") {
    return v.length > 80 ? `${v.slice(0, 77)}…` : v;
  }
  if (typeof v === "boolean") return v ? "ja" : "nein";
  if (typeof v === "number") return String(v);
  const s = JSON.stringify(v);
  return s.length > 80 ? `${s.slice(0, 77)}…` : s;
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

  const eintraege = await ladeAuditLog({ tableName, action, limit: 200 });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audit-Log"
        description="Wer hat wann was geändert. Letzte 200 Ereignisse."
      />

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
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <Activity className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            Keine Audit-Einträge mit diesem Filter.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {eintraege.map((e) => {
            const style = actionStyle(e.action);
            const diffs =
              e.action === "update" ? geaenderteFelder(e.before, e.after) : [];
            return (
              <li
                key={e.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.pill}`}
                    >
                      {style.icon}
                      {style.label}
                    </span>
                    <span className="text-sm font-semibold">
                      {tabellenLabel(e.table_name)}
                    </span>
                    {e.row_id && (
                      <span className="font-mono text-[11px] text-muted-foreground/80">
                        {e.row_id.length > 8
                          ? `…${e.row_id.slice(-8)}`
                          : e.row_id}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fmtDateTime(e.at)}
                    {e.actor_name && <> · {e.actor_name}</>}
                  </div>
                </div>

                {e.action === "update" && diffs.length > 0 && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 text-left">Feld</th>
                          <th className="px-3 py-2 text-left">Vorher</th>
                          <th className="px-3 py-2 text-left">Nachher</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diffs.slice(0, 6).map((d) => (
                          <tr key={d.key} className="border-t border-border">
                            <td className="px-3 py-2 font-medium">{d.key}</td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {shortValue(d.alt)}
                            </td>
                            <td className="px-3 py-2">{shortValue(d.neu)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {diffs.length > 6 && (
                      <p className="border-t border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                        +{diffs.length - 6} weitere Felder geändert
                      </p>
                    )}
                  </div>
                )}

                {e.action === "insert" && e.after && (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {(() => {
                      const t =
                        (e.after as Record<string, unknown>).title ??
                        (e.after as Record<string, unknown>).name ??
                        (e.after as Record<string, unknown>).full_name;
                      if (typeof t === "string") return t;
                      return null;
                    })()}
                  </p>
                )}

                {e.action === "delete" && e.before && (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {(() => {
                      const t =
                        (e.before as Record<string, unknown>).title ??
                        (e.before as Record<string, unknown>).name ??
                        (e.before as Record<string, unknown>).full_name;
                      if (typeof t === "string") return t;
                      return null;
                    })()}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

