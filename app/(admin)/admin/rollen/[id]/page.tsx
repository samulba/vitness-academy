import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/admin/StatusPill";
import { requirePermission } from "@/lib/auth";
import { ladeRolle } from "@/lib/rollen-verwaltung";
import { RollenForm } from "../Form";

export default async function RolleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("rollen", "view");
  const { id } = await params;
  const rolle = await ladeRolle(id);
  if (!rolle) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Rollen & Rechte", href: "/admin/rollen" },
          { label: rolle.name },
        ]}
        eyebrow="Stammdaten"
        title={rolle.name}
        description={
          rolle.beschreibung ?? "Verwalte die Permissions dieser Rolle."
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {rolle.is_system ? (
          <StatusPill ton="info">System-Rolle</StatusPill>
        ) : (
          <StatusPill ton="primary">Custom-Rolle</StatusPill>
        )}
        <StatusPill ton="neutral">Basis: {rolle.base_level}</StatusPill>
        {rolle.user_count !== null && (
          <span className="text-[11px] text-muted-foreground">
            {rolle.user_count}{" "}
            {rolle.user_count === 1 ? "Mitarbeiter zugewiesen" : "Mitarbeiter zugewiesen"}
          </span>
        )}
      </div>

      <RollenForm
        mode="edit"
        id={rolle.id}
        name={rolle.name}
        beschreibung={rolle.beschreibung}
        base_level={rolle.base_level}
        is_system={rolle.is_system}
        user_count={rolle.user_count}
        initialPermissions={rolle.permissions}
      />
    </div>
  );
}
