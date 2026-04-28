import { createClient } from "@/lib/supabase/server";

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
  id: string;
  title: string;
  description: string | null;
  learning_paths: { title: string } | null;
  lessons: { title: string } | null;
};

/**
 * Alle aktiven Praxisaufgaben + Status fuer den aktuellen User.
 * Aufgaben ohne Signoff bekommen Status "offen".
 */
export async function ladeMeinePraxisaufgaben(
  userId: string,
): Promise<PraxisEintrag[]> {
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
    id: string;
    task_id: string;
    status: PraxisStatus;
    user_note: string | null;
    reviewer_note: string | null;
    submitted_at: string | null;
    approved_at: string | null;
    approver: { full_name: string | null } | null;
  };

  const signoffMap = new Map<string, RohSignoff>(
    ((signoffsRes.data ?? []) as unknown as RohSignoff[]).map((s) => [
      s.task_id,
      s,
    ]),
  );

  return ((tasksRes.data ?? []) as unknown as RohTask[]).map((t) => {
    const so = signoffMap.get(t.id);
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      learning_path_title: t.learning_paths?.title ?? null,
      lesson_title: t.lessons?.title ?? null,
      signoff_id: so?.id ?? null,
      status: so?.status ?? "offen",
      user_note: so?.user_note ?? null,
      reviewer_note: so?.reviewer_note ?? null,
      submitted_at: so?.submitted_at ?? null,
      approved_at: so?.approved_at ?? null,
      approved_by_name: so?.approver?.full_name ?? null,
    };
  });
}

/**
 * Inbox fuer Fuehrungskraft/Admin: Alle Signoffs im Status "bereit".
 * Optional auch andere Stati per filter.
 */
export async function ladePraxisInbox(
  filter: PraxisStatus[] = ["bereit"],
): Promise<PraxisInbox[]> {
  const supabase = await createClient();

  const { data } = await supabase
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

  type Roh = {
    id: string;
    status: PraxisStatus;
    user_note: string | null;
    reviewer_note: string | null;
    submitted_at: string | null;
    approved_at: string | null;
    user_id: string;
    profiles: { full_name: string | null } | null;
    practical_tasks: {
      id: string;
      title: string;
      description: string | null;
      learning_paths: { title: string } | null;
      lessons: { title: string } | null;
    } | null;
    approver: { full_name: string | null } | null;
  };

  return ((data ?? []) as unknown as Roh[])
    .filter((r) => r.practical_tasks !== null)
    .map((r) => {
      const t = r.practical_tasks!;
      return {
        id: t.id,
        title: t.title,
        description: t.description,
        learning_path_title: t.learning_paths?.title ?? null,
        lesson_title: t.lessons?.title ?? null,
        signoff_id: r.id,
        status: r.status,
        user_note: r.user_note,
        reviewer_note: r.reviewer_note,
        submitted_at: r.submitted_at,
        approved_at: r.approved_at,
        approved_by_name: r.approver?.full_name ?? null,
        user_id: r.user_id,
        user_name: r.profiles?.full_name ?? null,
      };
    });
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
