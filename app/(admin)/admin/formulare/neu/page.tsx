import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { TemplateForm } from "../TemplateForm";
import { templateAnlegen } from "../actions";

export default async function NeuesTemplatePage() {
  await requireRole(["admin", "superadmin"]);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Formulare", href: "/admin/formulare" },
          { label: "Neu" },
        ]}
        eyebrow="Formular"
        title="Neues Formular"
        description="Felder definieren — die Mitarbeiter sehen das fertige Formular dann unter Studio · Formulare."
      />
      <TemplateForm action={templateAnlegen} modus="neu" />
    </div>
  );
}
