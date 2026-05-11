"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Info, Sparkles } from "lucide-react";
import {
  AKTION_LABELS,
  MODUL_LABELS,
  SYSTEM_ROLE_IDS,
  type Aktion,
  type Modul,
} from "@/lib/permissions";
import type { RolleVoll } from "@/lib/rollen-verwaltung";

type Standort = { id: string; name: string };

export function RollenPicker({
  initialRole,
  initialLocationId,
  initialCustomRoleIds,
  alleRollen,
  standorte,
  superadminVerfuegbar,
}: {
  initialRole: string;
  initialLocationId: string | null;
  initialCustomRoleIds: string[];
  alleRollen: RolleVoll[];
  standorte: Standort[];
  superadminVerfuegbar: boolean;
}) {
  const [basis, setBasis] = useState<string>(initialRole);
  const [verwaltungsRolleId, setVerwaltungsRolleId] = useState<string>(() => {
    return (
      alleRollen.find(
        (r) =>
          !r.is_system &&
          r.base_level !== "mitarbeiter" &&
          initialCustomRoleIds.includes(r.id),
      )?.id ?? ""
    );
  });
  const [mitarbeiterRolleIds, setMitarbeiterRolleIds] = useState<Set<string>>(
    () =>
      new Set(
        alleRollen
          .filter(
            (r) =>
              !r.is_system &&
              r.base_level === "mitarbeiter" &&
              initialCustomRoleIds.includes(r.id),
          )
          .map((r) => r.id),
      ),
  );

  const verwaltungsRollen = useMemo(
    () =>
      alleRollen.filter(
        (r) => !r.is_system && r.base_level !== "mitarbeiter",
      ),
    [alleRollen],
  );
  const mitarbeiterRollen = useMemo(
    () =>
      alleRollen.filter(
        (r) => !r.is_system && r.base_level === "mitarbeiter",
      ),
    [alleRollen],
  );

  const istMitarbeiterBasis = basis === "mitarbeiter";

  // Wenn Basis Mitarbeiter wird, Verwaltungs-Rolle abwählen.
  function basisAendern(neu: string) {
    setBasis(neu);
    if (neu === "mitarbeiter") setVerwaltungsRolleId("");
  }

  function toggleMitarbeiter(id: string) {
    setMitarbeiterRolleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Effective Permissions Preview: ausgewählte Custom-Rollen +
  // (falls keine Verwaltungs-Custom) System-Rolle für Basis.
  const effective = useMemo(() => {
    const map = new Map<Modul, Set<Aktion>>();
    function addPermissions(rolle: RolleVoll) {
      for (const p of rolle.permissions) {
        const s = map.get(p.modul) ?? new Set<Aktion>();
        s.add(p.aktion);
        map.set(p.modul, s);
      }
    }

    // Verwaltungs-Bereich: Custom-Rolle ueberschreibt, sonst Default-
    // Permissions der deterministischen System-Role-UUID des Basis-
    // Levels (auch wenn die Rolle inzwischen is_system=false ist, wie
    // Führungskraft seit Migration 0065).
    if (verwaltungsRolleId) {
      const r = alleRollen.find((x) => x.id === verwaltungsRolleId);
      if (r) addPermissions(r);
    } else {
      const fallbackId =
        SYSTEM_ROLE_IDS[basis as keyof typeof SYSTEM_ROLE_IDS];
      if (fallbackId) {
        const r = alleRollen.find((x) => x.id === fallbackId);
        if (r) addPermissions(r);
      }
    }

    // Mitarbeiter-Bereich (additiv)
    for (const id of mitarbeiterRolleIds) {
      const r = alleRollen.find((x) => x.id === id);
      if (r) addPermissions(r);
    }

    return map;
  }, [alleRollen, basis, verwaltungsRolleId, mitarbeiterRolleIds]);

  const sortierteEffective = useMemo(
    () =>
      Array.from(effective.entries()).sort((a, b) =>
        MODUL_LABELS[a[0]].localeCompare(MODUL_LABELS[b[0]], "de"),
      ),
    [effective],
  );

  const verwaltungsAnz = Array.from(effective.entries()).filter(
    ([m]) => !m.startsWith("mitarbeiter-"),
  ).length;
  const mitarbeiterAnz = Array.from(effective.entries()).filter(([m]) =>
    m.startsWith("mitarbeiter-"),
  ).length;

  return (
    <div className="space-y-6">
      {/* Versteckte Inputs: alle ausgewählten Custom-Rollen-IDs (Multi) */}
      {verwaltungsRolleId && (
        <input type="hidden" name="role_ids" value={verwaltungsRolleId} />
      )}
      {Array.from(mitarbeiterRolleIds).map((id) => (
        <input key={id} type="hidden" name="role_ids" value={id} />
      ))}

      {/* Basis-Rolle */}
      <fieldset>
        <legend className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Basis-Rolle
          <span className="ml-2 normal-case tracking-normal text-[10px] font-normal">
            bestimmt DB-Rechte (RLS)
          </span>
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <RadioPill
            name="role"
            value="mitarbeiter"
            label="Mitarbeiter"
            beschreibung="Standardrolle. Eingeschränkter DB-Zugriff via RLS."
            checked={basis === "mitarbeiter"}
            onChange={basisAendern}
          />
          <RadioPill
            name="role"
            value="fuehrungskraft"
            label="Führungskraft"
            beschreibung="Studio-HR. Darf Mitarbeiter anlegen, Schichten + Inbox."
            checked={basis === "fuehrungskraft"}
            onChange={basisAendern}
          />
          <RadioPill
            name="role"
            value="admin"
            label="Admin"
            beschreibung="Voller Verwaltungs-Zugriff (alle Inhalte). RLS-Bypass."
            checked={basis === "admin"}
            onChange={basisAendern}
          />
          {superadminVerfuegbar ? (
            <RadioPill
              name="role"
              value="superadmin"
              label="Superadmin"
              beschreibung="Wie Admin plus Rollen-Verwaltung."
              checked={basis === "superadmin"}
              onChange={basisAendern}
            />
          ) : null}
        </div>
      </fieldset>

      {/* Verwaltungs-Custom-Rolle (nur wenn Basis != Mitarbeiter) */}
      {!istMitarbeiterBasis && (
        <fieldset className="border-t border-border pt-5">
          <legend className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Verwaltungs-Rolle
            <span className="ml-2 normal-case tracking-normal text-[10px] font-normal">
              optional, überschreibt Basis-Permissions
            </span>
          </legend>
          <div className="mt-3 space-y-3">
            <select
              value={verwaltungsRolleId}
              onChange={(e) => setVerwaltungsRolleId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">— Standard-Berechtigungen (System-Rolle) —</option>
              {verwaltungsRollen.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                  {r.beschreibung ? ` — ${r.beschreibung}` : ""}
                </option>
              ))}
            </select>
            {verwaltungsRollen.length === 0 && (
              <p className="text-[11px] text-muted-foreground">
                Keine Verwaltungs-Custom-Rollen vorhanden.{" "}
                <Link
                  href="/admin/rollen/neu"
                  className="text-[hsl(var(--primary))] underline-offset-2 hover:underline"
                >
                  Rolle anlegen
                </Link>
              </p>
            )}
          </div>
        </fieldset>
      )}

      {/* Mitarbeiter-Custom-Rollen (additiv, Multi) */}
      <fieldset className="border-t border-border pt-5">
        <legend className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Mitarbeiter-Rollen
          <span className="ml-2 normal-case tracking-normal text-[10px] font-normal">
            additiv, filtern sichtbare Tabs im Mitarbeiter-Bereich
          </span>
        </legend>
        <div className="mt-3 space-y-2">
          {mitarbeiterRollen.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
              Keine Mitarbeiter-Custom-Rollen vorhanden.{" "}
              <Link
                href="/admin/rollen/neu?typ=mitarbeiter"
                className="text-[hsl(var(--primary))] underline-offset-2 hover:underline"
              >
                Rolle anlegen
              </Link>{" "}
              (z.B. Trainer, Vertrieb, Theke, Reinigung).
            </p>
          ) : (
            <>
              {mitarbeiterRollen.map((r) => {
                const aktiv = mitarbeiterRolleIds.has(r.id);
                return (
                  <label
                    key={r.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background px-3 py-2.5 transition-colors hover:border-[hsl(var(--primary))] has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--primary)/0.05)]"
                  >
                    <input
                      type="checkbox"
                      checked={aktiv}
                      onChange={() => toggleMitarbeiter(r.id)}
                      className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">
                        {r.name}
                      </span>
                      {r.beschreibung && (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {r.beschreibung}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
              {mitarbeiterRolleIds.size === 0 && (
                <p className="mt-2 flex items-start gap-2 rounded-md bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Keine Mitarbeiter-Rolle aktiv = User sieht alle Standard-Tabs
                  (Aufgaben, Mängel, Infos, Lernen …).
                </p>
              )}
            </>
          )}
        </div>
      </fieldset>

      {/* Heim-Standort */}
      <fieldset className="border-t border-border pt-5">
        <legend className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Heim-Standort
        </legend>
        <select
          name="location_id"
          defaultValue={initialLocationId ?? ""}
          className="mt-3 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">— ohne —</option>
          {standorte.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </fieldset>

      {/* Effective-Permissions-Preview */}
      <div className="rounded-2xl border border-[hsl(var(--brand-pink)/0.3)] bg-[hsl(var(--brand-pink)/0.04)] p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[hsl(var(--brand-pink))]" />
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
            Effektive Berechtigungen
          </p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Live-Preview was diese Person nach dem Speichern in der App sehen
          und tun kann. {verwaltungsAnz} Verwaltungs-Module ·{" "}
          {mitarbeiterAnz} Mitarbeiter-Tabs.
        </p>
        {sortierteEffective.length === 0 ? (
          <p className="mt-3 rounded-md border border-dashed bg-card p-3 text-xs italic text-muted-foreground">
            Keine Berechtigungen. Diese Person kommt nirgendwo rein.
          </p>
        ) : (
          <div className="mt-3 max-h-72 space-y-1 overflow-y-auto rounded-md border bg-card p-2 text-xs">
            {sortierteEffective.map(([modul, aktionen]) => (
              <div
                key={modul}
                className="flex items-center justify-between gap-2 rounded px-2 py-1 odd:bg-muted/30"
              >
                <span className="font-medium">{MODUL_LABELS[modul]}</span>
                <span className="text-[10px] text-muted-foreground">
                  {Array.from(aktionen)
                    .map((a) => AKTION_LABELS[a])
                    .join(" · ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RadioPill({
  name,
  value,
  label,
  beschreibung,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  beschreibung: string;
  checked: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background px-3 py-2.5 transition-colors hover:border-[hsl(var(--primary))] has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--primary)/0.05)]">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
      />
      <span className="flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {beschreibung}
        </span>
      </span>
    </label>
  );
}
