import Link from "next/link";
import { ArrowRight, BookOpenText, Search, X } from "lucide-react";
import { ladeArtikel, ladeKategorien } from "@/lib/wissen";

export default async function HandbuchPage({
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
    <div className="space-y-12">
      {/* === Header === */}
      <header className="space-y-6">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
              Vitness Handbuch
            </p>
            <h1 className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.75rem)]">
              Antworten für den Studio-Alltag.
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              Schnelle Antworten auf typische Fragen — vom Notfallplan bis zur
              Reinigungsroutine.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm tabular-nums">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Artikel
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {kategorien.reduce((s, k) => s + (k.artikel_anzahl ?? 0), 0)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Kategorien
              </p>
              <p className="mt-1 text-2xl font-semibold">{kategorien.length}</p>
            </div>
          </div>
        </div>

        {/* Suchfeld */}
        <form
          action="/wissen"
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Stichwort eingeben — z.B. Karte, Reha, Beitrag…"
              className="h-12 w-full rounded-full border border-border bg-background pl-11 pr-28 text-sm transition-colors focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]"
            />
            {kategorieSlug && (
              <input type="hidden" name="kategorie" value={kategorieSlug} />
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:scale-[1.02]"
            >
              Suchen
            </button>
          </div>
          {istGefiltert && (
            <Link
              href="/wissen"
              className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted sm:self-auto"
            >
              <X className="h-3.5 w-3.5" />
              Filter zurücksetzen
            </Link>
          )}
        </form>
      </header>

      {/* === Kategorien === */}
      {!istGefiltert && kategorien.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Kategorien</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {kategorien.map((k, i) => (
              <Link
                key={k.id}
                href={`/wissen?kategorie=${k.slug}`}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--primary))] hover:shadow-[0_16px_40px_-20px_hsl(var(--primary)/0.3)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--brand-pink))]">
                    {k.artikel_anzahl}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight">
                  {k.name}
                </h3>
                {k.description && (
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {k.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* === Artikel-Liste === */}
      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            {aktuelleKategorie
              ? aktuelleKategorie.name
              : query
              ? `„${query}"`
              : "Alle Artikel"}
          </h2>
          <span className="text-sm tabular-nums text-muted-foreground">
            {artikel.length}{" "}
            {artikel.length === 1 ? "Artikel" : "Artikel"}
          </span>
        </div>

        {artikel.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
              <BookOpenText className="h-4 w-4" />
            </span>
            <p className="mt-3 text-sm font-medium">
              {istGefiltert ? "Keine Treffer" : "Noch keine Artikel"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {istGefiltert
                ? "Versuch ein anderes Stichwort oder eine andere Kategorie."
                : "Sobald Artikel angelegt sind, erscheinen sie hier."}
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-border bg-card">
            {artikel.map((a, i) => (
              <li key={a.id} className={i > 0 ? "border-t border-border" : ""}>
                <Link
                  href={`/wissen/${a.slug}`}
                  className="group flex items-center gap-5 px-5 py-4 transition-colors hover:bg-[hsl(var(--primary)/0.04)]"
                >
                  <span className="hidden font-mono text-xs tabular-nums text-muted-foreground sm:block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
                      {a.category_name ?? "Ohne Kategorie"}
                    </span>
                    <h3 className="mt-1.5 text-base font-semibold leading-tight tracking-tight">
                      {a.title}
                    </h3>
                    {a.summary && (
                      <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                        {a.summary}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-[hsl(var(--primary))]" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
