import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ladeArtikel, ladeKategorien } from "@/lib/wissen";

export default async function WissenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategorie?: string }>;
}) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";
  const kategorieSlug = sp.kategorie?.trim() ?? "";

  const [kategorien, artikel] = await Promise.all([
    ladeKategorien(),
    ladeArtikel({
      query: query || undefined,
      kategorieSlug: kategorieSlug || undefined,
    }),
  ]);

  const istGefiltert = query.length > 0 || kategorieSlug.length > 0;
  const aktuelleKategorie = kategorien.find((k) => k.slug === kategorieSlug);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Wissensdatenbank
        </h1>
        <p className="text-muted-foreground">
          Schnelle Antworten für den Studio-Alltag. Such nach Stichworten oder
          stöber durch die Kategorien.
        </p>
      </header>

      <form action="/wissen" className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="Wissensdatenbank durchsuchen …"
            className="pl-9"
          />
        </div>
        {kategorieSlug ? (
          <input type="hidden" name="kategorie" value={kategorieSlug} />
        ) : null}
        <Button type="submit">Suchen</Button>
        {istGefiltert ? (
          <Button asChild variant="ghost">
            <Link href="/wissen">Filter zurücksetzen</Link>
          </Button>
        ) : null}
      </form>

      {!istGefiltert ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Kategorien</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kategorien.map((k) => (
              <Link key={k.id} href={`/wissen?kategorie=${k.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base">{k.name}</CardTitle>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {k.description ? (
                      <CardDescription className="line-clamp-2">
                        {k.description}
                      </CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline">
                      {k.artikel_anzahl}{" "}
                      {k.artikel_anzahl === 1 ? "Artikel" : "Artikel"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {aktuelleKategorie
              ? `Artikel in „${aktuelleKategorie.name}“`
              : query
                ? `Suchergebnisse für „${query}“`
                : "Alle Artikel"}{" "}
            <span className="text-base font-normal text-muted-foreground">
              ({artikel.length})
            </span>
          </h2>
        </div>

        {artikel.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              {istGefiltert
                ? "Keine Artikel gefunden. Versuch ein anderes Stichwort."
                : "Noch keine Artikel angelegt."}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {artikel.map((a) => (
              <Link key={a.id} href={`/wissen/${a.slug}`} className="block">
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <BookOpen className="h-3.5 w-3.5" />
                          {a.category_name ?? "Ohne Kategorie"}
                        </div>
                        <CardTitle className="text-base">{a.title}</CardTitle>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  {a.summary ? (
                    <CardContent>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {a.summary}
                      </p>
                    </CardContent>
                  ) : null}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
