import { createClient } from "@/lib/supabase/server";

export type Kontakt = {
  id: string;
  location_id: string | null;
  first_name: string | null;
  last_name: string | null;
  role_tags: string[];
  phone: string | null;
  email: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export async function ladeKontakte(
  locationId?: string | null,
): Promise<Kontakt[]> {
  const supabase = await createClient();
  let q = supabase
    .from("studio_contacts")
    .select(
      "id, location_id, first_name, last_name, role_tags, phone, email, notes, sort_order, created_at, updated_at",
    )
    .order("sort_order", { ascending: true })
    .order("last_name", { ascending: true });
  if (locationId) {
    q = q.or(`location_id.eq.${locationId},location_id.is.null`);
  }
  const { data } = await q;
  return (data ?? []) as Kontakt[];
}

export async function ladeKontakt(id: string): Promise<Kontakt | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("studio_contacts")
    .select(
      "id, location_id, first_name, last_name, role_tags, phone, email, notes, sort_order, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();
  return (data as Kontakt | null) ?? null;
}

/**
 * Sammelt alle einzigartigen role_tags aus allen Kontakten —
 * fuer den Filter-Pill-Bereich auf /kontakte.
 */
export function eindeutigeRollen(kontakte: Kontakt[]): string[] {
  const set = new Set<string>();
  for (const k of kontakte) {
    for (const r of k.role_tags) {
      if (r.trim().length > 0) set.add(r);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, "de"));
}

export function vollerName(k: Kontakt): string {
  return [k.first_name, k.last_name].filter(Boolean).join(" ").trim() || "—";
}
