import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { RealtimeRefresh } from "@/lib/hooks/useRealtimeRefresh";
import { requireRole } from "@/lib/auth";
import { ladeAusstehend } from "@/lib/provisionen";
import { InboxItem } from "./InboxItem";

export default async function ProvisionenInboxPage() {
  await requireRole(["admin", "superadmin"]);
  // Admin sieht Inbox ueber alle Standorte.
  const eintraege = await ladeAusstehend({ locationId: null });

  return (
    <div className="space-y-6">
      <RealtimeRefresh table="commission_entries" />
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Provisionen", href: "/admin/provisionen" },
          { label: "Inbox" },
        ]}
        eyebrow="Verkauf"
        title="Provisionen-Inbox"
        description="Eingereichte Abschlüsse, die auf Genehmigung warten. Nach Genehmigung fließen sie in die Monatsabrechnung."
      />

      {eintraege.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            title="Keine ausstehenden Abschlüsse"
            description="Alle Einreichungen sind bearbeitet — neue Einträge tauchen hier auf."
          />
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            <Inbox className="mr-1 inline h-4 w-4" />
            {eintraege.length}{" "}
            {eintraege.length === 1
              ? "Eintrag wartet"
              : "Einträge warten"}{" "}
            auf Genehmigung — älteste zuerst.
          </p>
          <div className="space-y-3">
            {eintraege.map((e) => (
              <InboxItem key={e.id} eintrag={e} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
