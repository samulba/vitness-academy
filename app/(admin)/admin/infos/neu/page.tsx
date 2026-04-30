import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { InfoForm } from "../InfoForm";
import { infoAnlegen } from "../actions";

export default async function NeueInfoPage() {
  await requireRole(["admin", "superadmin"]);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Wichtige Infos", href: "/admin/infos" },
          { label: "Neu" },
        ]}
        eyebrow="Info"
        title="Neue Info"
        description="Mitteilung ans Team — Markdown unterstützt, kann sofort live gehen oder als Entwurf gespeichert werden."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">
            Inhalt
          </h2>
        </div>
        <div className="p-5">
          <InfoForm action={infoAnlegen} modus="neu" />
        </div>
      </div>
    </div>
  );
}
