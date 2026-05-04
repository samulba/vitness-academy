import { createClient } from "@/lib/supabase/server";

export type Kudo = {
  id: string;
  from_user: string;
  from_name: string | null;
  from_avatar: string | null;
  to_user: string;
  to_name: string | null;
  to_avatar: string | null;
  message: string;
  location_id: string | null;
  created_at: string;
};

const SELECT_COLS = `
  id, from_user, to_user, message, location_id, created_at,
  sender:from_user ( full_name, avatar_path ),
  empfaenger:to_user ( full_name, avatar_path )
`;

type Roh = {
  id: string;
  from_user: string;
  to_user: string;
  message: string;
  location_id: string | null;
  created_at: string;
  sender: { full_name: string | null; avatar_path: string | null } | null;
  empfaenger: { full_name: string | null; avatar_path: string | null } | null;
};

function map(r: Roh): Kudo {
  return {
    id: r.id,
    from_user: r.from_user,
    from_name: r.sender?.full_name ?? null,
    from_avatar: r.sender?.avatar_path ?? null,
    to_user: r.to_user,
    to_name: r.empfaenger?.full_name ?? null,
    to_avatar: r.empfaenger?.avatar_path ?? null,
    message: r.message,
    location_id: r.location_id,
    created_at: r.created_at,
  };
}

export async function ladeKudos(opts?: {
  limit?: number;
  locationId?: string | null;
}): Promise<Kudo[]> {
  const supabase = await createClient();
  let q = supabase
    .from("kudos")
    .select(SELECT_COLS)
    .order("created_at", { ascending: false });
  if (opts?.locationId)
    q = q.or(`location_id.eq.${opts.locationId},location_id.is.null`);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return ((data ?? []) as unknown as Roh[]).map(map);
}

/** Empfänger-Picker: alle aktiven Profile außer self. */
export async function ladeEmpfaengerOptionen(
  selfId: string,
): Promise<{ id: string; name: string; avatar_path: string | null }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_path")
    .neq("id", selfId)
    .is("archived_at", null)
    .order("full_name", { ascending: true });
  return ((data ?? []) as {
    id: string;
    full_name: string | null;
    avatar_path: string | null;
  }[])
    .filter((p) => p.full_name && p.full_name.trim().length > 0)
    .map((p) => ({
      id: p.id,
      name: p.full_name as string,
      avatar_path: p.avatar_path,
    }));
}
