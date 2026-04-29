import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ladeTemplate } from "@/lib/formulare";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { TemplateForm } from "../TemplateForm";
import {
  templateAktualisieren,
  templateLoeschen,
} from "../actions";

export default async function TemplateBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin", "superadmin"]);
  const { id } = await params;
  const t = await ladeTemplate(id);
  if (!t) notFound();

  const aktualisieren = templateAktualisieren.bind(null, id);
  const loeschen = templateLoeschen.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/admin/formulare"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Übersicht
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
            Studio · Formulare
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {t.title}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">/{t.slug}</p>
        </div>
        {t.status === "aktiv" && (
          <Link
            href={`/formulare/${t.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Vorschau
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </header>

      <TemplateForm
        action={aktualisieren}
        modus="bearbeiten"
        initial={{
          title: t.title,
          description: t.description,
          status: t.status,
          sort_order: t.sort_order,
          fields: t.fields,
        }}
      />

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold">Formular löschen</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Inkl. aller bisherigen Einreichungen. Kann nicht rückgängig
          gemacht werden.
        </p>
        <div className="mt-4">
          <LoeschenButton
            action={loeschen}
            label="Formular endgültig löschen"
            bestaetigung="Wirklich löschen — inkl. aller Einreichungen?"
          />
        </div>
      </div>
    </div>
  );
}
