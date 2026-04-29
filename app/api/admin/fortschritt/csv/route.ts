import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDatum } from "@/lib/format";

/**
 * CSV-Export der Fortschritts-Tabelle (Admin only).
 * Eine Zeile pro Mitarbeiter × zugewiesener Lernpfad.
 */
export async function GET() {
  await requireRole(["admin", "superadmin"]);
  const supabase = await createClient();

  // Mitarbeiter
  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, full_name, first_name, last_name, role")
    .in("role", ["mitarbeiter", "fuehrungskraft"]);
  type ProfilRoh = {
    id: string;
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    role: string;
  };
  const profile = (profileData ?? []) as ProfilRoh[];

  // Auth-User fuer Email-Lookup (via getUser geht hier nicht --
  // wir nutzen die Anwesenheits-Tabelle profiles + getrennten
  // Lookup falls noetig). Email steht NICHT in profiles; wir
  // greifen via service-role auf auth.users zu -- hier ueber
  // den public.profiles join. Vereinfacht: kein Email-Lookup
  // (wuerde admin API erfordern). Email aus auth.users via
  // direct SELECT geht via authenticated supabase nicht.
  // -> Spalte "Mail" bleibt leer wenn nicht verfuegbar.

  // Lernpfade mit Lesson-Counts
  const { data: pfadData } = await supabase
    .from("learning_paths")
    .select(`id, title, sort_order, modules ( lessons ( id ) )`)
    .order("sort_order", { ascending: true });
  type PfadRoh = {
    id: string;
    title: string;
    modules: { lessons: { id: string }[] | null }[] | null;
  };
  const pfade = ((pfadData ?? []) as unknown as PfadRoh[]).map((p) => ({
    id: p.id,
    title: p.title,
    lessonIds: (p.modules ?? []).flatMap((m) =>
      (m.lessons ?? []).map((l) => l.id),
    ),
  }));

  // Zuweisungen
  const { data: zuwData } = await supabase
    .from("user_learning_path_assignments")
    .select("user_id, learning_path_id");
  const zuweisungen = (zuwData ?? []) as {
    user_id: string;
    learning_path_id: string;
  }[];

  // Fortschritt: user × set abgeschlossener lesson_ids
  const { data: progData } = await supabase
    .from("user_lesson_progress")
    .select("user_id, lesson_id, status, last_seen_at")
    .eq("status", "abgeschlossen");
  type ProgRoh = {
    user_id: string;
    lesson_id: string;
    status: string;
    last_seen_at: string | null;
  };
  const fortschritt = new Map<string, Set<string>>();
  const letzteAktiv = new Map<string, string>();
  for (const r of (progData ?? []) as ProgRoh[]) {
    const set = fortschritt.get(r.user_id) ?? new Set<string>();
    set.add(r.lesson_id);
    fortschritt.set(r.user_id, set);
    if (r.last_seen_at) {
      const old = letzteAktiv.get(r.user_id);
      if (!old || r.last_seen_at > old) letzteAktiv.set(r.user_id, r.last_seen_at);
    }
  }

  // CSV bauen
  const header = [
    "Vorname",
    "Nachname",
    "Anzeigename",
    "Rolle",
    "Lernpfad",
    "Lektionen-Gesamt",
    "Lektionen-Abgeschlossen",
    "Prozent",
    "Letzte-Aktivität",
  ];
  const zeilen: string[] = [];
  zeilen.push(header.map(escape).join(";"));

  for (const p of profile) {
    for (const pfad of pfade) {
      const istZugewiesen = zuweisungen.some(
        (z) => z.user_id === p.id && z.learning_path_id === pfad.id,
      );
      if (!istZugewiesen) continue;

      const set = fortschritt.get(p.id) ?? new Set<string>();
      const abgeschlossen = pfad.lessonIds.filter((id) => set.has(id)).length;
      const gesamt = pfad.lessonIds.length;
      const prozent = gesamt === 0 ? 0 : Math.round((abgeschlossen / gesamt) * 100);
      const aktiv = letzteAktiv.get(p.id);

      zeilen.push(
        [
          p.first_name ?? "",
          p.last_name ?? "",
          p.full_name ?? "",
          p.role,
          pfad.title,
          gesamt,
          abgeschlossen,
          `${prozent}%`,
          aktiv ? formatDatum(aktiv) : "—",
        ]
          .map(escape)
          .join(";"),
      );
    }
  }

  // BOM fuer Excel-UTF8-Kompatibilitaet
  const bom = "﻿";
  const body = bom + zeilen.join("\n");

  const heute = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fortschritt-${heute}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

function escape(value: string | number): string {
  const s = String(value ?? "");
  if (/[";\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
