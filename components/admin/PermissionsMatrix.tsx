"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AKTIONEN,
  AKTION_LABELS,
  MODULE,
  MODUL_LABELS,
  type Aktion,
  type Modul,
} from "@/lib/permissions";

type Props = {
  roleId: string;
  initial: { modul: Modul; aktion: Aktion }[];
  speichern: (roleId: string, formData: FormData) => Promise<void>;
  readOnly?: boolean;
};

function key(modul: Modul, aktion: Aktion): string {
  return `${modul}:${aktion}`;
}

export function PermissionsMatrix({
  roleId,
  initial,
  speichern,
  readOnly,
}: Props) {
  const initialSet = new Set(initial.map((p) => key(p.modul, p.aktion)));
  const [granted, setGranted] = useState<Set<string>>(initialSet);

  function toggle(modul: Modul, aktion: Aktion) {
    if (readOnly) return;
    const k = key(modul, aktion);
    const next = new Set(granted);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setGranted(next);
  }

  function setRowAll(modul: Modul, an: boolean) {
    if (readOnly) return;
    const next = new Set(granted);
    for (const a of AKTIONEN) {
      const k = key(modul, a);
      if (an) next.add(k);
      else next.delete(k);
    }
    setGranted(next);
  }

  function alleAn() {
    if (readOnly) return;
    const next = new Set<string>();
    for (const m of MODULE) {
      for (const a of AKTIONEN) {
        next.add(key(m, a));
      }
    }
    setGranted(next);
  }

  function alleAus() {
    if (readOnly) return;
    setGranted(new Set());
  }

  const action = speichern.bind(null, roleId);

  return (
    <form action={action} className="space-y-4">
      {!readOnly && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={alleAn}>
            Alle erteilen
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={alleAus}>
            Alle entfernen
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="sticky left-0 z-10 bg-muted/40 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Modul
                </th>
                {AKTIONEN.map((a) => (
                  <th
                    key={a}
                    className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {AKTION_LABELS[a]}
                  </th>
                ))}
                {!readOnly && (
                  <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Zeile
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MODULE.map((m) => {
                const rowCount = AKTIONEN.filter((a) =>
                  granted.has(key(m, a)),
                ).length;
                const allOn = rowCount === AKTIONEN.length;
                return (
                  <tr key={m} className="hover:bg-muted/30">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5">
                      <span className="text-[13px] font-medium text-foreground">
                        {MODUL_LABELS[m]}
                      </span>
                    </td>
                    {AKTIONEN.map((a) => {
                      const k = key(m, a);
                      const checked = granted.has(k);
                      return (
                        <td key={a} className="px-3 py-2 text-center">
                          <label className="inline-flex cursor-pointer items-center justify-center">
                            <input
                              type="checkbox"
                              name={`p_${m}_${a}`}
                              checked={checked}
                              onChange={() => toggle(m, a)}
                              disabled={readOnly}
                              className="h-4 w-4 cursor-pointer rounded border-border text-[hsl(var(--primary))] accent-[hsl(var(--primary))] focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </label>
                        </td>
                      );
                    })}
                    {!readOnly && (
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setRowAll(m, !allOn)}
                          className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {allOn ? "alle aus" : "alle"}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            <Save />
            Berechtigungen speichern
          </Button>
        </div>
      )}
    </form>
  );
}
