import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { KontakteListe } from "@/components/kontakte/KontakteListe";
import { ladeKontakte } from "@/lib/kontakte";
import { getAktiverStandort } from "@/lib/standort-context";

export default async function KontaktePage() {
  const aktiv = await getAktiverStandort();
  const alle = await ladeKontakte(aktiv?.id ?? null);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio"
        title="Kontakte"
        description="Wer macht was im Studio? Tab wechseln zwischen Team und externen Partnern, dann nach Rolle filtern."
      />

      {alle.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            title="Keine Kontakte hinterlegt"
            description="Sobald die Studioleitung Kontakte anlegt, tauchen sie hier auf."
          />
        </div>
      ) : (
        <KontakteListe kontakte={alle} />
      )}
    </div>
  );
}
