import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ladeKontakt } from "@/lib/kontakte";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { KontaktForm } from "../KontaktForm";
import { kontaktAktualisieren, kontaktLoeschen } from "../actions";

export default async function KontaktBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin", "superadmin"]);
  const { id } = await params;
  const k = await ladeKontakt(id);
  if (!k) notFound();

  const aktualisieren = kontaktAktualisieren.bind(null, id);
  const loeschen = kontaktLoeschen.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href="/admin/kontakte"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Kontaktliste
      </Link>

      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Studio · Kontakte
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Kontakt bearbeiten
        </h1>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <KontaktForm
          action={aktualisieren}
          modus="bearbeiten"
          initial={{
            first_name: k.first_name,
            last_name: k.last_name,
            role_tags: k.role_tags,
            phone: k.phone,
            email: k.email,
            notes: k.notes,
            sort_order: k.sort_order,
          }}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold">Kontakt löschen</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Kann nicht rückgängig gemacht werden.
        </p>
        <div className="mt-4">
          <LoeschenButton
            action={loeschen}
            label="Kontakt endgültig löschen"
            bestaetigung="Diesen Kontakt wirklich löschen? Kann nicht rückgängig gemacht werden."
          />
        </div>
      </div>
    </div>
  );
}
