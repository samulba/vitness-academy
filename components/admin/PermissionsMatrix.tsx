"use client";

import { useState, useTransition } from "react";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AKTIONEN,
  AKTION_LABELS,
  aktionenFuerModul,
  MITARBEITER_MODULE,
  MODULE,
  MODUL_LABELS,
  VERWALTUNG_MODULE,
  type Aktion,
  type Modul,
} from "@/lib/permissions";

type Permission = { modul: Modul; aktion: Aktion };

/**
 * Tabelle Module x Aktionen mit Checkboxen fuer die Rollen-Form.
 * Form-Fields heissen `permission_<modul>_<aktion>` (Werte = "on").
 *
 * Zwei Sektionen:
 *   - Verwaltungs-Bereich (alle 4 Aktionen pro Modul)
 *   - Mitarbeiter-Bereich (nur "Sehen" -- regelt die Sidebar-Tabs)
 *
 * Quick-Actions:
 * - Spalte: alle Aktionen pro Modul togglen
 * - "Alle setzen" / "Alle entfernen" pro Sektion
 * - "Vorlage laden" -> ruft Server-Action auf (Permissions einer
 *   System-Rolle laden) und uebernimmt sie in die Matrix
 *
 * `initial` ist die initiale Permission-Liste (z.B. Edit-Form).
 */
export function PermissionsMatrix({
  initial,
  vorlageLaden,
  bereich,
}: {
  initial: Permission[];
  /** Optional: Server-Action zum Laden einer System-Rolle als
   *  Vorlage. Wenn nicht gegeben, wird der "Vorlage laden"-Block
   *  ausgeblendet (z.B. beim Edit einer Custom-Rolle). */
  vorlageLaden?: (
    baseLevel: "mitarbeiter" | "fuehrungskraft" | "admin" | "superadmin",
  ) => Promise<Permission[]>;
  /** Welche Sektion gerendert wird. Default: beide (z.B. fuer Edit-
   *  Pages, die nicht typgebunden sind). "mitarbeiter": nur Mitarbeiter-
   *  Bereich (Tab-Sichtbarkeit). "verwaltung": nur Verwaltungs-Bereich. */
  bereich?: "mitarbeiter" | "verwaltung";
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
      for (const a of aktionenFuerModul(m)) {
        const k = key(m, a);
        if (alle) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  }

  function setzeBereich(
    module: readonly Modul[],
    alle: boolean,
  ) {
    setAktiveKeys((prev) => {
      const next = new Set(prev);
      for (const m of module) {
        for (const a of aktionenFuerModul(m)) {
          const k = key(m, a);
          if (alle) next.add(k);
          else next.delete(k);
        }
      }
      return next;
    });
  }

  function setzeAlle(alle: boolean) {
    // Bei typgebundener Matrix ("mitarbeiter"/"verwaltung") wirken
    // "Alle setzen/entfernen" nur auf die sichtbare Sektion. Permissions
    // der anderen Sektion (z.B. aus Edit-Page mit gemischten Daten)
    // bleiben unberuehrt.
    const wirkBereich =
      bereich === "mitarbeiter"
        ? MITARBEITER_MODULE
        : bereich === "verwaltung"
          ? VERWALTUNG_MODULE
          : MODULE;
    setAktiveKeys((prev) => {
      const next = new Set(prev);
      for (const m of wirkBereich) {
        for (const a of aktionenFuerModul(m)) {
          const k = key(m, a);
          if (alle) next.add(k);
          else next.delete(k);
        }
      }
      return next;
    });
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

  const sichtbareModule =
    bereich === "mitarbeiter"
      ? MITARBEITER_MODULE
      : bereich === "verwaltung"
        ? VERWALTUNG_MODULE
        : MODULE;
  const gesamtMoeglich = sichtbareModule.reduce(
    (sum, m) => sum + aktionenFuerModul(m).length,
    0,
  );

  return (
    <div className="space-y-6">
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
        {/* Vorlage nur fuer Verwaltungs-Rollen sinnvoll -- System-
            Mitarbeiter-Rolle hat keine geseedeten Permissions. */}
        {vorlageLaden && bereich !== "mitarbeiter" && (
          <>
            <span className="ml-auto text-[11px] text-muted-foreground">
              Vorlage:
            </span>
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

      {bereich !== "mitarbeiter" && (
        <BereichTabelle
          titel="Verwaltungs-Bereich"
          beschreibung="Sichtbarkeit der Tabs unter /admin/* und Schreib-Rechte. Default-Deny: nicht angekreuzt = unsichtbar."
          module={VERWALTUNG_MODULE}
          sichtbareAktionen={AKTIONEN}
          aktiveKeys={aktiveKeys}
          toggle={toggle}
          setzeZeile={setzeModulZeile}
          onAlleSetzen={() => setzeBereich(VERWALTUNG_MODULE, true)}
          onAlleEntfernen={() => setzeBereich(VERWALTUNG_MODULE, false)}
        />
      )}

      {bereich !== "verwaltung" && (
        <BereichTabelle
          titel="Mitarbeiter-Bereich"
          beschreibung={`Sichtbarkeit der Tabs in der Mitarbeiter-App (Mein Tag, Studio, Team, Verkauf, Lernen). Nur „Sehen“, weil interne Aktionen in der Mitarbeiter-App durch die DB-Policies geregelt sind.`}
          module={MITARBEITER_MODULE}
          sichtbareAktionen={["view"]}
          aktiveKeys={aktiveKeys}
          toggle={toggle}
          setzeZeile={setzeModulZeile}
          onAlleSetzen={() => setzeBereich(MITARBEITER_MODULE, true)}
          onAlleEntfernen={() => setzeBereich(MITARBEITER_MODULE, false)}
        />
      )}

      <p className="text-xs text-muted-foreground">
        {aktiveKeys.size} von {gesamtMoeglich} Permissions aktiv.
      </p>
    </div>
  );
}

function BereichTabelle({
  titel,
  beschreibung,
  module,
  sichtbareAktionen,
  aktiveKeys,
  toggle,
  setzeZeile,
  onAlleSetzen,
  onAlleEntfernen,
}: {
  titel: string;
  beschreibung: string;
  module: readonly Modul[];
  sichtbareAktionen: readonly Aktion[];
  aktiveKeys: Set<string>;
  toggle: (m: Modul, a: Aktion) => void;
  setzeZeile: (m: Modul, alle: boolean) => void;
  onAlleSetzen: () => void;
  onAlleEntfernen: () => void;
}) {
  function key(m: Modul, a: Aktion): string {
    return `${m}:${a}`;
  }

  const aktivInBereich = module.reduce((sum, m) => {
    return (
      sum +
      sichtbareAktionen.reduce(
        (s, a) => s + (aktiveKeys.has(key(m, a)) ? 1 : 0),
        0,
      )
    );
  }, 0);
  const moeglichInBereich = module.reduce(
    (sum, m) => sum + aktionenFuerModul(m).length,
    0,
  );

  return (
    <section className="space-y-2">
      <header className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-1.5">
        <div>
          <h3 className="text-[13px] font-semibold tracking-tight text-foreground">
            {titel}
          </h3>
          <p className="mt-0.5 max-w-xl text-[11px] text-muted-foreground">
            {beschreibung}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>
            {aktivInBereich}/{moeglichInBereich}
          </span>
          <button
            type="button"
            onClick={onAlleSetzen}
            className="rounded-md border border-border bg-background px-2 py-0.5 font-medium text-foreground transition-colors hover:bg-muted"
          >
            Alle
          </button>
          <button
            type="button"
            onClick={onAlleEntfernen}
            className="rounded-md border border-border bg-background px-2 py-0.5 font-medium text-foreground transition-colors hover:bg-muted"
          >
            Keine
          </button>
        </div>
      </header>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-background px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Modul
              </th>
              {sichtbareAktionen.map((a) => (
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
            {module.map((m, idx) => {
              const erlaubteAktionen = aktionenFuerModul(m);
              const zeileAlle = erlaubteAktionen.every((a) =>
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
                  {sichtbareAktionen.map((a) => {
                    const guelitg = (erlaubteAktionen as readonly Aktion[]).includes(a);
                    if (!guelitg) {
                      return (
                        <td key={a} className="px-3 py-2 text-center">
                          <span className="text-[10px] text-muted-foreground/50">—</span>
                        </td>
                      );
                    }
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
                      onClick={() => setzeZeile(m, !zeileAlle)}
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
    </section>
  );
}

