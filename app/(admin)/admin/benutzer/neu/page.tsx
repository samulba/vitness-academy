import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ladeTemplatesFuerForm } from "@/lib/onboarding-templates";
import { NeuerBenutzerForm } from "./Form";

export default async function NeuerBenutzerPage() {
  await requirePermission("benutzer", "create");

  const supabase = await createClient();
  const [{ data: pfade }, { data: locs }, templates] = await Promise.all([
    supabase
      .from("learning_paths")
      .select("id, title, description")
      .eq("status", "aktiv")
      .order("sort_order", { ascending: true }),
    supabase
      .from("locations")
      .select("id, name")
      .order("name", { ascending: true }),
    ladeTemplatesFuerForm(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Mitarbeiter", href: "/admin/benutzer" },
          { label: "Neu" },
        ]}
        eyebrow="Onboarding"
        title="Neue:r Mitarbeiter:in"
        description="Wir legen den Account an, weisen die Lernpfade zu und schicken eine Welcome-Mail mit Magic-Link — die Person setzt ihr Passwort selbst."
      />

      <NeuerBenutzerForm
        lernpfade={
          (pfade ?? []) as { id: string; title: string; description: string | null }[]
        }
        standorte={(locs ?? []) as { id: string; name: string }[]}
        templates={templates}
      />
    </div>
  );
}
