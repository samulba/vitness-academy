import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { createClient } from "@/lib/supabase/server";
import { formatDatum } from "@/lib/format";

type Zeile = {
  id: string;
  title: string;
  status: string;
  passing_score: number;
  fragen_anzahl: number;
  versuche_anzahl: number;
  bestanden_anzahl: number;
  bindung: { typ: "Lektion" | "Modul"; titel: string } | null;
  updated_at: string;
};

async function ladeQuizze(): Promise<Zeile[]> {
  const supabase = await createClient();

  const { data: quizze } = await supabase
    .from("quizzes")
    .select(
      `id, title, status, passing_score, lesson_id, module_id, updated_at,
       quiz_questions (id),
       quiz_attempts (id, passed),
       lessons:lesson_id ( title ),
       modules:module_id ( title )`,
    )
    .order("sort_order", { ascending: true });

  type Roh = {
    id: string;
    title: string;
    status: string;
    passing_score: number;
    lesson_id: string | null;
    module_id: string | null;
    updated_at: string;
    quiz_questions: { id: string }[] | null;
    quiz_attempts: { id: string; passed: boolean }[] | null;
    lessons: { title: string } | null;
    modules: { title: string } | null;
  };

  return ((quizze ?? []) as unknown as Roh[]).map((q) => {
    const versuche = q.quiz_attempts ?? [];
    const bestanden = versuche.filter((v) => v.passed).length;
    const bindung: Zeile["bindung"] = q.lesson_id
      ? { typ: "Lektion", titel: q.lessons?.title ?? "—" }
      : q.module_id
        ? { typ: "Modul", titel: q.modules?.title ?? "—" }
        : null;
    return {
      id: q.id,
      title: q.title,
      status: q.status,
      passing_score: q.passing_score,
      fragen_anzahl: (q.quiz_questions ?? []).length,
      versuche_anzahl: versuche.length,
      bestanden_anzahl: bestanden,
      bindung,
      updated_at: q.updated_at,
    };
  });
}

export default async function AdminQuizzePage() {
  const quizze = await ladeQuizze();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Quizze</h1>
          <p className="mt-1 text-muted-foreground">
            Quizze inkl. Fragen und Antworten verwalten.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/quizze/neu">
            <Plus className="h-4 w-4" />
            Neues Quiz
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Quizze ({quizze.length})</CardTitle>
          <CardDescription>
            Sortiert nach Reihenfolge. Quiz-Vorschau über den Link in der Spalte
            „Titel“.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Bindung</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Fragen</TableHead>
                <TableHead className="text-right">Pass</TableHead>
                <TableHead className="text-right">Versuche</TableHead>
                <TableHead className="text-right">Bestanden</TableHead>
                <TableHead>Aktualisiert</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizze.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Noch keine Quizze angelegt.
                  </TableCell>
                </TableRow>
              ) : (
                quizze.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell>
                      <Link
                        href={`/admin/quizze/${q.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {q.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {q.bindung ? (
                        <span>
                          <span className="text-xs uppercase tracking-wider">
                            {q.bindung.typ}
                          </span>
                          : {q.bindung.titel}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          q.status === "aktiv"
                            ? "success"
                            : q.status === "entwurf"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {q.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {q.fragen_anzahl}
                    </TableCell>
                    <TableCell className="text-right">
                      {q.passing_score}%
                    </TableCell>
                    <TableCell className="text-right">
                      {q.versuche_anzahl}
                    </TableCell>
                    <TableCell className="text-right">
                      {q.bestanden_anzahl}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDatum(q.updated_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/quiz/${q.id}`}>
                            <ExternalLink className="h-3.5 w-3.5" />
                            Vorschau
                          </Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link href={`/admin/quizze/${q.id}`}>
                            <Pencil className="h-3.5 w-3.5" />
                            Bearbeiten
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
