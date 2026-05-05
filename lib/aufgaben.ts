import { createClient } from "@/lib/supabase/server";
import { joinName } from "@/lib/admin/safe-loader";

export type Priority = "low" | "normal" | "high";
export type Recurrence = "none" | "daily" | "weekly";

export type Aufgabe = {
  id: string;
  location_id: string | null;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_to_name: string | null;
  due_date: string | null;
  priority: Priority;
  recurrence: Recurrence;
  recurrence_template_id: string | null;
  active: boolean;
  completed_by: string | null;
  completed_by_name: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type Roh = {
  id: string;
  location_id: string | null;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_profile: unknown;
  due_date: string | null;
  priority: string;
  recurrence: string;
  recurrence_template_id: string | null;
  active: boolean;
  completed_by: string | null;
  completed_profile: unknown;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

const SELECT = `
  id, location_id, title, description,
  assigned_to, assigned_profile:assigned_to ( full_name ),
  due_date, priority, recurrence, recurrence_template_id, active,
  completed_by, completed_profile:completed_by ( full_name ),
  completed_at, created_at, updated_at
`;

function map(r: Roh): Aufgabe {
  return {
    id: r.id,
    location_id: r.location_id ?? null,
    title: r.title ?? "",
    description: r.description ?? null,
    assigned_to: r.assigned_to ?? null,
    assigned_to_name: joinName(r.assigned_profile),
    due_date: r.due_date ?? null,
    priority: (["low", "normal", "high"].includes(r.priority)
      ? r.priority
      : "normal") as Priority,
    recurrence: (["none", "daily", "weekly"].includes(r.recurrence)
      ? r.recurrence
      : "none") as Recurrence,
    recurrence_template_id: r.recurrence_template_id ?? null,
    active: r.active !== false,
    completed_by: r.completed_by ?? null,
    completed_by_name: joinName(r.completed_profile),
    completed_at: r.completed_at ?? null,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function montagDieserWoche(d: Date): Date {
  const x = new Date(d);
  const wochentag = (x.getDay() + 6) % 7; // Mo=0
  x.setDate(x.getDate() - wochentag);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Generiert fehlende Recurring-Task-Instances fuer heute (daily)
 * und diese Woche (weekly). Idempotent via Unique-Constraint
 * (recurrence_template_id, due_date). Wird beim App-Layout-Render
 * fuer jeden eingeloggten User aufgerufen.
 */
export async function generiereWiederkehrendeAufgaben(): Promise<void> {
  const supabase = await createClient();
  const heute = new Date();
  const heuteIso = isoDate(heute);
  const wochenStart = isoDate(montagDieserWoche(heute));

  const { data: templates } = await supabase
    .from("studio_tasks")
    .select("id, location_id, title, description, assigned_to, priority, recurrence, created_by")
    .neq("recurrence", "none")
    .eq("active", true);

  type T = {
    id: string;
    location_id: string | null;
    title: string;
    description: string | null;
    assigned_to: string | null;
    priority: string;
    recurrence: string;
    created_by: string | null;
  };
  const tpls = (templates ?? []) as T[];
  if (tpls.length === 0) return;

  const inserts = tpls.map((t) => ({
    location_id: t.location_id,
    title: t.title,
    description: t.description,
    assigned_to: t.assigned_to,
    priority: t.priority,
    recurrence: "none" as const,
    recurrence_template_id: t.id,
    due_date: t.recurrence === "daily" ? heuteIso : wochenStart,
    created_by: t.created_by,
  }));

  await supabase
    .from("studio_tasks")
    .upsert(inserts, {
      onConflict: "recurrence_template_id,due_date",
      ignoreDuplicates: true,
    });
}

/**
 * Aufgaben fuer den eingeloggten User (heute + offen + zugewiesen
 * oder team-wide). Templates werden ausgeblendet.
 *
 * @param locationId optional -- wenn gesetzt, nur Tasks dieses
 *   Standorts plus standort-uebergreifende (location_id is null).
 */
export async function ladeMeineAufgaben(
  userId: string,
  locationId?: string | null,
): Promise<{
  heute: Aufgabe[];
  dieseWoche: Aufgabe[];
  erledigt: Aufgabe[];
}> {
  const supabase = await createClient();
  const heute = isoDate(new Date());
  const wochenStart = isoDate(montagDieserWoche(new Date()));
  const wochenEnde = new Date();
  wochenEnde.setDate(wochenEnde.getDate() + (6 - ((wochenEnde.getDay() + 6) % 7)));
  const wochenEndeIso = isoDate(wochenEnde);

  let q = supabase
    .from("studio_tasks")
    .select(SELECT)
    .eq("recurrence", "none")
    .or(`assigned_to.is.null,assigned_to.eq.${userId}`)
    .order("priority", { ascending: false })
    .order("due_date", { ascending: true, nullsFirst: false });
  if (locationId) {
    q = q.or(`location_id.eq.${locationId},location_id.is.null`);
  }
  let alle: Aufgabe[];
  try {
    const { data, error } = await q;
    if (error) {
      console.error("[ladeMeineAufgaben] supabase error:", error);
      alle = [];
    } else {
      alle = ((data ?? []) as unknown as Roh[])
        .filter((r) => typeof r.id === "string")
        .map(map);
    }
  } catch (e) {
    console.error("[ladeMeineAufgaben] unexpected error:", e);
    alle = [];
  }

  const heuteListe = alle.filter(
    (a) => !a.completed_at && a.due_date === heute,
  );
  const woche = alle.filter(
    (a) =>
      !a.completed_at &&
      a.due_date &&
      a.due_date >= wochenStart &&
      a.due_date <= wochenEndeIso &&
      a.due_date !== heute,
  );
  const erledigt = alle
    .filter((a) => a.completed_at)
    .sort(
      (a, b) =>
        (b.completed_at ?? "").localeCompare(a.completed_at ?? ""),
    )
    .slice(0, 20);

  return { heute: heuteListe, dieseWoche: woche, erledigt };
}

export async function ladeAufgabe(id: string): Promise<Aufgabe | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("studio_tasks")
      .select(SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return map(data as unknown as Roh);
  } catch (e) {
    console.error("[ladeAufgabe] unexpected error:", e);
    return null;
  }
}

/**
 * Liefert alle Tasks (Templates + Instances) fuer Admin.
 * @param locationId optional -- nur Tasks dieses Standorts plus
 *   standort-uebergreifende.
 */
export async function ladeAlleAufgabenAdmin(
  locationId?: string | null,
): Promise<Aufgabe[]> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("studio_tasks")
      .select(SELECT)
      .order("recurrence", { ascending: false }) // templates first
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (locationId) {
      q = q.or(`location_id.eq.${locationId},location_id.is.null`);
    }
    const { data, error } = await q;
    if (error) {
      console.error("[ladeAlleAufgabenAdmin] supabase error:", error);
      return [];
    }
    return ((data ?? []) as unknown as Roh[])
      .filter((r) => typeof r.id === "string")
      .map(map);
  } catch (e) {
    console.error("[ladeAlleAufgabenAdmin] unexpected error:", e);
    return [];
  }
}
