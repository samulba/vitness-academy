import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  Search,
  X,
} from "lucide-react";
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
  const gesamtArtikel = kategorien.reduce(
    (s, k) => s + (k.artikel_anzahl ?? 0),
    0,
  );

  return (
    <div className="space-y-16">
      {/* === Hero === */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-border bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))]">
        {/* Magenta-Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-15%] h-[500px] w-[500px] rounded-full opacity-25 blur-[100px]"
          style={{
            background:
              "radial-gradient(closest-side, hsl(var(--primary)), transparent)",
          }}
        />
        {/* Grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--brand-cream)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-cream)) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative px-8 py-12 lg:px-14 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-cream)/0.55)]">
                <span className="h-px w-10 bg-[hsl(var(--primary))]" />
                Vitness Handbuch
              </span>
              <h1 className="mt-8 max-w-[18ch] text-balance font-semibold leading-[0.95] tracking-[-0.035em] text-[clamp(2.5rem,5.5vw,5rem)]">
                Antworten für den{" "}
                <span className="relative inline-block">
                  Studio-Alltag.
                  <span
                    aria-hidden
                    className="absolute -bottom-1.5 left-0 right-1 h-[5px] rounded-full bg-[hsl(var(--primary))]"
                  />
                </span>
              </h1>
              <p className="mt-8 max-w-xl text-pretty text-base leading-relaxed text-[hsl(var(--brand-cream)/0.65)] sm:text-lg">
                Schnelle Antworten auf typische Fragen — vom Notfallplan bis zur
                Reinigungsroutine. Such nach Stichworten oder stöber durch die
                Kategorien.
              </p>
            </div>

            <div className="lg:col-span-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Stat label="Artikel" wert={String(gesamtArtikel)} />
                <Stat
                  label="Kategorien"
                  wert={String(kategorien.length)}
                />
              </div>
            </div>
          </div>

          {/* Suchfeld */}
          <form
            action="/wissen"
            className="relative mt-12 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--brand-cream)/0.45)]" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Stichwort eingeben — z.B. Karte, Reha, Beitrag…"
                className="h-14 w-full rounded-full border border-white/15 bg-white/[0.04] pl-12 pr-32 text-base text-[hsl(var(--brand-cream))] placeholder:text-[hsl(var(--brand-cream)/0.45)] backdrop-blur-sm transition-colors focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)]"
              />
              {kategorieSlug && (
                <input type="hidden" name="kategorie" value={kategorieSlug} />
              )}
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:scale-[1.02]"
              >
                Suchen
              </button>
            </div>
            {istGefiltert && (
              <Link
                href="/wissen"
                className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[hsl(var(--brand-cream)/0.7)] transition-colors hover:bg-white/10 sm:self-auto"
              >
                <X className="h-3.5 w-3.5" />
                Filter zurücksetzen
              </Link>
            )}
          </form>
        </div>
      </section>

      {/* === Kategorien (nur wenn nicht gefiltert) === */}
      {!istGefiltert && kategorien.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              Kategorien
            </h2>
            <span className="text-sm text-muted-foreground">
              {kategorien.length}{" "}
              {kategorien.length === 1 ? "Bereich" : "Bereiche"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kategorien.map((k, i) => (
              <Link
                key={k.id}
                href={`/wissen?kategorie=${k.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[hsl(var(--primary))] hover:shadow-[0_24px_60px_-24px_hsl(var(--primary)/0.35)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-[hsl(var(--brand-cream))] text-[hsl(var(--brand-pink))] transition-colors group-hover:border-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary)/0.08)]">
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold tracking-tight">
                  {k.name}
                </h3>
                {k.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {k.description}
                  </p>
                )}
                <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-2.5 py-0.5 text-xs font-semibold text-[hsl(var(--brand-pink))]">
                  {k.artikel_anzahl}{" "}
                  {k.artikel_anzahl === 1 ? "Artikel" : "Artikel"}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* === Artikel-Liste === */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
              {aktuelleKategorie
                ? `Kategorie · ${aktuelleKategorie.name}`
                : query
                ? "Suchergebnis"
                : "Alle Artikel"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {aktuelleKategorie
                ? aktuelleKategorie.name
                : query
                ? `„${query}“`
                : "Alle Artikel"}
            </h2>
          </div>
          <span className="text-sm tabular-nums text-muted-foreground">
            {artikel.length}{" "}
            {artikel.length === 1 ? "Artikel" : "Artikel"}
          </span>
        </div>

        {artikel.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
              <BookOpenText className="h-5 w-5" />
            </span>
            <p className="mt-4 text-base font-medium">
              {istGefiltert ? "Keine Treffer" : "Noch keine Artikel"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {istGefiltert
                ? "Versuch ein anderes Stichwort oder eine andere Kategorie."
                : "Sobald die Studioleitung Artikel anlegt, erscheinen sie hier."}
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-border bg-card">
            {artikel.map((a, i) => (
              <li key={a.id} className={i > 0 ? "border-t border-border" : ""}>
                <Link
                  href={`/wissen/${a.slug}`}
                  className="group flex items-center gap-6 px-6 py-5 transition-colors hover:bg-[hsl(var(--primary)/0.04)] sm:px-8 sm:py-6"
                >
                  <span className="hidden font-mono text-sm tabular-nums text-muted-foreground sm:block">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
                        {a.category_name ?? "Ohne Kategorie"}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold leading-tight tracking-tight sm:text-xl">
                      {a.title}
                    </h3>
                    {a.summary && (
                      <p className="mt-1.5 line-clamp-1 text-sm text-muted-foreground sm:line-clamp-2">
                        {a.summary}
                      </p>
                    )}
                  </div>

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all group-hover:border-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary))] group-hover:text-[hsl(var(--primary-foreground))]">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, wert }: { label: string; wert: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-cream)/0.45)]">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums text-[hsl(var(--brand-cream))]">
        {wert}
      </p>
    </div>
  );
}
