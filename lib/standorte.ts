import { createClient } from "@/lib/supabase/server";

export type Standort = {
  id: string;
  name: string;
  created_at: string;
  mitarbeiter_count: number;
};

export async function ladeStandorte(): Promise<Standort[]> {
  const supabase = await createClient();
  const { data: locs } = await supabase
    .from("locations")
    .select("id, name, created_at")
    .order("name", { ascending: true });

  const ids = (locs ?? []).map((l) => l.id as string);
  const counts = new Map<string, number>();
  if (ids.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("location_id")
      .in("location_id", ids);
    for (const p of (profs ?? []) as { location_id: string | null }[]) {
      if (p.location_id) {
        counts.set(p.location_id, (counts.get(p.location_id) ?? 0) + 1);
      }
    }
  }

  return ((locs ?? []) as { id: string; name: string; created_at: string }[]).map(
    (l) => ({
      id: l.id,
      name: l.name,
      created_at: l.created_at,
      mitarbeiter_count: counts.get(l.id) ?? 0,
    }),
  );
}

export async function ladeStandort(id: string): Promise<Standort | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("id, name, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("location_id", id);
  return {
    id: data.id as string,
    name: data.name as string,
    created_at: data.created_at as string,
    mitarbeiter_count: count ?? 0,
  };
}

export type StandortMitarbeiter = {
  id: string;
  full_name: string | null;
  role: string;
};

export async function ladeMitarbeiterAnStandort(
  locationId: string,
): Promise<StandortMitarbeiter[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("location_id", locationId)
    .order("full_name");
  return (data ?? []) as StandortMitarbeiter[];
}
