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
import { ReihenfolgeButtons } from "@/components/admin/ReihenfolgeButtons";
import { createClient } from "@/lib/supabase/server";
import { aufgabeReihenfolge } from "./actions";

type Zeile = {
  id: string;
  title: string;
  status: string;
  pfad_titel: string | null;
  lektion_titel: string | null;
  bereit: number;
  freigegeben: number;
  abgelehnt: number;
  updated_at: string;
};

async function ladeAufgaben(): Promise<Zeile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("practical_tasks")
    .select(
      `id, title, status, updated_at,
       learning_paths:learning_path_id ( title ),
       lessons:lesson_id ( title ),
       user_practical_signoffs ( status )`,
    )
    .order("sort_order", { ascending: true });

  type Roh = {
    id: string;
    title: string;
    status: string;
    updated_at: string;
    learning_paths: { title: string } | null;
    lessons: { title: string } | null;
    user_practical_signoffs: { status: string }[] | null;
  };

  return ((data ?? []) as unknown as Roh[]).map((t) => {
    const sos = t.user_practical_signoffs ?? [];
    return {
      id: t.id,
      title: t.title,
      status: t.status,
      pfad_titel: t.learning_paths?.title ?? null,
      lektion_titel: t.lessons?.title ?? null,
      bereit: sos.filter((s) => s.status === "bereit").length,
      freigegeben: sos.filter((s) => s.status === "freigegeben").length,
      abgelehnt: sos.filter((s) => s.status === "abgelehnt").length,
      updated_at: t.updated_at,
    };
  });
}

export default async function AdminPraxisaufgabenPage() {
  const aufgaben = await ladeAufgaben();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Praxisaufgaben
          </h1>
          <p className="mt-1 text-muted-foreground">
            Vorlagen für Praxisfreigaben verwalten. Anfragen siehst du im
            Bereich „Praxisfreigaben“.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/praxisaufgaben/neu">
            <Plus className="h-4 w-4" />
            Neue Aufgabe
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Aufgaben ({aufgaben.length})</CardTitle>
          <CardDescription>
            Reihenfolge bestimmt die Anzeige im Mitarbeiter-Bereich.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Bindung</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Wartet</TableHead>
                <TableHead className="text-right">Freigegeben</TableHead>
                <TableHead className="text-right">Abgelehnt</TableHead>
                <TableHead className="text-right">Sortierung</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aufgaben.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Noch keine Praxisaufgaben angelegt.
                  </TableCell>
                </TableRow>
              ) : (
                aufgaben.map((a, idx) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link
                        href={`/admin/praxisaufgaben/${a.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {a.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {[a.pfad_titel, a.lektion_titel]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          a.status === "aktiv"
                            ? "success"
                            : a.status === "entwurf"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{a.bereit}</TableCell>
                    <TableCell className="text-right">{a.freigegeben}</TableCell>
                    <TableCell className="text-right">{a.abgelehnt}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <ReihenfolgeButtons
                          hoch={aufgabeReihenfolge.bind(null, a.id, "hoch")}
                          runter={aufgabeReihenfolge.bind(
                            null,
                            a.id,
                            "runter",
                          )}
                          hochDeaktiviert={idx === 0}
                          runterDeaktiviert={idx === aufgaben.length - 1}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm">
                        <Link href={`/admin/praxisaufgaben/${a.id}`}>
                          <Pencil className="h-3.5 w-3.5" />
                          Bearbeiten
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Tipp: Anfragen freigeben/ablehnen findest du im Bereich{" "}
        <Link
          href="/admin/praxisfreigaben"
          className="underline underline-offset-4"
        >
          Verwaltung → Praxisfreigaben
        </Link>{" "}
        <ExternalLink className="inline h-3 w-3" />.
      </p>
    </div>
  );
}
