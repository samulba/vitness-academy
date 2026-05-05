import { createClient } from "@/lib/supabase/server";

export type AuditAction = "insert" | "update" | "delete";

export type AuditEntry = {
  id: number;
  table_name: string;
  row_id: string | null;
  action: AuditAction;
  actor_id: string | null;
  actor_name: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  at: string;
};

export type AuditFilter = {
  tableName?: string;
  action?: AuditAction;
  actorId?: string;
  /** ISO-Datum, wir filtern at >= sinceIso */
  sinceIso?: string;
  limit?: number;
};

const SELECT = `
  id, table_name, row_id, action, actor_id, before, after, at,
  actor:actor_id ( full_name )
`;

type Roh = {
  id: number;
  table_name: string;
  row_id: string | null;
  action: string;
  actor_id: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  at: string;
  actor: { full_name: string | null } | null;
};

export async function ladeAuditLog(filter: AuditFilter = {}): Promise<AuditEntry[]> {
  const supabase = await createClient();
  let q = supabase.from("audit_log").select(SELECT).order("at", { ascending: false });
  if (filter.tableName) q = q.eq("table_name", filter.tableName);
  if (filter.action) q = q.eq("action", filter.action);
  if (filter.actorId) q = q.eq("actor_id", filter.actorId);
  if (filter.sinceIso) q = q.gte("at", filter.sinceIso);
  q = q.limit(filter.limit ?? 100);
  const { data } = await q;
  return ((data ?? []) as unknown as Roh[]).map((r) => ({
    id: r.id,
    table_name: r.table_name,
    row_id: r.row_id,
    action: r.action as AuditAction,
    actor_id: r.actor_id,
    actor_name: r.actor?.full_name ?? null,
    before: r.before,
    after: r.after,
    at: r.at,
  }));
}

export async function ladeTabellenNamen(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("table_name")
    .order("table_name");
  const seen = new Set<string>();
  for (const r of (data ?? []) as { table_name: string }[]) {
    seen.add(r.table_name);
  }
  return Array.from(seen).sort();
}

const TABELLEN_LABEL: Record<string, string> = {
  profiles: "Mitarbeiter",
  locations: "Standorte",
  learning_paths: "Lernpfade",
  modules: "Module",
  lessons: "Lektionen",
  lesson_content_blocks: "Inhaltsblöcke",
  user_learning_path_assignments: "Pfad-Zuweisungen",
  quizzes: "Quizze",
  quiz_questions: "Quizfragen",
  quiz_options: "Quizoptionen",
  practical_tasks: "Praxisaufgaben",
  user_practical_signoffs: "Praxisfreigaben",
  knowledge_articles: "Handbuch-Artikel",
  knowledge_categories: "Handbuch-Kategorien",
  studio_contacts: "Kontakte",
  studio_announcements: "Wichtige Infos",
  studio_tasks: "Aufgaben",
  studio_issues: "Mängel",
  form_templates: "Formulare",
  commission_entries: "Provisions-Einträge",
  commission_rates: "Provisions-Sätze",
  commission_rates_personal: "Persönliche Sätze",
  commission_bonus_stufen: "Bonus-Stufen",
  commission_payouts: "Monats-Abrechnungen",
  commission_targets: "Monatsziele",
};

export function tabellenLabel(name: string): string {
  return TABELLEN_LABEL[name] ?? name;
}

const ACTION_LABEL: Record<AuditAction, string> = {
  insert: "Angelegt",
  update: "Geändert",
  delete: "Gelöscht",
};

export function actionLabel(action: AuditAction): string {
  return ACTION_LABEL[action];
}

/**
 * Liefert die Felder, die sich zwischen before und after geändert haben.
 * Liefert leeres Array bei insert/delete.
 */
export function geaenderteFelder(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): Array<{ key: string; alt: unknown; neu: unknown }> {
  if (!before || !after) return [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const out: Array<{ key: string; alt: unknown; neu: unknown }> = [];
  for (const k of keys) {
    if (k === "updated_at") continue;
    const a = before[k];
    const b = after[k];
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      out.push({ key: k, alt: a, neu: b });
    }
  }
  return out;
}
