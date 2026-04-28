import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ladeArtikelDetail } from "@/lib/wissen";
import { formatDatum } from "@/lib/format";

export default async function ArtikelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artikel = await ladeArtikelDetail(slug);
  if (!artikel) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={
          artikel.category_slug
            ? `/wissen?kategorie=${artikel.category_slug}`
            : "/wissen"
        }
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Wissensdatenbank
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1">
            <BookOpen className="h-3 w-3" />
            {artikel.category_name ?? "Ohne Kategorie"}
          </Badge>
          <span>·</span>
          <span>Aktualisiert am {formatDatum(artikel.updated_at)}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {artikel.title}
        </h1>
        {artikel.summary ? (
          <p className="max-w-2xl text-muted-foreground">{artikel.summary}</p>
        ) : null}
      </header>

      <Card>
        <CardContent className="py-6">
          <div className="prose-vitness max-w-3xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {artikel.body}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
