import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ladeTemplateBySlug } from "@/lib/formulare";
import { RenderForm } from "@/components/formulare/RenderForm";

export default async function FormularPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tpl = await ladeTemplateBySlug(slug);
  if (!tpl || tpl.status !== "aktiv") notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href="/formulare"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu allen Formularen
      </Link>

      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Studio · Formulare
        </p>
        <h1 className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.5rem)]">
          {tpl.title}
        </h1>
        {tpl.description && (
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            {tpl.description}
          </p>
        )}
      </header>

      {tpl.fields.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Dieses Formular hat noch keine Felder.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <RenderForm fields={tpl.fields} templateSlug={tpl.slug} />
        </div>
      )}
    </div>
  );
}
