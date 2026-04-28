import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  slug: string;
  category_name: string | null;
  status: string;
  updated_at: string;
};

async function ladeArtikelListe(): Promise<Zeile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("knowledge_articles")
    .select(
      `id, title, slug, status, updated_at,
       knowledge_categories:category_id ( name )`,
    )
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  type Roh = {
    id: string;
    title: string;
    slug: string;
    status: string;
    updated_at: string;
    knowledge_categories: { name: string } | null;
  };

  return ((data ?? []) as unknown as Roh[]).map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    status: a.status,
    updated_at: a.updated_at,
    category_name: a.knowledge_categories?.name ?? null,
  }));
}

async function ladeKategorienAnzahl(): Promise<{ id: string; name: string; anzahl: number }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("knowledge_categories")
    .select(`id, name, knowledge_articles ( id )`)
    .order("sort_order", { ascending: true });

  type Roh = { id: string; name: string; knowledge_articles: { id: string }[] | null };
  return ((data ?? []) as unknown as Roh[]).map((k) => ({
    id: k.id,
    name: k.name,
    anzahl: (k.knowledge_articles ?? []).length,
  }));
}

export default async function AdminWissenPage() {
  const [artikel, kategorien] = await Promise.all([
    ladeArtikelListe(),
    ladeKategorienAnzahl(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Wissensdatenbank
        </h1>
        <p className="mt-1 text-muted-foreground">
          Übersicht aller Kategorien und Artikel. Anlegen und Bearbeiten folgen
          in einer späteren Iteration.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Kategorien ({kategorien.length})</CardTitle>
          <CardDescription>Übersicht inkl. Artikel-Anzahl.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {kategorien.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Noch keine Kategorien angelegt.
              </p>
            ) : (
              kategorien.map((k) => (
                <Badge key={k.id} variant="secondary" className="gap-1">
                  {k.name}
                  <span className="text-muted-foreground/80">
                    · {k.anzahl}
                  </span>
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Artikel ({artikel.length})</CardTitle>
          <CardDescription>Sortiert nach Reihenfolge und Titel.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aktualisiert</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artikel.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Noch keine Artikel angelegt.
                  </TableCell>
                </TableRow>
              ) : (
                artikel.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link
                        href={`/wissen/${a.slug}`}
                        className="inline-flex items-center gap-1 font-medium hover:text-primary"
                      >
                        {a.title}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.category_name ?? "—"}
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
                    <TableCell className="text-muted-foreground">
                      {formatDatum(a.updated_at)}
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
