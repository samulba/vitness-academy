import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { SpeichernButton } from "@/components/admin/SpeichernButton";
import { createClient } from "@/lib/supabase/server";
import { formatDatum } from "@/lib/format";
import {
  artikelReihenfolge,
  kategorieAktualisieren,
  kategorieAnlegen,
  kategorieLoeschen,
} from "./actions";

type Artikel = {
  id: string;
  title: string;
  slug: string;
  category_name: string | null;
  status: string;
  updated_at: string;
};

type Kategorie = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  artikel_anzahl: number;
};

async function ladeArtikel(): Promise<Artikel[]> {
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

async function ladeKategorien(): Promise<Kategorie[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("knowledge_categories")
    .select(`id, name, slug, description, knowledge_articles ( id )`)
    .order("sort_order", { ascending: true });
  type Roh = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    knowledge_articles: { id: string }[] | null;
  };
  return ((data ?? []) as unknown as Roh[]).map((k) => ({
    id: k.id,
    name: k.name,
    slug: k.slug,
    description: k.description,
    artikel_anzahl: (k.knowledge_articles ?? []).length,
  }));
}

export default async function AdminWissenPage() {
  const [artikel, kategorien] = await Promise.all([
    ladeArtikel(),
    ladeKategorien(),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Handbuch
          </h1>
          <p className="mt-1 text-muted-foreground">
            Kategorien und Artikel verwalten.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/wissen/neu">
            <Plus className="h-4 w-4" />
            Neuer Artikel
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Kategorien ({kategorien.length})</CardTitle>
          <CardDescription>
            Strukturieren die Handbuch. Slug landet in der URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {kategorien.map((k) => (
              <details key={k.id} className="rounded-md border bg-background">
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-medium">{k.name}</span>
                    <Badge variant="outline">{k.artikel_anzahl} Artikel</Badge>
                    <span className="truncate text-xs text-muted-foreground">
                      /{k.slug}
                    </span>
                  </div>
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </summary>
                <div className="border-t p-3">
                  <form
                    action={kategorieAktualisieren.bind(null, k.id)}
                    className="space-y-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor={`name-${k.id}`}>Name</Label>
                        <Input
                          id={`name-${k.id}`}
                          name="name"
                          defaultValue={k.name}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`slug-${k.id}`}>Slug</Label>
                        <Input
                          id={`slug-${k.id}`}
                          name="slug"
                          defaultValue={k.slug}
                          placeholder="leer = auto"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`desc-${k.id}`}>Beschreibung</Label>
                      <Input
                        id={`desc-${k.id}`}
                        name="description"
                        defaultValue={k.description ?? ""}
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <LoeschenButton
                        action={kategorieLoeschen.bind(null, k.id)}
                        label="Kategorie löschen"
                        bestaetigung="Kategorie wirklich löschen? Artikel bleiben erhalten, verlieren aber die Kategorie."
                      />
                      <SpeichernButton label="Speichern" />
                    </div>
                  </form>
                </div>
              </details>
            ))}
          </div>

          <details className="rounded-md border-2 border-dashed">
            <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
              + Neue Kategorie
            </summary>
            <div className="border-t p-3">
              <form action={kategorieAnlegen} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="kat-name">Name</Label>
                    <Input id="kat-name" name="name" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="kat-slug">Slug (optional)</Label>
                    <Input
                      id="kat-slug"
                      name="slug"
                      placeholder="leer = aus Name generieren"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="kat-desc">Beschreibung</Label>
                  <Input id="kat-desc" name="description" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm">
                    <Plus className="h-4 w-4" />
                    Kategorie anlegen
                  </Button>
                </div>
              </form>
            </div>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Artikel ({artikel.length})</CardTitle>
          <CardDescription>
            Klicke einen Artikel an, um ihn zu bearbeiten.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aktualisiert</TableHead>
                <TableHead className="text-right">Sortierung</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artikel.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Noch keine Artikel angelegt.
                  </TableCell>
                </TableRow>
              ) : (
                artikel.map((a, idx) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link
                        href={`/admin/wissen/${a.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {a.title}
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
                    <TableCell>
                      <div className="flex justify-end">
                        <ReihenfolgeButtons
                          hoch={artikelReihenfolge.bind(null, a.id, "hoch")}
                          runter={artikelReihenfolge.bind(null, a.id, "runter")}
                          hochDeaktiviert={idx === 0}
                          runterDeaktiviert={idx === artikel.length - 1}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/wissen/${a.slug}`}>
                            <ExternalLink className="h-3.5 w-3.5" />
                            Vorschau
                          </Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link href={`/admin/wissen/${a.id}`}>
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
