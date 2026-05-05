import { Contact, Phone, Plus, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { StatusPill } from "@/components/admin/StatusPill";
import { requireRole } from "@/lib/auth";
import {
  ladeKontakte,
  vollerName,
  type Kontakt,
} from "@/lib/kontakte";
import { getAktiverStandort } from "@/lib/standort-context";

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

  const columns: Column<Kontakt>[] = [
    {
      key: "first_name",
      label: "Name",
      sortable: true,
      accessor: (k) => vollerName(k),
      render: (k) => (
        <div className="flex items-center gap-3">
          <ColoredAvatar name={vollerName(k)} size="sm" />
          <span className="font-medium text-foreground">{vollerName(k)}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Kontakt",
      render: (k) => (
        <span className="text-xs text-muted-foreground">
          {[k.email, k.phone].filter(Boolean).join(" · ") || "—"}
        </span>
      ),
    },
    {
      key: "role_tags",
      label: "Rollen",
      render: (k) => {
        const tags = Array.isArray(k.role_tags) ? k.role_tags : [];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((r) => (
              <StatusPill key={r} ton="primary">
                {r}
              </StatusPill>
            ))}
            {tags.length > 3 && (
              <span className="text-[11px] text-muted-foreground">
                +{tags.length - 3}
              </span>
            )}
          </div>
        );
      },
    },
  ];

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
        <DataTable<Kontakt>
          data={kontakte}
          columns={columns}
          searchable={{
            placeholder: "Kontakt suchen…",
            keys: ["first_name", "last_name", "email", "phone"],
          }}
          filters={
            tagsSet.size > 0
              ? [
                  {
                    key: "role_tags",
                    label: "Rolle",
                    options: Array.from(tagsSet).map((t) => ({
                      value: t,
                      label: t,
                    })),
                    multi: true,
                  },
                ]
              : undefined
          }
          rowHref={(k) => `/admin/kontakte/${k.id}`}
          defaultSort={{ key: "first_name", direction: "asc" }}
        />
      )}
    </div>
  );
}
