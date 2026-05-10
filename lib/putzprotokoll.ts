import { createClient } from "@/lib/supabase/server";
import { istNextJsControlFlow } from "@/lib/admin/safe-loader";
import type {
  CleaningProtocol,
  CleaningSection,
  CleaningTemplate,
  ProtocolSectionEntry,
} from "@/lib/putzprotokoll-types";

// Re-export client-safe types
export {
  cleaningPhotoUrl,
  FOTO_MAX_BYTES,
  type CleaningProtocol,
  type CleaningSection,
  type CleaningTemplate,
  type ProtocolSectionEntry,
  type ProtocolStatus,
} from "@/lib/putzprotokoll-types";

/**
 * Laedt das aktive Template + alle Sections für einen Standort.
 * Sections sortiert nach sort_order.
 */
export async function ladeTemplateMitSections(
  locationId: string,
): Promise<{ template: CleaningTemplate; sections: CleaningSection[] } | null> {
  const supabase = await createClient();
  try {
    const { data: tpl, error: tplErr } = await supabase
      .from("cleaning_protocol_templates")
      .select("id, location_id, active, created_at, updated_at")
      .eq("location_id", locationId)
      .eq("active", true)
      .maybeSingle();
    if (tplErr || !tpl) return null;

    const { data: sections, error: secErr } = await supabase
      .from("cleaning_protocol_sections")
      .select("id, template_id, titel, aufgaben, sort_order, created_at")
      .eq("template_id", tpl.id)
      .order("sort_order", { ascending: true });
    if (secErr) return null;

    return {
      template: tpl as CleaningTemplate,
      sections: (sections ?? []).map((s) => ({
        ...(s as CleaningSection),
        aufgaben: Array.isArray(s.aufgaben) ? (s.aufgaben as string[]) : [],
      })),
    };
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeTemplateMitSections]", e);
    return null;
  }
}

const PROTOKOLL_SELECT = `
  id, location_id, datum, sections, general_note, status,
  submitted_by, submitted_at, reviewed_by, reviewed_at, review_note,
  submitted_by_profile:profiles!cleaning_protocols_submitted_by_fkey(full_name),
  reviewed_by_profile:profiles!cleaning_protocols_reviewed_by_fkey(full_name),
  location:locations!cleaning_protocols_location_id_fkey(name)
`;

type RohProtokoll = {
  id: string;
  location_id: string;
  datum: string;
  sections: unknown;
  general_note: string | null;
  status: "eingereicht" | "reviewed";
  submitted_by: string | null;
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  submitted_by_profile?: { full_name: string | null } | null;
  reviewed_by_profile?: { full_name: string | null } | null;
  location?: { name: string | null } | null;
};

function map(r: RohProtokoll): CleaningProtocol {
  const sections = Array.isArray(r.sections)
    ? (r.sections as ProtocolSectionEntry[])
    : [];
  return {
    id: r.id,
    location_id: r.location_id,
    datum: r.datum,
    sections,
    general_note: r.general_note,
    status: r.status,
    submitted_by: r.submitted_by,
    submitted_by_name: r.submitted_by_profile?.full_name ?? null,
    submitted_at: r.submitted_at,
    reviewed_by: r.reviewed_by,
    reviewed_by_name: r.reviewed_by_profile?.full_name ?? null,
    reviewed_at: r.reviewed_at,
    review_note: r.review_note,
    location_name: r.location?.name ?? null,
  };
}

/**
 * Laedt das Putzprotokoll für Standort + Datum (heute).
 * Liefert null wenn für diesen Tag noch keins eingereicht wurde.
 */
export async function ladeProtokollFuerDatum(
  locationId: string,
  datumISO: string,
): Promise<CleaningProtocol | null> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("cleaning_protocols")
      .select(PROTOKOLL_SELECT)
      .eq("location_id", locationId)
      .eq("datum", datumISO)
      .maybeSingle();
    if (error || !data) return null;
    return map(data as unknown as RohProtokoll);
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeProtokollFuerDatum]", e);
    return null;
  }
}

export async function ladeProtokoll(
  id: string,
): Promise<CleaningProtocol | null> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("cleaning_protocols")
      .select(PROTOKOLL_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return map(data as unknown as RohProtokoll);
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeProtokoll]", e);
    return null;
  }
}

/**
 * Liste für Admin-View. Optional gefiltert auf Standort + Datum-Range.
 */
export async function ladeProtokolleListe(opts?: {
  locationId?: string | null;
  vonDatum?: string;
  bisDatum?: string;
  limit?: number;
}): Promise<CleaningProtocol[]> {
  const supabase = await createClient();
  try {
    let q = supabase
      .from("cleaning_protocols")
      .select(PROTOKOLL_SELECT)
      .order("datum", { ascending: false })
      .limit(opts?.limit ?? 50);
    if (opts?.locationId) q = q.eq("location_id", opts.locationId);
    if (opts?.vonDatum) q = q.gte("datum", opts.vonDatum);
    if (opts?.bisDatum) q = q.lte("datum", opts.bisDatum);
    const { data, error } = await q;
    if (error) return [];
    return ((data ?? []) as unknown as RohProtokoll[]).map(map);
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeProtokolleListe]", e);
    return [];
  }
}

/** ISO-Date heute (Server-Zeit, UTC date). */
export function heuteISO(): string {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
