/**
 * Client-safe Types und Helpers fuer Kontakte. Hat KEINE
 * Supabase-Imports und kann von Client-Components genutzt werden.
 * Server-Loaders liegen in lib/kontakte.ts und re-exportieren diese.
 */

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

export function vollerName(k: Kontakt): string {
  const teile = [k.first_name, k.last_name]
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .map((s) => s.trim());
  return teile.join(" ") || "—";
}
