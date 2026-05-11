import { createClient } from "@/lib/supabase/server";
import { joinName } from "@/lib/admin/safe-loader";
import type {
  BugKategorie,
  BugPrioritaet,
  BugQuelle,
  BugReport,
  BugStatus,
} from "@/lib/bug-reports-types";

// Re-exports für Server-Seite
export type {
  BugKategorie,
  BugPrioritaet,
  BugQuelle,
  BugReport,
  BugStatus,
} from "@/lib/bug-reports-types";
export {
  BUG_KATEGORIE_LABEL,
  BUG_OFFENE_STATUS,
  BUG_PRIORITAET_LABEL,
  BUG_QUELLE_LABEL,
  BUG_STATUS_LABEL,
} from "@/lib/bug-reports-types";

type Roh = {
  id: string;
  error_digest: string | null;
  pfad: string | null;
  user_agent: string | null;
  fehler_message: string | null;
  fehler_stack: string | null;
  beschreibung: string | null;
  kategorie: string;
  quelle: string;
  screenshot_path: string | null;
  status: string;
  prioritaet: string;
  duplikat_von: string | null;
  admin_notiz: string | null;
  reported_by: string | null;
  reporter: unknown;
  assigned_to: string | null;
  assignee: unknown;
  meldungen_count: number;
  letzte_meldung_at: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

const SELECT = `
  id, error_digest, pfad, user_agent, fehler_message, fehler_stack,
  beschreibung, kategorie, quelle, screenshot_path,
  status, prioritaet, duplikat_von, admin_notiz,
  reported_by, reporter:reported_by ( full_name ),
  assigned_to, assignee:assigned_to ( full_name ),
  meldungen_count, letzte_meldung_at,
  created_at, updated_at, resolved_at
`;

const STATUS: BugStatus[] = [
  "neu",
  "in_bearbeitung",
  "behoben",
  "verworfen",
  "duplikat",
];
const PRIO: BugPrioritaet[] = ["niedrig", "normal", "hoch", "kritisch"];
const KAT: BugKategorie[] = ["bug", "ui", "vorschlag", "sonstiges"];
const QUE: BugQuelle[] = ["error_popup", "manuell"];

function map(r: Roh): BugReport {
  return {
    id: r.id,
    error_digest: r.error_digest,
    pfad: r.pfad,
    user_agent: r.user_agent,
    fehler_message: r.fehler_message,
    fehler_stack: r.fehler_stack,
    beschreibung: r.beschreibung,
    kategorie: (KAT.includes(r.kategorie as BugKategorie)
      ? r.kategorie
      : "bug") as BugKategorie,
    quelle: (QUE.includes(r.quelle as BugQuelle)
      ? r.quelle
      : "manuell") as BugQuelle,
    screenshot_path: r.screenshot_path,
    status: (STATUS.includes(r.status as BugStatus)
      ? r.status
      : "neu") as BugStatus,
    prioritaet: (PRIO.includes(r.prioritaet as BugPrioritaet)
      ? r.prioritaet
      : "normal") as BugPrioritaet,
    duplikat_von: r.duplikat_von,
    admin_notiz: r.admin_notiz,
    reported_by: r.reported_by,
    reported_by_name: joinName(r.reporter),
    assigned_to: r.assigned_to,
    assigned_to_name: joinName(r.assignee),
    meldungen_count: r.meldungen_count ?? 1,
    letzte_meldung_at: r.letzte_meldung_at,
    created_at: r.created_at,
    updated_at: r.updated_at,
    resolved_at: r.resolved_at,
  };
}

export async function ladeBugReports(opts?: {
  status?: BugStatus[];
  quelle?: BugQuelle;
}): Promise<BugReport[]> {
  const supabase = await createClient();
  let q = supabase
    .from("bug_reports")
    .select(SELECT)
    .order("letzte_meldung_at", { ascending: false });
  if (opts?.status && opts.status.length > 0) {
    q = q.in("status", opts.status);
  }
  if (opts?.quelle) {
    q = q.eq("quelle", opts.quelle);
  }
  const { data } = await q;
  return ((data ?? []) as unknown as Roh[]).map(map);
}

export async function ladeBugReport(id: string): Promise<BugReport | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bug_reports")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  return data ? map(data as unknown as Roh) : null;
}

/**
 * Sucht einen offenen Report mit gleichem error_digest.
 * Wird für Dedup beim Melden aus dem Error-Popup genutzt.
 */
export async function findeOffenenBugByDigest(
  digest: string,
): Promise<BugReport | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bug_reports")
    .select(SELECT)
    .eq("error_digest", digest)
    .in("status", ["neu", "in_bearbeitung"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data ? map(data as unknown as Roh) : null;
}

/**
 * Signed URL für ein Screenshot im privaten Bucket.
 * Server-only -- darf nur in Server-Components/Loadern verwendet werden.
 */
export async function screenshotSignedUrl(
  path: string | null,
  expiresInSec = 60 * 10,
): Promise<string | null> {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("bug-screenshots")
    .createSignedUrl(path, expiresInSec);
  return data?.signedUrl ?? null;
}
