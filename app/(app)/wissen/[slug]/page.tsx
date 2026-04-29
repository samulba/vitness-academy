import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ladeArtikelDetail, ladeBookmarkIds } from "@/lib/wissen";
import { formatDatum } from "@/lib/format";
import { requireProfile } from "@/lib/auth";
import { BookmarkButton } from "@/components/wissen/BookmarkButton";

export default async function ArtikelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await requireProfile();
  const [artikel, bookmarkIds] = await Promise.all([
    ladeArtikelDetail(slug),
    ladeBookmarkIds(profile.id),
  ]);
  if (!artikel) notFound();

  return (
    <article className="mx-auto max-w-3xl space-y-12">
      <Link
        href={
          artikel.category_slug
            ? `/wissen?kategorie=${artikel.category_slug}`
            : "/wissen"
        }
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zum Handbuch
      </Link>

      <header className="space-y-6 border-b border-border pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
              {artikel.category_name ?? "Ohne Kategorie"}
            </span>
            <span className="text-xs text-muted-foreground">
              Aktualisiert am {formatDatum(artikel.updated_at)}
            </span>
          </div>
          <BookmarkButton
            articleId={artikel.id}
            istGespeichert={bookmarkIds.has(artikel.id)}
            variant="label"
          />
        </div>
        <h1 className="text-balance font-semibold leading-[1.05] tracking-[-0.025em] text-[clamp(2rem,4vw,3.5rem)]">
          {artikel.title}
        </h1>
        {artikel.summary && (
          <p className="max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {artikel.summary}
          </p>
        )}
      </header>

      <div className="prose-vitness max-w-none text-base leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {artikel.body}
        </ReactMarkdown>
      </div>

      <footer className="border-t border-border pt-8">
        <p className="text-sm text-muted-foreground">
          Etwas unklar oder fehlt? Sag deiner Studioleitung Bescheid — wir
          halten das Handbuch aktuell.
        </p>
      </footer>
    </article>
  );
}
