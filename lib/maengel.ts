import { createClient } from "@/lib/supabase/server";

export type Status = "offen" | "in_bearbeitung" | "behoben" | "verworfen";
export type Severity = "niedrig" | "normal" | "kritisch";

export type Mangel = {
  id: string;
  location_id: string | null;
  title: string;
  description: string | null;
  photo_path: string | null;
  status: Status;
  severity: Severity;
  reported_by: string | null;
  reported_by_name: string | null;
  assigned_to: string | null;
  assigned_to_name: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

type Roh = {
  id: string;
  location_id: string | null;
  title: string;
  description: string | null;
  photo_path: string | null;
  status: string;
  severity: string;
  reported_by: string | null;
  reporter: { full_name: string | null } | null;
  assigned_to: string | null;
  assignee: { full_name: string | null } | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

const SELECT = `
  id, location_id, title, description, photo_path, status, severity,
  reported_by, reporter:reported_by ( full_name ),
  assigned_to, assignee:assigned_to ( full_name ),
  resolution_note, created_at, updated_at, resolved_at
`;

function map(r: Roh): Mangel {
  return {
    id: r.id,
    location_id: r.location_id,
    title: r.title,
    description: r.description,
    photo_path: r.photo_path,
    status: (["offen", "in_bearbeitung", "behoben", "verworfen"].includes(r.status)
      ? r.status
      : "offen") as Status,
    severity: (["niedrig", "normal", "kritisch"].includes(r.severity)
      ? r.severity
      : "normal") as Severity,
    reported_by: r.reported_by,
    reported_by_name: r.reporter?.full_name ?? null,
    assigned_to: r.assigned_to,
    assigned_to_name: r.assignee?.full_name ?? null,
    resolution_note: r.resolution_note,
    created_at: r.created_at,
    updated_at: r.updated_at,
    resolved_at: r.resolved_at,
  };
}

export async function ladeMaengel(opts?: {
  status?: Status[];
  reportedBy?: string;
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

export function fotoUrlFuerPfad(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/issue-photos/${path}`;
}

export const STATUS_LABEL: Record<Status, string> = {
  offen: "Offen",
  in_bearbeitung: "In Bearbeitung",
  behoben: "Behoben",
  verworfen: "Verworfen",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  niedrig: "Niedrig",
  normal: "Normal",
  kritisch: "Kritisch",
};
