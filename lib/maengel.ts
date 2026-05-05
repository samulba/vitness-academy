import { createClient } from "@/lib/supabase/server";
import type { Mangel, Severity, Status } from "@/lib/maengel-types";

// Re-exports for convenience auf der Server-Seite
export type { Mangel, Severity, Status } from "@/lib/maengel-types";
export {
  STATUS_LABEL,
  SEVERITY_LABEL,
  fotoUrlFuerPfad,
} from "@/lib/maengel-types";

type Roh = {
  id: string;
  location_id: string | null;
  title: string;
  description: string | null;
  photo_paths: string[] | null;
  status: string;
  severity: string;
  reported_by: string | null;
  reporter: { full_name: string | null; avatar_path: string | null } | null;
  assigned_to: string | null;
  assignee: { full_name: string | null } | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

const SELECT = `
  id, location_id, title, description, photo_paths, status, severity,
  reported_by, reporter:reported_by ( full_name, avatar_path ),
  assigned_to, assignee:assigned_to ( full_name ),
  resolution_note, created_at, updated_at, resolved_at
`;

function map(r: Roh): Mangel {
  return {
    id: r.id,
    location_id: r.location_id,
    title: r.title,
    description: r.description,
    photo_paths: Array.isArray(r.photo_paths) ? r.photo_paths : [],
    status: (["offen", "in_bearbeitung", "behoben", "verworfen"].includes(r.status)
      ? r.status
      : "offen") as Status,
    severity: (["niedrig", "normal", "kritisch"].includes(r.severity)
      ? r.severity
      : "normal") as Severity,
    reported_by: r.reported_by,
    reported_by_name: r.reporter?.full_name ?? null,
    reported_by_avatar_path: r.reporter?.avatar_path ?? null,
    assigned_to: r.assigned_to,
    assigned_to_name: r.assignee?.full_name ?? null,
    resolution_note: r.resolution_note,
    created_at: r.created_at,
    updated_at: r.updated_at,
    resolved_at: r.resolved_at,
  };
}

export type MangelStats = {
  offen: number;
  in_bearbeitung: number;
  behoben_diese_woche: number;
  gemeldet_diese_woche: number;
  aktivster_melder: {
    id: string;
    name: string | null;
    avatar_path: string | null;
    posts: number;
  } | null;
};

export async function maengelStats(
  locationId?: string | null,
): Promise<MangelStats> {
  const supabase = await createClient();
  const seit = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  let q = supabase
    .from("studio_issues")
    .select(
      `id, status, reported_by, created_at, resolved_at,
       reporter:reported_by ( full_name, avatar_path )`,
    )
    .order("created_at", { ascending: false })
    .limit(500);
  if (locationId) {
    q = q.or(`location_id.eq.${locationId},location_id.is.null`);
  }
  const { data } = await q;

  type StatRoh = {
    id: string;
    status: string;
    reported_by: string | null;
    created_at: string;
    resolved_at: string | null;
    reporter: { full_name: string | null; avatar_path: string | null } | null;
  };
  const rows = (data ?? []) as unknown as StatRoh[];

  const offen = rows.filter((r) => r.status === "offen").length;
  const in_bearbeitung = rows.filter((r) => r.status === "in_bearbeitung").length;
  const behoben_diese_woche = rows.filter(
    (r) => r.status === "behoben" && r.resolved_at && r.resolved_at >= seit,
  ).length;
  const gemeldet_diese_woche = rows.filter((r) => r.created_at >= seit).length;

  const counts = new Map<
    string,
    { name: string | null; avatar_path: string | null; posts: number }
  >();
  for (const r of rows) {
    if (!r.reported_by) continue;
    if (r.created_at < seit) continue;
    const cur = counts.get(r.reported_by);
    if (cur) cur.posts += 1;
    else
      counts.set(r.reported_by, {
        name: r.reporter?.full_name ?? null,
        avatar_path: r.reporter?.avatar_path ?? null,
        posts: 1,
      });
  }
  let aktivster: MangelStats["aktivster_melder"] = null;
  let topPosts = 0;
  for (const [id, v] of counts) {
    if (v.posts > topPosts) {
      topPosts = v.posts;
      aktivster = { id, ...v };
    }
  }

  return {
    offen,
    in_bearbeitung,
    behoben_diese_woche,
    gemeldet_diese_woche,
    aktivster_melder: aktivster,
  };
}

export async function ladeMaengel(opts?: {
  status?: Status[];
  reportedBy?: string;
  locationId?: string | null;
}): Promise<Mangel[]> {
  const supabase = await createClient();
  let q = supabase
    .from("studio_issues")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (opts?.status && opts.status.length > 0) {
    q = q.in("status", opts.status);
  }
  if (opts?.reportedBy) {
    q = q.eq("reported_by", opts.reportedBy);
  }
  if (opts?.locationId) {
    q = q.or(`location_id.eq.${opts.locationId},location_id.is.null`);
  }
  const { data } = await q;
  return ((data ?? []) as unknown as Roh[]).map(map);
}

export async function ladeMangel(id: string): Promise<Mangel | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("studio_issues")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  return data ? map(data as unknown as Roh) : null;
}

