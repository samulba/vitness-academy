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
import { formatDatum, rolleLabel } from "@/lib/format";

type Zeile = {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
  location_name: string | null;
};

async function ladeBenutzer(): Promise<Zeile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      `id, full_name, role, created_at,
       locations:location_id ( name )`,
    )
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as {
    id: string;
    full_name: string | null;
    role: string;
    created_at: string;
    locations: { name: string } | null;
  }[]).map((row) => ({
    id: row.id,
    full_name: row.full_name,
    role: row.role,
    created_at: row.created_at,
    location_name: row.locations?.name ?? null,
  }));
}

export default async function AdminBenutzerPage() {
  const benutzer = await ladeBenutzer();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Benutzer</h1>
        <p className="mt-1 text-muted-foreground">
          Übersicht aller Profile in der Akademie.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Mitarbeiter ({benutzer.length})</CardTitle>
          <CardDescription>
            Anlegen und Bearbeiten folgt in einer späteren Iteration.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Standort</TableHead>
                <TableHead>Angelegt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benutzer.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    Keine Benutzer gefunden.
                  </TableCell>
                </TableRow>
              ) : (
                benutzer.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">
                      {b.full_name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={b.role === "mitarbeiter" ? "outline" : "secondary"}
                      >
                        {rolleLabel(b.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {b.location_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDatum(b.created_at)}
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
