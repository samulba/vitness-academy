import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  module_anzahl: number;
  lektion_anzahl: number;
  zugewiesen: number;
  updated_at: string;
};

async function ladeLernpfade(): Promise<Zeile[]> {
  const supabase = await createClient();

  const { data: pfade } = await supabase
    .from("learning_paths")
    .select(
      `id, title, status, updated_at,
       modules ( id, lessons ( id ) ),
       user_learning_path_assignments ( id )`,
    )
    .order("sort_order", { ascending: true });

  return ((pfade ?? []) as unknown as {
    id: string;
    title: string;
    status: string;
    updated_at: string;
    modules: { id: string; lessons: { id: string }[] }[];
    user_learning_path_assignments: { id: string }[];
  }[]).map((p) => ({
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

export default async function AdminLernpfadePage() {
  const pfade = await ladeLernpfade();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Lernpfade</h1>
        <p className="mt-1 text-muted-foreground">
          Alle Lernpfade in der Akademie.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Lernpfade ({pfade.length})</CardTitle>
          <CardDescription>
            Anlegen und Bearbeiten folgt in einer späteren Iteration.
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {pfade.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Noch keine Lernpfade angelegt.
                  </TableCell>
                </TableRow>
              ) : (
                pfade.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
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
                    <TableCell className="text-right">{p.module_anzahl}</TableCell>
                    <TableCell className="text-right">{p.lektion_anzahl}</TableCell>
                    <TableCell className="text-right">{p.zugewiesen}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDatum(p.updated_at)}
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
