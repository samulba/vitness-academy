import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { requireRole } from "@/lib/auth";
import { ladeKontakt, vollerName } from "@/lib/kontakte";
import { ladeRollen } from "@/lib/contact-roles";
import { KontaktForm } from "../KontaktForm";
import { kontaktAktualisieren, kontaktLoeschen } from "../actions";

export default async function KontaktBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin", "superadmin"]);
  const { id } = await params;
  const [k, rollen] = await Promise.all([ladeKontakt(id), ladeRollen()]);
  if (!k) notFound();

  const aktualisieren = kontaktAktualisieren.bind(null, id);
  const loeschen = kontaktLoeschen.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Kontakte", href: "/admin/kontakte" },
          { label: vollerName(k) || "Kontakt" },
        ]}
        eyebrow="Kontakt"
        title={vollerName(k) || "Kontakt bearbeiten"}
        description="Stammdaten, Telefon, E-Mail und Rollen-Tags pflegen."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">
            Stammdaten
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Telefon und E-Mail werden auf der Mitarbeiter-Page klickbar
            (tel:/mailto:).
          </p>
        </div>
        <div className="p-5">
          <KontaktForm
            action={aktualisieren}
            modus="bearbeiten"
            rollen={rollen}
            initial={{
              first_name: k.first_name,
              last_name: k.last_name,
              role_tags: k.role_tags,
              phone: k.phone,
              email: k.email,
              notes: k.notes,
            }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-destructive/25 bg-destructive/[0.03]">
        <div className="border-b border-destructive/20 px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight text-destructive">
            Kontakt löschen
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Kann nicht rückgängig gemacht werden.
          </p>
        </div>
        <div className="p-5">
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
