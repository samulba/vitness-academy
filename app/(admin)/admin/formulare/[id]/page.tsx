import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { ladeTemplate } from "@/lib/formulare";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { VorschauButton } from "@/components/admin/VorschauButton";
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
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const { id } = await params;
  const t = await ladeTemplate(id);
  if (!t) notFound();

  const aktualisieren = templateAktualisieren.bind(null, id);
  const loeschen = templateLoeschen.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Formulare", href: "/admin/formulare" },
          { label: t.title },
        ]}
        eyebrow={`Formular · /${t.slug}`}
        title={t.title}
        description="Felder pflegen, Status setzen, Eingänge ansehen."
        extras={
          t.status === "aktiv" ? (
            <VorschauButton url={`/formulare/${t.slug}`} />
          ) : undefined
        }
      />

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

      <div className="overflow-hidden rounded-xl border border-destructive/25 bg-destructive/[0.03]">
        <div className="border-b border-destructive/20 px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight text-destructive">
            Formular löschen
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Inkl. aller bisherigen Einreichungen. Kann nicht rückgängig
            gemacht werden.
          </p>
        </div>
        <div className="p-5">
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
