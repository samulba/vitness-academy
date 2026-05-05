import { createClient } from "@/lib/supabase/server";
import { istNextJsControlFlow } from "@/lib/admin/safe-loader";
import type { Notiz } from "@/lib/mitarbeiter-notizen-types";

export type { Notiz } from "@/lib/mitarbeiter-notizen-types";

const SELECT = `
  id, mitarbeiter_id, autor_id, body, created_at,
  autor:autor_id ( full_name, avatar_path )
`;

type Roh = {
  id: string;
  mitarbeiter_id: string;
  autor_id: string | null;
  body: string;
  created_at: string;
  autor: { full_name: string | null; avatar_path: string | null } | null;
};

function map(r: Roh): Notiz {
  return {
    id: r.id,
    mitarbeiter_id: r.mitarbeiter_id,
    autor_id: r.autor_id,
    autor_name: r.autor?.full_name ?? null,
    autor_avatar_path: r.autor?.avatar_path ?? null,
    body: r.body,
    created_at: r.created_at,
  };
}

/**
 * Lädt Notizen zu einer Mitarbeiter:in. Defensiv: bei fehlender
 * Migration leeres Array.
 */
export async function ladeNotizen(mitarbeiterId: string): Promise<Notiz[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mitarbeiter_notizen")
      .select(SELECT)
      .eq("mitarbeiter_id", mitarbeiterId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[ladeNotizen] supabase error:", error);
      return [];
    }
    return ((data ?? []) as unknown as Roh[]).map(map);
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeNotizen] unexpected error:", e);
    return [];
  }
}
