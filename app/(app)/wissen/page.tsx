import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenText,
  Bookmark,
  Coffee,
  Cpu,
  HeartPulse,
  Headphones,
  Search,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import {
  ladeArtikel,
  ladeBookmarkIds,
  ladeBookmarks,
  ladeKategorien,
} from "@/lib/wissen";
import { requireProfile } from "@/lib/auth";
import { BookmarkButton } from "@/components/wissen/BookmarkButton";
import { cn } from "@/lib/utils";

const HAEUFIG_GESUCHT = [
  "Karte",
  "Beschwerde",
  "Reha",
  "Beitrag",
  "Notfall",
  "Probetraining",
];

function iconFuerKategorie(name: string) {
  const n = name.toLowerCase();
  if (n.includes("magicline")) return Cpu;
  if (n.includes("theke") || n.includes("empfang")) return Coffee;
  if (n.includes("reha") || n.includes("präv")) return HeartPulse;
  if (n.includes("kunden") || n.includes("service")) return Headphones;
  if (n.includes("notfall") || n.includes("notfäll")) return AlertTriangle;
  if (n.includes("technik")) return Wrench;
  return BookOpenText;
}

export default async function HandbuchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategorie?: string }>;
}) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";
  const kategorieSlug = sp.kategorie?.trim() ?? "";

  const profile = await requireProfile();
  const [kategorien, artikel, bookmarkIds, bookmarks] = await Promise.all([
    ladeKategorien(),
    ladeArtikel({
      query: query || undefined,
      kategorieSlug: kategorieSlug || undefined,
    }),
    ladeBookmarkIds(profile.id),
    ladeBookmarks(profile.id),
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
      <section className="relative">
        {/* Subtiler Magenta-Glow als Akzent */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-0 h-[400px] w-[400px] rounded-full opacity-[0.12] blur-[100px]"
          style={{
            background:
              "radial-gradient(closest-side, hsl(var(--primary)), transparent)",
          }}
        />

        <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
              <span className="h-px w-10 bg-[hsl(var(--primary))]" />
              <span>Vitness Handbuch</span>
              <span className="text-muted-foreground">
                · {gesamtArtikel} Artikel · {kategorien.length} Kategorien
              </span>
            </div>

            <h1 className="mt-8 text-balance font-semibold leading-[0.98] tracking-[-0.035em] text-[clamp(2.5rem,5vw,4.5rem)]">
              Antworten für den{" "}
              <span className="relative inline-block">
                Studio-Alltag.
                <span
                  aria-hidden
                  className="absolute -bottom-1.5 left-0 right-1 h-[5px] rounded-full bg-[hsl(var(--primary))]"
                />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Schnelle Antworten auf typische Fragen — vom Notfallplan bis zur
              Reinigungsroutine.
            </p>
          </div>

          {/* Studio-Karte rechts */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                  <Sparkles className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-sm font-semibold">Wir halten alles aktuell</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Du findest etwas Veraltetes? Sag&apos;s deiner
                    Studioleitung — meist ist es am gleichen Tag korrigiert.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Such-Hero */}
        <form action="/wissen" className="mt-12 space-y-5">
          <div className="relative">
            {/* Magenta-Outer-Glow on focus */}
            <div
              aria-hidden
              className="absolute -inset-0.5 rounded-full bg-[hsl(var(--primary)/0.2)] opacity-0 blur transition-opacity duration-300 focus-within:opacity-100"
            />
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Stichwort eingeben — z.B. Karte, Reha, Beitrag…"
                className="h-14 w-full rounded-full border-2 border-border bg-background pl-14 pr-32 text-base transition-all focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-4 focus:ring-[hsl(var(--primary)/0.15)]"
              />
              {kategorieSlug && (
                <input type="hidden" name="kategorie" value={kategorieSlug} />
              )}
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:scale-[1.03]"
              >
                Suchen
              </button>
            </div>
          </div>

          {/* Häufig gesucht */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Häufig gesucht ·
            </span>
            {HAEUFIG_GESUCHT.map((tag) => (
              <Link
                key={tag}
                href={`/wissen?q=${encodeURIComponent(tag)}`}
                className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.06)] hover:text-[hsl(var(--primary))]"
              >
                {tag}
              </Link>
            ))}
            {istGefiltert && (
              <Link
                href="/wissen"
                className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Filter zurücksetzen
              </Link>
            )}
          </div>
        </form>
      </section>

      {/* === Meine Favoriten (nur wenn nicht gefiltert + Bookmarks vorhanden) === */}
      {!istGefiltert && bookmarks.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-baseline justify-between">
            <h2 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Bookmark className="h-5 w-5 fill-[hsl(var(--primary))] text-[hsl(var(--primary))]" />
              Meine Favoriten
            </h2>
            <span className="text-xs text-muted-foreground">
              {bookmarks.length} gespeichert
            </span>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {bookmarks.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/wissen/${b.slug}`}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--primary))] hover:shadow-[0_12px_30px_-15px_hsl(var(--primary)/0.3)]"
                >
                  <Bookmark className="mt-0.5 h-4 w-4 shrink-0 fill-[hsl(var(--primary))] text-[hsl(var(--primary))]" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
                      {b.category_name ?? "Ohne Kategorie"}
                    </span>
                    <p className="mt-0.5 truncate text-sm font-semibold leading-tight">
                      {b.title}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-[hsl(var(--primary))]" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* === Kategorien (nur wenn nicht gefiltert) === */}
      {!istGefiltert && kategorien.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              Kategorien
            </h2>
            <span className="text-xs text-muted-foreground">
              Stöbere thematisch
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {kategorien.map((k, i) => {
              const Icon = iconFuerKategorie(k.name);
              return (
                <Link
                  key={k.id}
                  href={`/wissen?kategorie=${k.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--primary))] hover:shadow-[0_16px_40px_-20px_hsl(var(--primary)/0.35)]"
                >
                  {/* Magenta-Akzent-Streifen oben — wird auf Hover sichtbar */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-[hsl(var(--primary))] transition-transform duration-300 group-hover:scale-x-100"
                  />

                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--brand-pink)/0.1)] text-[hsl(var(--brand-pink))] transition-colors group-hover:bg-[hsl(var(--primary)/0.12)] group-hover:text-[hsl(var(--primary))]">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    {k.name}
                  </h3>
                  {k.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {k.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[hsl(var(--brand-pink))]">
                      {k.artikel_anzahl}{" "}
                      {k.artikel_anzahl === 1 ? "Artikel" : "Artikel"}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-[hsl(var(--primary))]" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* === Artikel-Liste === */}
      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
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
                : "Sobald Artikel angelegt sind, erscheinen sie hier."}
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-border bg-card">
            {artikel.map((a, i) => (
              <li
                key={a.id}
                className={cn(
                  "group relative flex items-center gap-5 px-6 py-5 transition-colors hover:bg-[hsl(var(--primary)/0.04)]",
                  i > 0 && "border-t border-border",
                )}
              >
                {/* Magenta-Linie links bei Hover */}
                <span
                  aria-hidden
                  className="absolute inset-y-3 left-0 w-[3px] origin-top scale-y-0 rounded-r-full bg-[hsl(var(--primary))] transition-transform duration-200 group-hover:scale-y-100"
                />
                <span className="hidden font-mono text-xs tabular-nums text-muted-foreground sm:block">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <Link
                  href={`/wissen/${a.slug}`}
                  className="min-w-0 flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.4)] rounded-md"
                >
                  <span className="rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
                    {a.category_name ?? "Ohne Kategorie"}
                  </span>
                  <h3 className="mt-1.5 text-base font-semibold leading-tight tracking-tight sm:text-lg">
                    {a.title}
                  </h3>
                  {a.summary && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground sm:line-clamp-2">
                      {a.summary}
                    </p>
                  )}
                </Link>

                <BookmarkButton
                  articleId={a.id}
                  istGespeichert={bookmarkIds.has(a.id)}
                />

                <Link
                  href={`/wissen/${a.slug}`}
                  aria-label={`${a.title} öffnen`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all group-hover:border-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary))] group-hover:text-[hsl(var(--primary-foreground))]"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
