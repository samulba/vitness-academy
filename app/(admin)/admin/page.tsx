import {
  Users,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

async function ladeKennzahlen() {
  const supabase = await createClient();

  const [{ count: anzMitarbeiter }, { count: anzLernpfade }, { count: anzAbgeschlossen }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("learning_paths")
        .select("*", { count: "exact", head: true })
        .eq("status", "aktiv"),
      supabase
        .from("user_lesson_progress")
        .select("*", { count: "exact", head: true })
        .eq("status", "abgeschlossen"),
    ]);

  return {
    mitarbeiter: anzMitarbeiter ?? 0,
    lernpfade: anzLernpfade ?? 0,
    abgeschlossen: anzAbgeschlossen ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const k = await ladeKennzahlen();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-muted-foreground">Verwaltung</p>
        <h1 className="text-3xl font-semibold tracking-tight">Übersicht</h1>
        <p className="mt-1 text-muted-foreground">
          Schneller Überblick über Mitarbeiter, Inhalte und Fortschritt.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <KennzahlCard
          icon={<Users className="h-5 w-5" />}
          label="Mitarbeiter"
          wert={k.mitarbeiter}
          beschreibung="Aktive Profile"
        />
        <KennzahlCard
          icon={<GraduationCap className="h-5 w-5" />}
          label="Aktive Lernpfade"
          wert={k.lernpfade}
        />
        <KennzahlCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Abgeschlossene Lektionen"
          wert={k.abgeschlossen}
          beschreibung="Über alle Mitarbeiter"
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Was kommt als Nächstes?</CardTitle>
          <CardDescription>
            Iterationen 2 und 3 bringen Quizze, Praxisfreigaben, Handbuch
            und vollen CRUD im Admin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Iteration 2:</strong> Quizze
            (Single/Multiple Choice) und Praxisfreigaben mit Genehmigungsfluss.
          </p>
          <p>
            <strong className="text-foreground">Iteration 3:</strong>{" "}
            Handbuch, Admin-CRUD für Lernpfade, Lektionen, Quizze,
            Praxisaufgaben und Benutzerverwaltung sowie eine
            Fortschrittsübersicht je Mitarbeiter.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function KennzahlCard({
  icon,
  label,
  wert,
  beschreibung,
}: {
  icon: React.ReactNode;
  label: string;
  wert: number;
  beschreibung?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-semibold">{wert}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
          {beschreibung ? (
            <div className="text-xs text-muted-foreground/80">{beschreibung}</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
