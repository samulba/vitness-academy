import { notFound } from "next/navigation";
import { Lock, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PermissionsMatrix } from "@/components/admin/PermissionsMatrix";
import { requireRole } from "@/lib/auth";
import { ladeRolle } from "@/lib/rollen-admin";
import {
  rolleStammdatenSpeichern,
  rollePermissionsSpeichern,
  rolleArchivieren,
} from "../actions";
import { ArchivierenButton } from "./ArchivierenButton";

const BASE_LEVEL_LABELS: Record<string, string> = {
  mitarbeiter: "Mitarbeiter",
  fuehrungskraft: "Führungskraft",
  admin: "Admin",
  superadmin: "Superadmin",
};

export default async function RolleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["superadmin"]);
  const { id } = await params;
  const rolle = await ladeRolle(id);
  if (!rolle) notFound();

  const stammdatenAction = rolleStammdatenSpeichern.bind(null, id);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Rollen", href: "/admin/rollen" },
          { label: rolle.name },
        ]}
        eyebrow={rolle.is_system ? "System-Rolle" : "Custom-Rolle"}
        title={rolle.name}
        description={
          rolle.beschreibung ??
          (rolle.is_system
            ? "System-Rolle — Stammdaten gesperrt, Permissions können angepasst werden."
            : "Custom-Rolle. Du kannst Stammdaten und Permissions frei bearbeiten.")
        }
      />

      {rolle.is_system && (
        <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            System-Rollen werden vom System verwendet (z.B. für RLS und neue
            Mitarbeiter). Stammdaten sind gesperrt, du kannst nur Permissions
            anpassen.
          </span>
        </div>
      )}

      {/* Stammdaten */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[hsl(var(--brand-pink))]" />
            <h2 className="text-[14px] font-semibold tracking-tight">
              Stammdaten
            </h2>
          </div>
        </header>
        <form action={stammdatenAction} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-[12px] font-medium text-muted-foreground"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                maxLength={60}
                disabled={rolle.is_system}
                defaultValue={rolle.name}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="base_level"
                className="text-[12px] font-medium text-muted-foreground"
              >
                Basis-Level
              </label>
              <select
                id="base_level"
                name="base_level"
                disabled={rolle.is_system}
                defaultValue={rolle.base_level}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="mitarbeiter">Mitarbeiter</option>
                <option value="fuehrungskraft">Führungskraft</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="beschreibung"
              className="text-[12px] font-medium text-muted-foreground"
            >
              Beschreibung
            </label>
            <textarea
              id="beschreibung"
              name="beschreibung"
              maxLength={400}
              rows={2}
              disabled={rolle.is_system}
              defaultValue={rolle.beschreibung ?? ""}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
          {!rolle.is_system && (
            <div className="flex justify-end pt-1">
              <Button type="submit" variant="primary">
                <Save />
                Stammdaten speichern
              </Button>
            </div>
          )}
        </form>
      </section>

      {/* Permissions-Matrix */}
      <section>
        <header className="mb-3 flex items-baseline justify-between">
          <div>
            <h2 className="text-[14px] font-semibold tracking-tight">
              Berechtigungen
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Pro Modul: was darf diese Rolle? Basis ist „
              {BASE_LEVEL_LABELS[rolle.base_level]}&ldquo;.
            </p>
          </div>
        </header>
        <PermissionsMatrix
          roleId={rolle.id}
          initial={rolle.permissions}
          speichern={rollePermissionsSpeichern}
        />
      </section>

      {/* Archivieren */}
      {!rolle.is_system && !rolle.archived_at && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-[14px] font-semibold tracking-tight">
            Rolle archivieren
          </h3>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Archivierte Rollen können nicht mehr ausgewählt werden. Voraussetzung:
            kein Mitarbeiter ist mehr in dieser Rolle.
          </p>
          <div className="mt-3">
            <ArchivierenButton
              archivieren={rolleArchivieren.bind(null, rolle.id)}
            />
          </div>
        </section>
      )}
    </div>
  );
}
