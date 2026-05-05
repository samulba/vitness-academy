import { Contact, Phone, Plus, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth";
import { ladeKontakte } from "@/lib/kontakte";
import { getAktiverStandort } from "@/lib/standort-context";
import { KontakteTable } from "./KontakteTable";

export default async function KontakteAdminPage() {
  await requireRole(["admin", "superadmin"]);
  const aktiv = await getAktiverStandort();
  const kontakte = await ladeKontakte(aktiv?.id ?? null);
  const mitTel = kontakte.filter((k) => k.phone).length;
  const mitMail = kontakte.filter((k) => k.email).length;
  const tagsSet = new Set<string>();
  for (const k of kontakte) {
    const tags = Array.isArray(k.role_tags) ? k.role_tags : [];
    for (const t of tags) if (typeof t === "string" && t.length > 0) tagsSet.add(t);
  }
  const rollen = Array.from(tagsSet).sort((a, b) => a.localeCompare(b, "de"));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio-Daten"
        title="Kontakte"
        description="Studio-interne Kontaktliste — Mitarbeiter:innen sehen sie unter Studio · Kontakte."
        primaryAction={{
          label: "Neuer Kontakt",
          icon: <Plus />,
          href: "/admin/kontakte/neu",
        }}
        secondaryActions={[
          {
            label: "Rollen verwalten",
            icon: <Settings2 />,
            href: "/admin/kontakte/rollen",
          },
        ]}
      />

      <StatGrid cols={4}>
        <StatCard label="Kontakte" value={kontakte.length} icon={<Contact />} />
        <StatCard label="Mit Telefon" value={mitTel} icon={<Phone />} />
        <StatCard label="Mit E-Mail" value={mitMail} icon={<Contact />} />
        <StatCard
          label="Rollen-Tags"
          value={tagsSet.size}
          icon={<Contact />}
        />
      </StatGrid>

      {kontakte.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title="Noch keine Kontakte"
            description="Lege Mitarbeiter, externe Trainer oder Lieferanten an, die das Team braucht."
            actions={[
              {
                icon: <Plus />,
                title: "Kontakt anlegen",
                description: "Mit Rollen-Tags",
                href: "/admin/kontakte/neu",
              },
            ]}
          />
        </div>
      ) : (
        <KontakteTable kontakte={kontakte} rollen={rollen} />
      )}
    </div>
  );
}
