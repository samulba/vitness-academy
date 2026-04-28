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
import { formatDatum } from "@/lib/format";
import { lernpfadReihenfolge } from "./actions";

type Zeile = {
  id: string;
  title: string;
  status: string;
  module_anzahl: number;
  lektion_anzahl: number;
  zugewiesen: number;
  updated_at: string;
};

async function ladeLernpfade(): Promise<Zeile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("learning_paths")
    .select(
      `id, title, status, updated_at, sort_order,
       modules ( id, lessons ( id ) ),
       user_learning_path_assignments ( id )`,
    )
    .order("sort_order", { ascending: true });

  type Roh = {
    id: string;
    title: string;
    status: string;
    updated_at: string;
    modules: { id: string; lessons: { id: string }[] }[] | null;
    user_learning_path_assignments: { id: string }[] | null;
  };

  return ((data ?? []) as unknown as Roh[]).map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    module_anzahl: (p.modules ?? []).length,
    lektion_anzahl: (p.modules ?? []).reduce(
      (s, m) => s + (m.lessons ?? []).length,
      0,
    ),
    zugewiesen: (p.user_learning_path_assignments ?? []).length,
    updated_at: p.updated_at,
  }));
}

export default async function AdminLernpfadeListe() {
  const pfade = await ladeLernpfade();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Lernpfade</h1>
          <p className="mt-1 text-muted-foreground">
            Lernpfade verwalten – Module und Lektionen pflegst du auf der
            Detailseite.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/lernpfade/neu">
            <Plus className="h-4 w-4" />
            Neuer Lernpfad
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Lernpfade ({pfade.length})</CardTitle>
          <CardDescription>
            Reihenfolge bestimmt die Anzeige im Mitarbeiter-Bereich.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Module</TableHead>
                <TableHead className="text-right">Lektionen</TableHead>
                <TableHead className="text-right">Zuweisungen</TableHead>
                <TableHead>Aktualisiert</TableHead>
                <TableHead className="text-right">Sortierung</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pfade.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Noch keine Lernpfade angelegt.
                  </TableCell>
                </TableRow>
              ) : (
                pfade.map((p, idx) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link
                        href={`/admin/lernpfade/${p.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {p.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === "aktiv"
                            ? "success"
                            : p.status === "entwurf"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {p.module_anzahl}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.lektion_anzahl}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.zugewiesen}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDatum(p.updated_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <ReihenfolgeButtons
                          hoch={lernpfadReihenfolge.bind(null, p.id, "hoch")}
                          runter={lernpfadReihenfolge.bind(null, p.id, "runter")}
                          hochDeaktiviert={idx === 0}
                          runterDeaktiviert={idx === pfade.length - 1}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/lernpfade/${p.id}`}>
                            <ExternalLink className="h-3.5 w-3.5" />
                            Vorschau
                          </Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link href={`/admin/lernpfade/${p.id}`}>
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
