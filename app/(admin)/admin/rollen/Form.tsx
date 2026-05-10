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
import {
  PFLICHT_PERMISSIONS,
  type Aktion,
  type Modul,
} from "@/lib/permissions";
import type { RolleBaseLevel } from "@/lib/rollen-verwaltung";

/**
 * RollenTyp:
 *   - "mitarbeiter": Custom-Rolle die Mitarbeiter-Tabs filtert.
 *                    Basis-Level immer "mitarbeiter", nur Mitarbeiter-Permissions.
 *   - "verwaltung":  Custom-Rolle die /admin/-Module steuert.
 *                    Basis-Level "fuehrungskraft" oder "admin", nur Verwaltungs-Permissions.
 */
export type RollenTyp = "mitarbeiter" | "verwaltung";

type FormProps =
  | {
      mode: "neu";
      typ: RollenTyp;
    }
  | {
      mode: "edit";
      id: string;
      name: string;
      beschreibung: string | null;
      base_level: RolleBaseLevel;
      is_system: boolean;
      typ: RollenTyp;
      user_count: number | null;
      initialPermissions: { modul: Modul; aktion: Aktion }[];
    };

export function RollenForm(props: FormProps) {
  const istEdit = props.mode === "edit";
  const istSystem = istEdit && props.is_system;
  const istMitarbeiterTyp = props.typ === "mitarbeiter";
  const [pending, startTransition] = useTransition();

  // Server-Action direkt als Form-Action binden (Next.js Standard-
  // Pattern). Vorher hatte ich einen async-Client-Wrapper drumherum,
  // der den redirect()-Throw aus der Server-Action geschluckt hat --
  // dadurch sind die DB-Updates manchmal nicht durchgekommen, der
  // "Gespeichert"-Toast aber trotzdem gezeigt. Mit .bind(null, id)
  // wird die Action direkt vom Form-Submit-Mechanismus aufgerufen.
  const submitAction =
    props.mode === "edit"
      ? rolleAktualisieren.bind(null, props.id)
      : rolleAnlegen;

  function archivieren() {
    if (!istEdit) return;
    if (!confirm("Diese Custom-Rolle wirklich archivieren?")) return;
    startTransition(async () => {
      await rolleArchivieren(props.id);
    });
  }

  // Default base_level richtet sich nach Typ:
  //   mitarbeiter -> "mitarbeiter" (fix)
  //   verwaltung  -> "fuehrungskraft" (User kann auf admin hochstufen)
  const defaultBaseLevel: RolleBaseLevel = istEdit
    ? props.base_level
    : istMitarbeiterTyp
      ? "mitarbeiter"
      : "fuehrungskraft";

  return (
    <form action={submitAction} className="space-y-6">
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
            placeholder={
              istMitarbeiterTyp
                ? "z.B. Vertrieb, Trainer, Reinigung"
                : "z.B. Buchhalter, Marketing-Lead"
            }
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

        {/* Basis-Level: Bei Mitarbeiter-Typ fix; bei Verwaltungs-Typ
            wählbar zwischen Führungskraft und Admin. Mitarbeiter und
            Superadmin werden bewusst nicht als Custom-Rolle exponiert. */}
        <div>
          <label
            htmlFor="base_level"
            className="block text-xs font-medium text-foreground"
          >
            Basis-Level
          </label>
          {istMitarbeiterTyp ? (
            <>
              <input type="hidden" name="base_level" value="mitarbeiter" />
              <div className="mt-1 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                Mitarbeiter (fest für Mitarbeiter-Rollen)
              </div>
            </>
          ) : (
            <select
              id="base_level"
              name="base_level"
              required
              disabled={istSystem}
              defaultValue={defaultBaseLevel}
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:bg-muted/40 disabled:text-muted-foreground"
            >
              <option value="fuehrungskraft">Führungskraft</option>
              <option value="admin">Admin</option>
            </select>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            {istMitarbeiterTyp
              ? "Bestimmt die DB-Rechte (RLS). Mitarbeiter-Rollen erben Mitarbeiter-Rechte und ergänzen sie um die ausgewählten Tabs."
              : "Bestimmt die DB-Rechte (RLS). Admin gibt vollen Datenbank-Zugriff zusätzlich zu den ausgewählten Permissions; Führungskraft ist restriktiver."}
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
            {istMitarbeiterTyp
              ? "Wähle, welche Tabs ihre Mitarbeiter in der App sehen. Was sie damit tun, regelt RLS."
              : "Wähle Module und Aktionen, die diese Rolle bedienen darf. Die Sidebar zeigt nur Module, für die mind. eine Aktion erteilt ist."}
          </p>
        </div>
        <PermissionsMatrix
          initial={istEdit ? props.initialPermissions : []}
          vorlageLaden={istEdit ? undefined : ladeSystemRollenVorlage}
          bereich={istMitarbeiterTyp ? "mitarbeiter" : "verwaltung"}
          lockedKeys={
            istEdit ? PFLICHT_PERMISSIONS[props.id] ?? [] : []
          }
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
