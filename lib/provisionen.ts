import { createClient } from "@/lib/supabase/server";
import { joinName } from "@/lib/admin/safe-loader";
import {
  berechneProvision,
  type BonusStufe,
  type CommissionEntry,
  type CommissionRate,
  type EntryStatus,
  type Laufzeit,
} from "@/lib/provisionen-types";

// Re-exports for server convenience
export type {
  BonusStufe,
  CommissionEntry,
  CommissionRate,
  EntryStatus,
  Laufzeit,
} from "@/lib/provisionen-types";
export {
  LAUFZEIT_OPTIONS,
  STATUS_LABEL,
  berechneMonatsTotal,
  berechneProvision,
  findeBonusStufe,
  findeRate,
  formatEuro,
  laufzeitLabel,
} from "@/lib/provisionen-types";

const ENTRY_SELECT = `
  id, vertriebler_id, location_id, datum,
  mitglied_name, mitglied_nummer, laufzeit,
  beitrag_14taegig, beitrag_netto, startpaket, getraenke_soli,
  bemerkung, status, reviewed_by, reviewed_at, review_note,
  storno_von_id, storno_grund, created_at,
  vertriebler:vertriebler_id ( full_name ),
  reviewer:reviewed_by ( full_name )
`;

type EntryRoh = {
  id: string;
  vertriebler_id: string;
  location_id: string | null;
  datum: string;
  mitglied_name: string;
  mitglied_nummer: string | null;
  laufzeit: string;
  beitrag_14taegig: number | string;
  beitrag_netto: number | string;
  startpaket: number | string;
  getraenke_soli: number | string;
  bemerkung: string | null;
  status: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  storno_von_id: string | null;
  storno_grund: string | null;
  created_at: string;
  vertriebler: { full_name: string | null } | null;
  reviewer: unknown;
};

function num(v: number | string | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

function mapEntry(r: EntryRoh, rates: CommissionRate[]): CommissionEntry {
  const lf = (["26", "52", "104"].includes(r.laufzeit)
    ? r.laufzeit
    : "sonst") as Laufzeit;
  const beitrag_netto = num(r.beitrag_netto);
  const startpaket = num(r.startpaket);
  const status = (
    ["eingereicht", "genehmigt", "abgelehnt", "storniert"].includes(
      r.status ?? "",
    )
      ? r.status
      : "genehmigt"
  ) as EntryStatus;
  return {
    id: r.id,
    vertriebler_id: r.vertriebler_id,
    vertriebler_name: r.vertriebler?.full_name ?? null,
    location_id: r.location_id,
    datum: r.datum,
    mitglied_name: r.mitglied_name,
    mitglied_nummer: r.mitglied_nummer,
    laufzeit: lf,
    beitrag_14taegig: num(r.beitrag_14taegig),
    beitrag_netto,
    startpaket,
    getraenke_soli: num(r.getraenke_soli),
    bemerkung: r.bemerkung,
    status,
    reviewed_by: r.reviewed_by,
    reviewed_by_name: joinName(r.reviewer),
    reviewed_at: r.reviewed_at,
    review_note: r.review_note,
    storno_von_id: r.storno_von_id,
    storno_grund: r.storno_grund,
    provision: berechneProvision(
      { laufzeit: lf, datum: r.datum, beitrag_netto, startpaket },
      rates,
      r.vertriebler_id,
    ),
    created_at: r.created_at,
  };
}

/**
 * Lädt alle Sätze: Default (vertriebler_id=null) + persönliche Sätze
 * aller Vertriebler. App-Layer entscheidet pro Eintrag, welcher Satz
 * greift (siehe findeRate).
 */
export async function ladeRates(): Promise<CommissionRate[]> {
  const supabase = await createClient();
  const [defRes, personalRes] = await Promise.all([
    supabase
      .from("commission_rates")
      .select("id, laufzeit, prozent_beitrag, prozent_startpaket, valid_from")
      .order("valid_from", { ascending: false }),
    supabase
      .from("commission_rates_personal")
      .select(
        "id, vertriebler_id, laufzeit, prozent_beitrag, prozent_startpaket, valid_from, notiz",
      )
      .order("valid_from", { ascending: false }),
  ]);

  const defaults = ((defRes.data ?? []) as {
    id: string;
    laufzeit: string;
    prozent_beitrag: number | string;
    prozent_startpaket: number | string;
    valid_from: string;
  }[]).map((r) => ({
    id: r.id,
    laufzeit: (["26", "52", "104"].includes(r.laufzeit)
      ? r.laufzeit
      : "sonst") as Laufzeit,
    prozent_beitrag: num(r.prozent_beitrag),
    prozent_startpaket: num(r.prozent_startpaket),
    valid_from: r.valid_from,
    vertriebler_id: null,
    notiz: null,
  }));

  // Persönliche Sätze -- bei Fehler (Migration noch nicht eingespielt)
  // einfach leer zurück.
  const personal: CommissionRate[] = personalRes.error
    ? []
    : ((personalRes.data ?? []) as {
        id: string;
        vertriebler_id: string;
        laufzeit: string;
        prozent_beitrag: number | string;
        prozent_startpaket: number | string;
        valid_from: string;
        notiz: string | null;
      }[]).map((r) => ({
        id: r.id,
        vertriebler_id: r.vertriebler_id,
        laufzeit: (["26", "52", "104"].includes(r.laufzeit)
          ? r.laufzeit
          : "sonst") as Laufzeit,
        prozent_beitrag: num(r.prozent_beitrag),
        prozent_startpaket: num(r.prozent_startpaket),
        valid_from: r.valid_from,
        notiz: r.notiz,
      }));

  return [...defaults, ...personal];
}

/**
 * Lädt Bonus-Stufen: Default (vertriebler_id=null) + persönliche.
 * Bei fehlender Migration → leere Liste.
 */
export async function ladeBonusStufen(): Promise<BonusStufe[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commission_bonus_stufen")
    .select("id, vertriebler_id, ab_abschluessen, bonus_prozent, valid_from, notiz")
    .order("ab_abschluessen", { ascending: true });
  if (error) return [];
  return ((data ?? []) as {
    id: string;
    vertriebler_id: string | null;
    ab_abschluessen: number | string;
    bonus_prozent: number | string;
    valid_from: string;
    notiz: string | null;
  }[]).map((r) => ({
    id: r.id,
    vertriebler_id: r.vertriebler_id,
    ab_abschluessen: typeof r.ab_abschluessen === "number"
      ? r.ab_abschluessen
      : parseInt(r.ab_abschluessen, 10) || 0,
    bonus_prozent: num(r.bonus_prozent),
    valid_from: r.valid_from,
    notiz: r.notiz,
  }));
}

export async function ladeEntries(opts?: {
  vertrieblerId?: string;
  locationId?: string | null;
  monatYYYYMM?: string;
  limit?: number;
  status?: EntryStatus[];
}): Promise<CommissionEntry[]> {
  const supabase = await createClient();
  let q = supabase
    .from("commission_entries")
    .select(ENTRY_SELECT)
    .order("datum", { ascending: false })
    .order("created_at", { ascending: false });
  if (opts?.vertrieblerId) q = q.eq("vertriebler_id", opts.vertrieblerId);
  if (opts?.locationId)
    q = q.or(`location_id.eq.${opts.locationId},location_id.is.null`);
  if (opts?.status && opts.status.length > 0) q = q.in("status", opts.status);
  if (opts?.monatYYYYMM) {
    const [yyyy, mm] = opts.monatYYYYMM.split("-");
    const start = `${yyyy}-${mm}-01`;
    // letzter Tag des Monats
    const next = new Date(Number(yyyy), Number(mm), 1);
    const ende = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`;
    q = q.gte("datum", start).lt("datum", ende);
  }
  if (opts?.limit) q = q.limit(opts.limit);
  const { data } = await q;
  const rows = (data ?? []) as unknown as EntryRoh[];
  const rates = await ladeRates();
  return rows.map((r) => mapEntry(r, rates));
}

/**
 * Ausstehende (status='eingereicht') Einträge für die Admin-Inbox.
 * Sortiert: älteste zuerst (FIFO).
 */
export async function ladeAusstehend(opts?: {
  locationId?: string | null;
}): Promise<CommissionEntry[]> {
  const supabase = await createClient();
  let q = supabase
    .from("commission_entries")
    .select(ENTRY_SELECT)
    .eq("status", "eingereicht")
    .order("created_at", { ascending: true });
  if (opts?.locationId)
    q = q.or(`location_id.eq.${opts.locationId},location_id.is.null`);
  const { data } = await q;
  const rows = (data ?? []) as unknown as EntryRoh[];
  const rates = await ladeRates();
  return rows.map((r) => mapEntry(r, rates));
}

export async function ladeEntry(id: string): Promise<CommissionEntry | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("commission_entries")
    .select(ENTRY_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const rates = await ladeRates();
  return mapEntry(data as unknown as EntryRoh, rates);
}

/**
 * Aggregate für Header-Stats. Zählt nur 'genehmigt'-Einträge (inkl.
 * Storno-Einträge mit Negativ-Beträgen → automatisches Netting in der
 * Summe). 'eingereicht' und 'abgelehnt' fließen NICHT in die Auszahlung.
 *
 * Storno-Einträge zählen als negative Abschlüsse (z.B. -1) damit der
 * Counter im Ranking nicht "doppelt" zählt.
 */
export function aggregiere(entries: CommissionEntry[]): {
  abschluesse: number;
  provision_total: number;
} {
  const relevant = entries.filter((e) => e.status === "genehmigt");
  const abschluesse = relevant.reduce(
    (s, e) => s + (e.storno_von_id ? -1 : 1),
    0,
  );
  return {
    abschluesse,
    provision_total: relevant.reduce((s, e) => s + e.provision, 0),
  };
}

export async function ladeVertriebler(): Promise<
  { id: string; full_name: string | null }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("kann_provisionen", true)
    .is("archived_at", null)
    .order("full_name", { ascending: true });
  return (data ?? []) as { id: string; full_name: string | null }[];
}
