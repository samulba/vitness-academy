"use client";

import { useState, useTransition } from "react";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AKTIONEN,
  AKTION_LABELS,
  MODULE,
  MODUL_LABELS,
  type Aktion,
  type Modul,
} from "@/lib/permissions";

type Permission = { modul: Modul; aktion: Aktion };

/**
 * Tabelle Module x Aktionen mit Checkboxen fuer die Rollen-Form.
 * Form-Fields heissen `permission_<modul>_<aktion>` (Werte = "on").
 *
 * Quick-Actions:
 * - Spalte: alle Aktionen pro Modul togglen
 * - "Alle setzen" / "Alle entfernen"
 * - "Vorlage laden" -> ruft Server-Action auf (Permissions einer
 *   System-Rolle laden) und uebernimmt sie in die Matrix
 *
 * `initial` ist die initiale Permission-Liste (z.B. Edit-Form).
 * `disabled` z.B. bei System-Rollen die nur Permissions, nicht Meta
 * editieren koennen -- die Checkboxen bleiben aber editierbar.
 */
export function PermissionsMatrix({
  initial,
  vorlageLaden,
}: {
  initial: Permission[];
  /** Optional: Server-Action zum Laden einer System-Rolle als
   *  Vorlage. Wenn nicht gegeben, wird der "Vorlage laden"-Block
   *  ausgeblendet (z.B. beim Edit einer Custom-Rolle). */
  vorlageLaden?: (
    baseLevel: "mitarbeiter" | "fuehrungskraft" | "admin" | "superadmin",
  ) => Promise<Permission[]>;
}) {
  const initialKeys = new Set(initial.map((p) => `${p.modul}:${p.aktion}`));
  const [aktiveKeys, setAktiveKeys] = useState<Set<string>>(initialKeys);
  const [pending, startTransition] = useTransition();

  function key(m: Modul, a: Aktion): string {
    return `${m}:${a}`;
  }

  function toggle(m: Modul, a: Aktion) {
    const k = key(m, a);
    setAktiveKeys((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  function setzeModulZeile(m: Modul, alle: boolean) {
    setAktiveKeys((prev) => {
      const next = new Set(prev);
      for (const a of AKTIONEN) {
        const k = key(m, a);
        if (alle) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  }

  function setzeAlle(alle: boolean) {
    if (!alle) {
      setAktiveKeys(new Set());
      return;
    }
    const next = new Set<string>();
    for (const m of MODULE) {
      for (const a of AKTIONEN) {
        next.add(key(m, a));
      }
    }
    setAktiveKeys(next);
  }

  function ladeVorlage(
    baseLevel: "mitarbeiter" | "fuehrungskraft" | "admin" | "superadmin",
  ) {
    if (!vorlageLaden) return;
    startTransition(async () => {
      const perms = await vorlageLaden(baseLevel);
      setAktiveKeys(new Set(perms.map((p) => `${p.modul}:${p.aktion}`)));
    });
  }

  return (
    <div className="space-y-4">
      {/* Hidden-Inputs fuer alle aktiven Permissions -- damit FormData
          die ankreuzten Checkboxen mitsendet auch wenn die echten
          Inputs ausserhalb des Forms haetten sein koennen. */}
      {[...aktiveKeys].map((k) => {
        const [m, a] = k.split(":");
        return (
          <input
            key={k}
            type="hidden"
            name={`permission_${m}_${a}`}
            value="on"
          />
        );
      })}

      {/* Quick-Actions */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/30 p-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Schnell-Aktionen:
        </span>
        <button
          type="button"
          onClick={() => setzeAlle(true)}
          className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium transition-colors hover:bg-muted"
        >
          Alle setzen
        </button>
        <button
          type="button"
          onClick={() => setzeAlle(false)}
          className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium transition-colors hover:bg-muted"
        >
          Alle entfernen
        </button>
        {vorlageLaden && (
          <>
            <span className="ml-auto text-[11px] text-muted-foreground">
              Vorlage:
            </span>
            <button
              type="button"
              onClick={() => ladeVorlage("mitarbeiter")}
              disabled={pending}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" /> Mitarbeiter
            </button>
            <button
              type="button"
              onClick={() => ladeVorlage("fuehrungskraft")}
              disabled={pending}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" /> Führungskraft
            </button>
            <button
              type="button"
              onClick={() => ladeVorlage("admin")}
              disabled={pending}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" /> Admin
            </button>
          </>
        )}
      </div>

      {/* Matrix-Tabelle. Auf Mobile horizontal scrollbar. */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-background px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Modul
              </th>
              {AKTIONEN.map((a) => (
                <th
                  key={a}
                  className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {AKTION_LABELS[a]}
                </th>
              ))}
              <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Zeile
              </th>
            </tr>
          </thead>
          <tbody>
            {MODULE.map((m, idx) => {
              const zeileAlle = AKTIONEN.every((a) =>
                aktiveKeys.has(key(m, a)),
              );
              return (
                <tr
                  key={m}
                  className={cn(
                    "transition-colors hover:bg-muted/40",
                    idx > 0 && "border-t border-border",
                  )}
                >
                  <td className="sticky left-0 z-10 whitespace-nowrap bg-background px-3 py-2 text-[13px] font-medium">
                    {MODUL_LABELS[m]}
                  </td>
                  {AKTIONEN.map((a) => {
                    const checked = aktiveKeys.has(key(m, a));
                    return (
                      <td key={a} className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => toggle(m, a)}
                          aria-pressed={checked}
                          aria-label={`${MODUL_LABELS[m]}: ${AKTION_LABELS[a]} ${checked ? "aktiv" : "inaktiv"}`}
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors",
                            checked
                              ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                              : "border-border bg-background hover:border-[hsl(var(--primary)/0.4)]",
                          )}
                        >
                          {checked && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => setzeModulZeile(m, !zeileAlle)}
                      className="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted"
                    >
                      {zeileAlle ? "Aus" : "Alle"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        {aktiveKeys.size} von {MODULE.length * AKTIONEN.length} Permissions
        aktiv.
      </p>
    </div>
  );
}
