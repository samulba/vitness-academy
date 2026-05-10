import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TemplateForm, type PfadOption } from "../TemplateForm";
import { templateAnlegen } from "../actions";

export default async function NeuesTemplatePage() {
  await requirePermission("onboarding-templates", "create");
  const supabase = await createClient();
  const { data: pfade } = await supabase
    .from("learning_paths")
    .select("id, title, description")
    .eq("status", "aktiv")
    .order("sort_order", { ascending: true });

  const lernpfade: PfadOption[] = (
    (pfade ?? []) as { id: string; title: string; description: string | null }[]
  ).map((p) => ({ ...p, archiviert: false }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Onboarding-Templates", href: "/admin/onboarding-templates" },
          { label: "Neu" },
        ]}
        eyebrow="Template"
        title="Neues Onboarding-Template"
        description="Definiere Rolle und Lernpfade, die beim Anlegen neuer Mitarbeiter:innen vorausgewählt werden."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card p-6 sm:p-8">
        <TemplateForm
          action={templateAnlegen}
          modus="neu"
          lernpfade={lernpfade}
        />
      </div>
    </div>
  );
}
