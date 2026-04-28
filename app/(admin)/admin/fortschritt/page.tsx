import Link from "next/link";
import { Activity, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatProzent, rolleLabel } from "@/lib/format";

type Mitarbeiter = {
  id: string;
  full_name: string | null;
  role: string;
};

type Lernpfad = {
  id: string;
  title: string;
  lessonIds: string[];
};

type FortschrittZelle = {
  abgeschlossen: number;
  gesamt: number;
  prozent: number;
};

async function ladeAlleMitarbeiter(): Promise<Mitarbeiter[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .order("full_name", { ascending: true });
  return ((data ?? []) as Mitarbeiter[]).filter(
    (p) => p.role === "mitarbeiter" || p.role === "fuehrungskraft",
  );
}

async function ladeAlleLernpfade(): Promise<Lernpfad[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("learning_paths")
    .select(`id, title, sort_order, modules ( lessons ( id ) )`)
    .order("sort_order", { ascending: true });

  type Roh = {
    id: string;
    title: string;
    modules: { lessons: { id: string }[] | null }[] | null;
  };
  return ((data ?? []) as unknown as Roh[]).map((p) => ({
    id: p.id,
    title: p.title,
    lessonIds: (p.modules ?? []).flatMap((m) =>
      (m.lessons ?? []).map((l) => l.id),
    ),
  }));
}

type Zuweisung = { user_id: string; learning_path_id: string };

async function ladeZuweisungen(): Promise<Zuweisung[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_learning_path_assignments")
    .select("user_id, learning_path_id");
  return (data ?? []) as Zuweisung[];
}

async function ladeFortschrittEintraege(): Promise<
  Map<string, Set<string>>
> {
  // Mappt user_id -> Set abgeschlossener lesson_ids
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_lesson_progress")
    .select("user_id, lesson_id, status")
    .eq("status", "abgeschlossen");
  const map = new Map<string, Set<string>>();
  for (const row of (data ?? []) as {
    user_id: string;
    lesson_id: string;
  }[]) {
    const set = map.get(row.user_id) ?? new Set<string>();
    set.add(row.lesson_id);
    map.set(row.user_id, set);
  }
  return map;
}

export default async function FortschrittPage() {
  const [mitarbeiter, lernpfade, zuweisungen, fortschritt] = await Promise.all([
    ladeAlleMitarbeiter(),
    ladeAlleLernpfade(),
    ladeZuweisungen(),
    ladeFortschrittEintraege(),
  ]);

  // Pro Mitarbeiter pro Lernpfad: berechnen ob zugewiesen + Fortschritt
  function zelle(userId: string, pfad: Lernpfad): FortschrittZelle | null {
    const istZugewiesen = zuweisungen.some(
      (z) => z.user_id === userId && z.learning_path_id === pfad.id,
    );
    if (!istZugewiesen) return null;
    const abgesetzt = fortschritt.get(userId) ?? new Set<string>();
    const abgeschlossen = pfad.lessonIds.filter((l) => abgesetzt.has(l)).length;
    const gesamt = pfad.lessonIds.length;
    const prozent = gesamt === 0 ? 0 : (abgeschlossen / gesamt) * 100;
    return { abgeschlossen, gesamt, prozent };
  }

  // Gesamt-Score pro Mitarbeiter (über alle zugewiesenen Lernpfade)
  function gesamtfortschritt(userId: string): FortschrittZelle {
    let abgeschlossen = 0;
    let gesamt = 0;
    for (const pfad of lernpfade) {
      const z = zelle(userId, pfad);
      if (!z) continue;
      abgeschlossen += z.abgeschlossen;
      gesamt += z.gesamt;
    }
    const prozent = gesamt === 0 ? 0 : (abgeschlossen / gesamt) * 100;
    return { abgeschlossen, gesamt, prozent };
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Fortschrittsübersicht
        </h1>
        <p className="mt-1 text-muted-foreground">
          Mitarbeiter × Lernpfad. Klick auf einen Namen für Details.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Mitarbeiter ({mitarbeiter.length})
          </CardTitle>
          <CardDescription>
            „—“ bedeutet: Lernpfad nicht zugewiesen.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card">Mitarbeiter</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Gesamt</TableHead>
                {lernpfade.map((p) => (
                  <TableHead key={p.id}>{p.title}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {mitarbeiter.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3 + lernpfade.length}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Keine Mitarbeiter gefunden.
                  </TableCell>
                </TableRow>
              ) : (
                mitarbeiter.map((m) => {
                  const gesamt = gesamtfortschritt(m.id);
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="sticky left-0 bg-card">
                        <Link
                          href={`/admin/benutzer/${m.id}`}
                          className="inline-flex items-center gap-1 font-medium hover:text-primary"
                        >
                          {m.full_name ?? "—"}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rolleLabel(m.role)}</Badge>
                      </TableCell>
                      <TableCell className="min-w-[140px]">
                        <div className="space-y-1">
                          <Progress value={gesamt.prozent} />
                          <div className="text-xs text-muted-foreground">
                            {gesamt.abgeschlossen}/{gesamt.gesamt} ·{" "}
                            {formatProzent(gesamt.prozent)}
                          </div>
                        </div>
                      </TableCell>
                      {lernpfade.map((p) => {
                        const z = zelle(m.id, p);
                        if (!z) {
                          return (
                            <TableCell
                              key={p.id}
                              className="text-muted-foreground/60"
                            >
                              —
                            </TableCell>
                          );
                        }
                        return (
                          <TableCell key={p.id} className="min-w-[120px]">
                            <div className="space-y-1">
                              <Progress value={z.prozent} />
                              <div className="text-xs text-muted-foreground">
                                {z.abgeschlossen}/{z.gesamt} ·{" "}
                                {formatProzent(z.prozent)}
                              </div>
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
