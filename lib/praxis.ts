import { createClient } from "@/lib/supabase/server";
import { istNextJsControlFlow, joinName, joinTitel } from "@/lib/admin/safe-loader";

export type PraxisStatus = "offen" | "bereit" | "freigegeben" | "abgelehnt";

export type PraxisAufgabe = {
  id: string;
  title: string;
  description: string | null;
  learning_path_title: string | null;
  lesson_title: string | null;
};

export type PraxisEintrag = PraxisAufgabe & {
  signoff_id: string | null;
  status: PraxisStatus;
  user_note: string | null;
  reviewer_note: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  approved_by_name: string | null;
};

export type PraxisInbox = PraxisEintrag & {
  user_id: string;
  user_name: string | null;
};

type RohTask = {
  id?: string;
  title?: string;
  description?: string | null;
  learning_paths?: unknown;
  lessons?: unknown;
};

/**
 * Alle aktiven Praxisaufgaben + Status fuer den aktuellen User.
 * Aufgaben ohne Signoff bekommen Status "offen".
 */
export async function ladeMeinePraxisaufgaben(
  userId: string,
): Promise<PraxisEintrag[]> {
  try {
    const supabase = await createClient();

    const [tasksRes, signoffsRes] = await Promise.all([
      supabase
        .from("practical_tasks")
        .select(
          `id, title, description,
           learning_paths:learning_path_id ( title ),
           lessons:lesson_id ( title )`,
        )
        .eq("status", "aktiv")
        .order("sort_order", { ascending: true }),
      supabase
        .from("user_practical_signoffs")
        .select(
          `id, task_id, status, user_note, reviewer_note, submitted_at,
           approved_at, approved_by,
           approver:approved_by ( full_name )`,
        )
        .eq("user_id", userId),
    ]);

    type RohSignoff = {
      id?: string;
      task_id?: string;
      status?: string;
      user_note?: string | null;
      reviewer_note?: string | null;
      submitted_at?: string | null;
      approved_at?: string | null;
      approver?: unknown;
    };

    const signoffs = ((signoffsRes.data ?? []) as unknown as RohSignoff[]).filter(
      (s) => typeof s.id === "string" && typeof s.task_id === "string",
    );
    const signoffMap = new Map<string, RohSignoff>(
      signoffs.map((s) => [s.task_id as string, s]),
    );

    return ((tasksRes.data ?? []) as unknown as RohTask[])
      .filter((t) => typeof t.id === "string" && typeof t.title === "string")
      .map((t) => {
        const so = signoffMap.get(t.id as string);
        const status = (
          so && ["offen", "bereit", "freigegeben", "abgelehnt"].includes(
            so.status ?? "",
          )
            ? so.status
            : "offen"
        ) as PraxisStatus;
        return {
          id: t.id as string,
          title: t.title as string,
          description: typeof t.description === "string" ? t.description : null,
          learning_path_title: joinTitel(t.learning_paths),
          lesson_title: joinTitel(t.lessons),
          signoff_id: so?.id ?? null,
          status,
          user_note: so?.user_note ?? null,
          reviewer_note: so?.reviewer_note ?? null,
          submitted_at: so?.submitted_at ?? null,
          approved_at: so?.approved_at ?? null,
          approved_by_name: joinName(so?.approver),
        };
      });
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeMeinePraxisaufgaben] unexpected error:", e);
    return [];
  }
}

/**
 * Inbox fuer Fuehrungskraft/Admin: Alle Signoffs im Status "bereit".
 * Optional auch andere Stati per filter.
 */
export async function ladePraxisInbox(
  filter: PraxisStatus[] = ["bereit"],
): Promise<PraxisInbox[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_practical_signoffs")
      .select(
        `id, status, user_note, reviewer_note, submitted_at, approved_at,
         user_id,
         profiles:user_id ( full_name ),
         practical_tasks:task_id (
           id, title, description,
           learning_paths:learning_path_id ( title ),
           lessons:lesson_id ( title )
         ),
         approver:approved_by ( full_name )`,
      )
      .in("status", filter)
      .order("submitted_at", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("[ladePraxisInbox] supabase error:", error);
      return [];
    }

    type Roh = {
      id?: string;
      status?: string;
      user_note?: string | null;
      reviewer_note?: string | null;
      submitted_at?: string | null;
      approved_at?: string | null;
      user_id?: string;
      profiles?: unknown;
      practical_tasks?: unknown;
      approver?: unknown;
    };

    function pickTask(t: unknown): {
      id?: string;
      title?: string;
      description?: string | null;
      learning_paths?: unknown;
      lessons?: unknown;
    } | null {
      if (!t) return null;
      if (Array.isArray(t)) return (t[0] ?? null) as ReturnType<typeof pickTask>;
      if (typeof t === "object")
        return t as ReturnType<typeof pickTask>;
      return null;
    }

    const eintraege: PraxisInbox[] = [];
    for (const r of (data ?? []) as unknown as Roh[]) {
      if (typeof r.id !== "string" || typeof r.user_id !== "string") continue;
      const task = pickTask(r.practical_tasks);
      if (!task || typeof task.id !== "string") continue;
      const status = ([
        "offen",
        "bereit",
        "freigegeben",
        "abgelehnt",
      ].includes(r.status ?? "")
        ? r.status
        : "bereit") as PraxisStatus;
      eintraege.push({
        id: task.id,
        title: typeof task.title === "string" ? task.title : "",
        description:
          typeof task.description === "string" ? task.description : null,
        learning_path_title: joinTitel(task.learning_paths),
        lesson_title: joinTitel(task.lessons),
        signoff_id: r.id,
        status,
        user_note: r.user_note ?? null,
        reviewer_note: r.reviewer_note ?? null,
        submitted_at: r.submitted_at ?? null,
        approved_at: r.approved_at ?? null,
        approved_by_name: joinName(r.approver),
        user_id: r.user_id,
        user_name: joinName(r.profiles),
      });
    }
    return eintraege;
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladePraxisInbox] unexpected error:", e);
    return [];
  }
}

export function statusLabel(status: PraxisStatus): string {
  switch (status) {
    case "offen":
      return "Noch nicht gemeldet";
    case "bereit":
      return "Wartet auf Freigabe";
    case "freigegeben":
      return "Freigegeben";
    case "abgelehnt":
      return "Abgelehnt";
  }
}
