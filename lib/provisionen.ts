import { createClient } from "@/lib/supabase/server";
import {
  berechneProvision,
  type CommissionEntry,
  type CommissionRate,
  type Laufzeit,
} from "@/lib/provisionen-types";

// Re-exports for server convenience
export type {
  CommissionEntry,
  CommissionRate,
  Laufzeit,
} from "@/lib/provisionen-types";
export {
  LAUFZEIT_OPTIONS,
  berechneProvision,
  formatEuro,
  laufzeitLabel,
} from "@/lib/provisionen-types";

const ENTRY_SELECT = `
  id, vertriebler_id, location_id, datum,
  mitglied_name, mitglied_nummer, laufzeit,
  beitrag_14taegig, beitrag_netto, startpaket, getraenke_soli,
  bemerkung, created_at,
  vertriebler:vertriebler_id ( full_name )
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
  created_at: string;
  vertriebler: { full_name: string | null } | null;
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
    provision: berechneProvision(
      { laufzeit: lf, datum: r.datum, beitrag_netto, startpaket },
      rates,
    ),
    created_at: r.created_at,
  };
}

export async function ladeRates(): Promise<CommissionRate[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("commission_rates")
    .select("id, laufzeit, prozent_beitrag, prozent_startpaket, valid_from")
    .order("valid_from", { ascending: false });
  return ((data ?? []) as {
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
  }));
}

export async function ladeEntries(opts?: {
  vertrieblerId?: string;
  locationId?: string | null;
  monatYYYYMM?: string;
  limit?: number;
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

/** Aggregate für Header-Stats (Monat oder Gesamt-Range). */
export function aggregiere(entries: CommissionEntry[]): {
  abschluesse: number;
  provision_total: number;
} {
  return {
    abschluesse: entries.length,
    provision_total: entries.reduce((s, e) => s + e.provision, 0),
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
