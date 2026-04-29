import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ladeAnnouncement } from "@/lib/infos";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { InfoForm } from "../InfoForm";
import { infoAktualisieren, infoLoeschen } from "../actions";

export default async function InfoBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin", "superadmin"]);
  const { id } = await params;
  const info = await ladeAnnouncement(id);
  if (!info) notFound();

  const aktualisieren = infoAktualisieren.bind(null, id);
  const loeschen = infoLoeschen.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href="/admin/infos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu allen Infos
      </Link>

      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Studio · Wichtige Infos
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Info bearbeiten
        </h1>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <InfoForm
          action={aktualisieren}
          modus="bearbeiten"
          initial={{
            title: info.title,
            body: info.body,
            importance: info.importance,
            pinned: info.pinned,
            published: info.published,
          }}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold">Info löschen</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Kann nicht rückgängig gemacht werden.
        </p>
        <div className="mt-4">
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
