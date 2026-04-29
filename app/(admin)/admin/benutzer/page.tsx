import Link from "next/link";
import { Pencil } from "lucide-react";
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
import { formatDatum, rolleLabel } from "@/lib/format";

type Zeile = {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
  location_name: string | null;
  zugewiesen: number;
};

async function ladeBenutzer(): Promise<Zeile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      `id, full_name, role, created_at,
       locations:location_id ( name ),
       user_learning_path_assignments ( id )`,
    )
    .order("created_at", { ascending: false });

  type Roh = {
    id: string;
    full_name: string | null;
    role: string;
    created_at: string;
    locations: { name: string } | null;
    user_learning_path_assignments: { id: string }[] | null;
  };

  return ((data ?? []) as unknown as Roh[]).map((r) => ({
    id: r.id,
    full_name: r.full_name,
    role: r.role,
    created_at: r.created_at,
    location_name: r.locations?.name ?? null,
    zugewiesen: (r.user_learning_path_assignments ?? []).length,
  }));
}

export default async function AdminBenutzerListe() {
  const benutzer = await ladeBenutzer();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Benutzer</h1>
          <p className="mt-1 text-muted-foreground">
            Übersicht aller Profile. Rollen, Standorte und Lernpfad-Zuweisungen
            pflegst du über die Detailseite.
          </p>
        </div>
        <Link
          href="/admin/benutzer/neu"
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:scale-[1.02]"
        >
          + Neue:r Mitarbeiter:in
        </Link>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Mitarbeiter ({benutzer.length})</CardTitle>
          <CardDescription>
            Neue Benutzer werden über das Supabase-Dashboard angelegt
            (Authentication → Users → „Add user“, mit „Auto Confirm“).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Standort</TableHead>
                <TableHead className="text-right">Lernpfade</TableHead>
                <TableHead>Angelegt</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benutzer.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Keine Benutzer gefunden.
                  </TableCell>
                </TableRow>
              ) : (
                benutzer.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <Link
                        href={`/admin/benutzer/${b.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {b.full_name ?? "—"}
                      </Link>
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
                    <TableCell className="text-right">{b.zugewiesen}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDatum(b.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm">
                        <Link href={`/admin/benutzer/${b.id}`}>
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
    </div>
  );
}
