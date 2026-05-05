import { createClient } from "@/lib/supabase/server";

export type ContactRole = {
  id: string;
  name: string;
  sort_order: number;
};

const FALLBACK: ContactRole[] = [
  { id: "fb-vertrieb", name: "Vertrieb", sort_order: 10 },
  { id: "fb-trainer", name: "Trainer", sort_order: 20 },
  { id: "fb-service", name: "Service", sort_order: 30 },
  { id: "fb-reha", name: "Reha", sort_order: 40 },
  { id: "fb-reinigung", name: "Reinigung", sort_order: 50 },
  { id: "fb-lieferant", name: "Lieferant", sort_order: 60 },
  { id: "fb-sonstiges", name: "Sonstiges", sort_order: 100 },
];

/**
 * Laedt den Rollen-Katalog. Wenn die Tabelle (Migration 0037) noch
 * nicht existiert, wird ein Fallback-Set mit Standard-Rollen
 * geliefert -- kein Application-Error.
 */
export async function ladeRollen(): Promise<ContactRole[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studio_contact_roles")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error || !data || data.length === 0) {
    return FALLBACK;
  }
  return data as ContactRole[];
}
