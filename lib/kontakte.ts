import { createClient } from "@/lib/supabase/server";
import { istNextJsControlFlow } from "@/lib/admin/safe-loader";
import type { Kontakt } from "@/lib/kontakte-types";

// Re-exports für Server-Convenience -- Server-Code kann weiter
// aus @/lib/kontakte importieren.
export { vollerName, type Kontakt } from "@/lib/kontakte-types";

const SELECT =
  "id, location_id, first_name, last_name, role_tags, phone, email, notes, sort_order, created_at, updated_at";

type Roh = {
  id: string;
  location_id: string | null;
  first_name: string | null;
  last_name: string | null;
  role_tags: unknown;
  phone: string | null;
  email: string | null;
  notes: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

function map(r: Roh): Kontakt {
  return {
    id: r.id,
    location_id: r.location_id ?? null,
    first_name: r.first_name ?? null,
    last_name: r.last_name ?? null,
    role_tags: Array.isArray(r.role_tags)
      ? (r.role_tags as unknown[])
          .map((v) => (typeof v === "string" ? v : ""))
          .filter((v) => v.length > 0)
      : [],
    phone: r.phone ?? null,
    email: r.email ?? null,
    notes: r.notes ?? null,
    sort_order: typeof r.sort_order === "number" ? r.sort_order : 0,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

export async function ladeKontakte(
  locationId?: string | null,
): Promise<Kontakt[]> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("studio_contacts")
      .select(SELECT)
      .order("sort_order", { ascending: true })
      .order("last_name", { ascending: true });
    if (locationId) {
      q = q.or(`location_id.eq.${locationId},location_id.is.null`);
    }
    const { data, error } = await q;
    if (error) {
      console.error("[ladeKontakte] supabase error:", error);
      return [];
    }
    return ((data ?? []) as unknown as Roh[]).map(map);
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeKontakte] unexpected error:", e);
    return [];
  }
}

export async function ladeKontakt(id: string): Promise<Kontakt | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("studio_contacts")
      .select(SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return map(data as unknown as Roh);
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeKontakt] unexpected error:", e);
    return null;
  }
}

/**
 * Sammelt alle einzigartigen role_tags aus allen Kontakten —
 * für den Filter-Pill-Bereich auf /kontakte. Defensiv: ueberspringt
 * Einträge ohne Array.
 */
export function eindeutigeRollen(kontakte: Kontakt[]): string[] {
  const set = new Set<string>();
  for (const k of kontakte) {
    if (!Array.isArray(k.role_tags)) continue;
    for (const r of k.role_tags) {
      if (typeof r === "string" && r.trim().length > 0) set.add(r);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, "de"));
}
