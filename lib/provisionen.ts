import { createClient } from "@/lib/supabase/server";
import { joinName, istNextJsControlFlow } from "@/lib/admin/safe-loader";
import {
  berechneProvision,
  type BonusStufe,
  type CommissionEntry,
  type CommissionRate,
  type EntryStatus,
  type Laufzeit,
  type MonatStat,
  type Payout,
  type PayoutStatus,
  type Target,
} from "@/lib/provisionen-types";

// Re-exports for server convenience
export type {
  BonusStufe,
  CommissionEntry,
  CommissionRate,
  EntryStatus,
  Laufzeit,
  MonatStat,
  Payout,
  PayoutStatus,
  Target,
} from "@/lib/provisionen-types";
export {
  LAUFZEIT_OPTIONS,
  PAYOUT_STATUS_LABEL,
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
  // einfach leer zurück. Loggen damit echte DB-Fehler im Server-Log
  // sichtbar werden.
  if (personalRes.error) {
    console.warn("[ladeRates] commission_rates_personal nicht verfuegbar:", personalRes.error);
  }
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

/**
 * Lädt das Ziel eines Vertrieblers für einen bestimmten Monat. Wenn
 * keins existiert oder die Migration fehlt, gibt null zurück (UI
 * blendet den Tracker dann aus).
 */
export async function ladeTarget(
  vertrieblerId: string,
  monatYYYYMM: string,
): Promise<Target | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commission_targets")
    .select(
      "id, vertriebler_id, monat_yyyymm, ziel_abschluesse, ziel_provision, notiz",
    )
    .eq("vertriebler_id", vertrieblerId)
    .eq("monat_yyyymm", monatYYYYMM)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    vertriebler_id: data.vertriebler_id,
    monat_yyyymm: data.monat_yyyymm,
    ziel_abschluesse:
      typeof data.ziel_abschluesse === "number"
        ? data.ziel_abschluesse
        : null,
    ziel_provision: data.ziel_provision !== null ? num(data.ziel_provision) : null,
    notiz: data.notiz,
  };
}

/**
 * Lädt alle Targets eines Vertrieblers (für Admin-Setup-Ansicht).
 */
export async function ladeTargets(vertrieblerId: string): Promise<Target[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commission_targets")
    .select(
      "id, vertriebler_id, monat_yyyymm, ziel_abschluesse, ziel_provision, notiz",
    )
    .eq("vertriebler_id", vertrieblerId)
    .order("monat_yyyymm", { ascending: false });
  if (error) return [];
  return ((data ?? []) as Target[]).map((t) => ({
    id: t.id,
    vertriebler_id: t.vertriebler_id,
    monat_yyyymm: t.monat_yyyymm,
    ziel_abschluesse:
      typeof t.ziel_abschluesse === "number" ? t.ziel_abschluesse : null,
    ziel_provision: t.ziel_provision !== null ? num(t.ziel_provision) : null,
    notiz: t.notiz,
  }));
}

/**
 * Berechnet die Monats-Historie für einen Vertriebler -- ein Eintrag
 * pro Monat aus den letzten N Monaten. Sortiert chronologisch
 * (ältester zuerst, damit Recharts X-Axis logisch ist).
 *
 * Berücksichtigt nur 'genehmigt'-Einträge (inkl. Stornos = negativ).
 */
export async function ladeMonatsHistorie(
  vertrieblerId: string,
  monate = 6,
): Promise<MonatStat[]> {
  const supabase = await createClient();
  const heute = new Date();
  // Zeitraum: ab dem ersten Tag des Monats vor `monate` Monaten
  const start = new Date(heute.getFullYear(), heute.getMonth() - (monate - 1), 1);
  const startIso = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("commission_entries")
    .select(ENTRY_SELECT)
    .eq("vertriebler_id", vertrieblerId)
    .eq("status", "genehmigt")
    .gte("datum", startIso)
    .order("datum", { ascending: true });

  if (error) return [];

  const rows = (data ?? []) as unknown as EntryRoh[];
  const rates = await ladeRates();
  const entries = rows.map((r) => mapEntry(r, rates));

  // Initialisiere alle Monate mit 0 (auch leere)
  const buckets = new Map<string, MonatStat>();
  for (let i = 0; i < monate; i++) {
    const d = new Date(heute.getFullYear(), heute.getMonth() - (monate - 1) + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, { monat: key, abschluesse: 0, provision: 0 });
  }

  for (const e of entries) {
    const key = e.datum.slice(0, 7);
    const cur = buckets.get(key);
    if (!cur) continue;
    cur.abschluesse += e.storno_von_id ? -1 : 1;
    cur.provision += e.provision;
  }

  return Array.from(buckets.values()).sort((a, b) =>
    a.monat.localeCompare(b.monat),
  );
}

// =============================================================
// Payouts (Monats-Abrechnung)
// =============================================================

const PAYOUT_SELECT = `
  id, monat_yyyymm, vertriebler_id, abschluesse_anzahl, provision_summe,
  bonus_summe, total, bonus_stufe_info, status, ausgezahlt_am,
  ausgezahlt_via, ausgezahlt_note, locked_by, locked_at,
  vertriebler:vertriebler_id ( full_name ),
  locker:locked_by ( full_name )
`;

type PayoutRoh = {
  id: string;
  monat_yyyymm: string;
  vertriebler_id: string;
  abschluesse_anzahl: number | string;
  provision_summe: number | string;
  bonus_summe: number | string;
  total: number | string;
  bonus_stufe_info: string | null;
  status: string;
  ausgezahlt_am: string | null;
  ausgezahlt_via: string | null;
  ausgezahlt_note: string | null;
  locked_by: string | null;
  locked_at: string;
  vertriebler: { full_name: string | null } | null;
  locker: unknown;
};

function mapPayout(r: PayoutRoh): Payout {
  const status = (
    ["offen", "ausgezahlt", "geblockt"].includes(r.status)
      ? r.status
      : "offen"
  ) as PayoutStatus;
  return {
    id: r.id,
    monat_yyyymm: r.monat_yyyymm,
    vertriebler_id: r.vertriebler_id,
    vertriebler_name: r.vertriebler?.full_name ?? null,
    abschluesse_anzahl:
      typeof r.abschluesse_anzahl === "number"
        ? r.abschluesse_anzahl
        : parseInt(r.abschluesse_anzahl, 10) || 0,
    provision_summe: num(r.provision_summe),
    bonus_summe: num(r.bonus_summe),
    total: num(r.total),
    bonus_stufe_info: r.bonus_stufe_info,
    status,
    ausgezahlt_am: r.ausgezahlt_am,
    ausgezahlt_via: r.ausgezahlt_via,
    ausgezahlt_note: r.ausgezahlt_note,
    locked_by: r.locked_by,
    locked_by_name: joinName(r.locker),
    locked_at: r.locked_at,
  };
}

/**
 * Lädt alle Payouts (Filter optional). Wenn die Migration noch nicht
 * eingespielt ist, kommt ein leeres Array zurück.
 */
export async function ladePayouts(opts?: {
  monatYYYYMM?: string;
  vertrieblerId?: string;
}): Promise<Payout[]> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("commission_payouts")
      .select(PAYOUT_SELECT)
      .order("monat_yyyymm", { ascending: false })
      .order("locked_at", { ascending: false });
    if (opts?.monatYYYYMM) q = q.eq("monat_yyyymm", opts.monatYYYYMM);
    if (opts?.vertrieblerId) q = q.eq("vertriebler_id", opts.vertrieblerId);
    const { data, error } = await q;
    if (error) {
      console.error("[ladePayouts] supabase error:", error);
      return [];
    }
    return ((data ?? []) as unknown as PayoutRoh[]).map(mapPayout);
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladePayouts] unexpected error:", e);
    return [];
  }
}

/**
 * Sammelt für einen Monat alle Vertriebler-Vorschauen (vor dem Lock):
 * Wer hat wie viele genehmigte Abschlüsse, wie hoch wäre Provision +
 * Bonus, und somit Total. Wird auf der Abrechnungs-Page angezeigt
 * BEVOR der Admin auf "abrechnen" klickt.
 */
export async function ladeAbrechnungsVorschau(
  monatYYYYMM: string,
): Promise<
  {
    vertriebler_id: string;
    vertriebler_name: string | null;
    abschluesse_anzahl: number;
    provision_summe: number;
    bonus_summe: number;
    total: number;
    bonus_stufe_info: string | null;
  }[]
> {
  const [entries, bonusStufen] = await Promise.all([
    ladeEntries({ monatYYYYMM, status: ["genehmigt"] }),
    ladeBonusStufen(),
  ]);

  // Pro Vertriebler aggregieren
  const map = new Map<
    string,
    {
      vertriebler_id: string;
      vertriebler_name: string | null;
      abschluesse_anzahl: number;
      provision_summe: number;
    }
  >();
  for (const e of entries) {
    const cur = map.get(e.vertriebler_id);
    const delta = e.storno_von_id ? -1 : 1;
    if (cur) {
      cur.abschluesse_anzahl += delta;
      cur.provision_summe += e.provision;
    } else {
      map.set(e.vertriebler_id, {
        vertriebler_id: e.vertriebler_id,
        vertriebler_name: e.vertriebler_name,
        abschluesse_anzahl: delta,
        provision_summe: e.provision,
      });
    }
  }

  // Bonus pro Vertriebler dazulegen
  const monatsEnde = `${monatYYYYMM}-31`;
  return Array.from(map.values()).map((v) => {
    // Passende Stufe finden
    const passend = bonusStufen
      .filter(
        (s) =>
          s.valid_from <= monatsEnde &&
          s.ab_abschluessen <= v.abschluesse_anzahl &&
          (s.vertriebler_id === v.vertriebler_id ||
            s.vertriebler_id === null),
      )
      .sort((a, b) => {
        if (a.vertriebler_id && !b.vertriebler_id) return -1;
        if (!a.vertriebler_id && b.vertriebler_id) return 1;
        return b.ab_abschluessen - a.ab_abschluessen;
      });
    const stufe = passend[0] ?? null;
    const bonus_summe = stufe
      ? (v.provision_summe * stufe.bonus_prozent) / 100
      : 0;
    return {
      vertriebler_id: v.vertriebler_id,
      vertriebler_name: v.vertriebler_name,
      abschluesse_anzahl: v.abschluesse_anzahl,
      provision_summe: v.provision_summe,
      bonus_summe,
      total: v.provision_summe + bonus_summe,
      bonus_stufe_info: stufe
        ? `+${stufe.bonus_prozent}% ab ${stufe.ab_abschluessen} Abschlüssen`
        : null,
    };
  });
}
