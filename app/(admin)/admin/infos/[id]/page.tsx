import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { requirePermission } from "@/lib/auth";
import { ladeAnnouncement } from "@/lib/infos";
import { ladeStandorte } from "@/lib/standorte";
import { InfoForm } from "../InfoForm";
import { infoAktualisieren, infoLoeschen } from "../actions";

export default async function InfoBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("infos", "view");
  const { id } = await params;
  const [info, standorte] = await Promise.all([
    ladeAnnouncement(id),
    ladeStandorte(),
  ]);
  if (!info) notFound();

  const aktualisieren = infoAktualisieren.bind(null, id);
  const loeschen = infoLoeschen.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Wichtige Infos", href: "/admin/infos" },
          { label: info.title },
        ]}
        eyebrow="Info"
        title={info.title}
        description="Mitteilung an dein Team — Markdown-Body, Wichtigkeit, Pin- und Veröffentlichungs-Status."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">
            Inhalt
          </h2>
        </div>
        <div className="p-5">
          <InfoForm
            action={aktualisieren}
            modus="bearbeiten"
            standorte={standorte.map((s) => ({ id: s.id, name: s.name }))}
            initial={{
              title: info.title,
              body: info.body,
              importance: info.importance,
              category: info.category,
              location_id: info.location_id,
              pinned: info.pinned,
              published: info.published,
            }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-destructive/25 bg-destructive/[0.03]">
        <div className="border-b border-destructive/20 px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight text-destructive">
            Info löschen
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Kann nicht rückgängig gemacht werden.
          </p>
        </div>
        <div className="p-5">
          <LoeschenButton
            action={loeschen}
            label="Info endgültig löschen"
            bestaetigung="Diese Info wirklich löschen?"
          />
        </div>
      </div>
    </div>
  );
}
