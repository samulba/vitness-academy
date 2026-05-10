import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth";
import { RollenForm } from "../Form";

export default async function NeueRollePage() {
  await requirePermission("rollen", "create");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Rollen & Rechte", href: "/admin/rollen" },
          { label: "Neu" },
        ]}
        eyebrow="Stammdaten"
        title="Neue Rolle"
        description="Lege eine Custom-Rolle mit eigenen Permissions an. Du kannst eine System-Rolle als Vorlage laden und anpassen."
      />

      <RollenForm mode="neu" />
    </div>
  );
}
