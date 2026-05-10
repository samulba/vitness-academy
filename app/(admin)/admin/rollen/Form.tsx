"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { PermissionsMatrix } from "@/components/admin/PermissionsMatrix";
import {
  ladeSystemRollenVorlage,
  rolleAktualisieren,
  rolleAnlegen,
  rolleArchivieren,
} from "./actions";
import type { Aktion, Modul } from "@/lib/permissions";
import type { RolleBaseLevel } from "@/lib/rollen-verwaltung";

type FormProps =
  | {
      mode: "neu";
    }
  | {
      mode: "edit";
      id: string;
      name: string;
      beschreibung: string | null;
      base_level: RolleBaseLevel;
      is_system: boolean;
      user_count: number | null;
      initialPermissions: { modul: Modul; aktion: Aktion }[];
    };

export function RollenForm(props: FormProps) {
  const istEdit = props.mode === "edit";
  const istSystem = istEdit && props.is_system;
  const [pending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    if (istEdit) {
      await rolleAktualisieren(props.id, formData);
    } else {
      await rolleAnlegen(formData);
    }
  }

  function archivieren() {
    if (!istEdit) return;
    if (!confirm("Diese Custom-Rolle wirklich archivieren?")) return;
    startTransition(async () => {
      await rolleArchivieren(props.id);
    });
  }

  return (
    <form action={onSubmit} className="space-y-6">
      {/* Meta-Felder */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
          Stammdaten
        </h2>
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-medium text-foreground"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            disabled={istSystem}
            defaultValue={istEdit ? props.name : ""}
            placeholder="z.B. Reinigungs-Manager"
            className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:bg-muted/40 disabled:text-muted-foreground"
          />
          {istSystem && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Name von System-Rollen kann nicht geändert werden.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="beschreibung"
            className="block text-xs font-medium text-foreground"
          >
            Beschreibung
          </label>
          <textarea
            id="beschreibung"
            name="beschreibung"
            rows={2}
            disabled={istSystem}
            defaultValue={istEdit ? props.beschreibung ?? "" : ""}
            placeholder="Was darf diese Rolle?"
            className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:bg-muted/40 disabled:text-muted-foreground"
          />
        </div>

        <div>
          <label
            htmlFor="base_level"
            className="block text-xs font-medium text-foreground"
          >
            Basis-Level
          </label>
          <select
            id="base_level"
            name="base_level"
            required
            disabled={istSystem}
            defaultValue={istEdit ? props.base_level : "mitarbeiter"}
            className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:bg-muted/40 disabled:text-muted-foreground"
          >
            <option value="mitarbeiter">Mitarbeiter</option>
            <option value="fuehrungskraft">Führungskraft</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Bestimmt die DB-Rechte (RLS) -- z.B. &bdquo;admin&rdquo; gibt vollen
            Datenbank-Zugriff zusätzlich zu den ausgewählten Permissions.
            Custom-Rollen für Mitarbeiter mit Verwaltungs-Rechten setzen
            das Level meist auf &bdquo;fuehrungskraft&rdquo; oder &bdquo;admin&rdquo;.
          </p>
        </div>
      </section>

      {/* Permissions */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
            Permissions
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Wähle aus, welche Module diese Rolle sehen, anlegen, bearbeiten
            oder löschen darf. Die Sidebar zeigt nur Module, für die mind.
            eine Aktion erteilt ist.
          </p>
        </div>
        <PermissionsMatrix
          initial={istEdit ? props.initialPermissions : []}
          vorlageLaden={istEdit ? undefined : ladeSystemRollenVorlage}
        />
      </section>

      {/* Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>
            {istEdit ? "Speichern" : "Rolle anlegen"}
          </Button>
        </div>
        {istEdit && !istSystem && (
          <Button
            type="button"
            variant="ghost"
            onClick={archivieren}
            disabled={pending || (props.user_count ?? 0) > 0}
            title={
              (props.user_count ?? 0) > 0
                ? "Nicht möglich -- Rolle ist noch zugewiesen."
                : "Rolle archivieren"
            }
            className="text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.05)]"
          >
            Archivieren
          </Button>
        )}
      </div>
    </form>
  );
}
