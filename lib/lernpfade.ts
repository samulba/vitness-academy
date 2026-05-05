import { createClient } from "@/lib/supabase/server";

export type Lektion = {
  id: string;
  module_id: string;
  title: string;
  summary: string | null;
  sort_order: number;
};

export type Modul = {
  id: string;
  learning_path_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  lessons: Lektion[];
};

export type Lernpfad = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  sort_order: number;
  hero_image_path: string | null;
  modules: Modul[];
};

export type LektionStatus =
  | "nicht_gestartet"
  | "in_bearbeitung"
  | "abgeschlossen";

export type LektionMitStatus = Lektion & { status: LektionStatus };

export type ModulMitFortschritt = Omit<Modul, "lessons"> & {
  lessons: LektionMitStatus[];
  abgeschlossen: number;
  gesamt: number;
};

export type LernpfadMitFortschritt = Omit<Lernpfad, "modules"> & {
  modules: ModulMitFortschritt[];
  abgeschlossen: number;
  gesamt: number;
  prozent: number;
};

/**
 * Holt alle Lernpfade, die dem aktuellen Nutzer zugewiesen sind, inklusive
 * Module, Lektionen und Fortschritt.
 */
export async function ladeMeineLernpfade(
  userId: string,
): Promise<LernpfadMitFortschritt[]> {
  const supabase = await createClient();

  const { data: assignments } = await supabase
    .from("user_learning_path_assignments")
    .select("learning_path_id")
    .eq("user_id", userId);

  const pfadIds = (assignments ?? []).map((a) => a.learning_path_id);
  if (pfadIds.length === 0) return [];

  const { data: paths } = await supabase
    .from("learning_paths")
    .select(
      `id, title, description, status, sort_order, hero_image_path,
       modules:modules (
         id, learning_path_id, title, description, sort_order,
         lessons:lessons ( id, module_id, title, summary, sort_order )
       )`,
    )
    .in("id", pfadIds)
    .order("sort_order", { ascending: true });

  if (!paths) return [];

  const lessonIds = paths.flatMap((p) =>
    (p.modules ?? []).flatMap((m: { lessons: { id: string }[] }) =>
      (m.lessons ?? []).map((l) => l.id),
    ),
  );

  const progressMap = await ladeFortschrittMap(userId, lessonIds);

  return (paths as unknown as Lernpfad[]).map((pfad) =>
    mitFortschritt(pfad, progressMap),
  );
}

export async function ladeLernpfadFuerUser(
  userId: string,
  pfadId: string,
): Promise<LernpfadMitFortschritt | null> {
  const supabase = await createClient();

  const { data: pfad } = await supabase
    .from("learning_paths")
    .select(
      `id, title, description, status, sort_order, hero_image_path,
       modules:modules (
         id, learning_path_id, title, description, sort_order,
         lessons:lessons ( id, module_id, title, summary, sort_order )
       )`,
    )
    .eq("id", pfadId)
    .single();

  if (!pfad) return null;

  const lessonIds = ((pfad.modules ?? []) as { lessons: { id: string }[] }[]).flatMap(
    (m) => (m.lessons ?? []).map((l) => l.id),
  );

  const progressMap = await ladeFortschrittMap(userId, lessonIds);
  return mitFortschritt(pfad as unknown as Lernpfad, progressMap);
}

async function ladeFortschrittMap(
  userId: string,
  lessonIds: string[],
): Promise<Map<string, LektionStatus>> {
  if (lessonIds.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id, status")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);

  return new Map(
    (data ?? []).map((row) => [
      row.lesson_id as string,
      row.status as LektionStatus,
    ]),
  );
}

function mitFortschritt(
  pfad: Lernpfad,
  progressMap: Map<string, LektionStatus>,
): LernpfadMitFortschritt {
  const moduleMitFortschritt = [...(pfad.modules ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((m) => {
      const lessons = [...(m.lessons ?? [])]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map<LektionMitStatus>((l) => ({
          ...l,
          status: progressMap.get(l.id) ?? "nicht_gestartet",
        }));
      const abgeschlossen = lessons.filter(
        (l) => l.status === "abgeschlossen",
      ).length;
      return {
        ...m,
        lessons,
        abgeschlossen,
        gesamt: lessons.length,
      };
    });

  const gesamt = moduleMitFortschritt.reduce((s, m) => s + m.gesamt, 0);
  const abgeschlossen = moduleMitFortschritt.reduce(
    (s, m) => s + m.abgeschlossen,
    0,
  );
  const prozent = gesamt === 0 ? 0 : (abgeschlossen / gesamt) * 100;

  return {
    id: pfad.id,
    title: pfad.title,
    description: pfad.description,
    status: pfad.status,
    sort_order: pfad.sort_order,
    hero_image_path: pfad.hero_image_path,
    modules: moduleMitFortschritt,
    abgeschlossen,
    gesamt,
    prozent,
  };
}

export type OffeneLektion = {
  lesson_id: string;
  lesson_title: string;
  module_title: string;
  path_title: string;
  path_id: string;
  status: LektionStatus;
};

/**
 * Liefert die ersten max. n offenen Lektionen (nicht abgeschlossen) über
 * alle zugewiesenen Lernpfade des Nutzers.
 */
export function offeneLektionen(
  pfade: LernpfadMitFortschritt[],
  limit = 5,
): OffeneLektion[] {
  const offen: OffeneLektion[] = [];
  for (const pfad of pfade) {
    for (const modul of pfad.modules) {
      for (const lektion of modul.lessons) {
        if (lektion.status !== "abgeschlossen") {
          offen.push({
            lesson_id: lektion.id,
            lesson_title: lektion.title,
            module_title: modul.title,
            path_title: pfad.title,
            path_id: pfad.id,
            status: lektion.status,
          });
        }
        if (offen.length >= limit) return offen;
      }
    }
  }
  return offen;
}
