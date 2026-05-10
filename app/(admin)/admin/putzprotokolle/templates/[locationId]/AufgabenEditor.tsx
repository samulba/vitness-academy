"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Editor für eine Liste von Aufgaben innerhalb eines Putzprotokoll-
 * Bereichs. Ersetzt das alte Textarea mit "eine pro Zeile"-Hint durch
 * einzelne Input-Felder + Add/Remove-Buttons.
 *
 * Server-Action bekommt die Aufgaben weiter via hidden <textarea
 * name="aufgaben"> als \n-joined String — Action-Code bleibt
 * unveraendert.
 */
export function AufgabenEditor({ defaultValue }: { defaultValue: string[] }) {
  const initial = defaultValue.length > 0 ? defaultValue : [""];
  const [aufgaben, setAufgaben] = useState<string[]>(initial);

  function update(i: number, v: string) {
    setAufgaben((prev) => prev.map((a, idx) => (idx === i ? v : a)));
  }

  function add() {
    setAufgaben((prev) => [...prev, ""]);
  }

  function remove(i: number) {
    setAufgaben((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      return next.length === 0 ? [""] : next;
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>, i: number) {
    // Enter im letzten Feld → neues Feld + Fokus drauf
    if (e.key === "Enter" && i === aufgaben.length - 1) {
      e.preventDefault();
      add();
      // Fokus wird im nächsten Tick auf das neue Input gesetzt via
      // autoFocus auf dem neuen Element — siehe input prop unten.
      setTimeout(() => {
        const inputs = document.querySelectorAll<HTMLInputElement>(
          `[data-aufgaben-input="${i + 1}"]`,
        );
        inputs[0]?.focus();
      }, 0);
    }
  }

  // Hidden-Field für Server-Action: \n-joined, leere Strings raus.
  const aufgabenJoined = aufgaben
    .map((a) => a.trim())
    .filter((a) => a.length > 0)
    .join("\n");
  const anzahl = aufgaben.filter((a) => a.trim()).length;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Aufgaben
        </span>
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {anzahl} {anzahl === 1 ? "Aufgabe" : "Aufgaben"}
        </span>
      </div>

      <ul className="mt-2 space-y-1.5">
        {aufgaben.map((a, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold tabular-nums text-muted-foreground">
              {i + 1}
            </span>
            <Input
              data-aufgaben-input={i}
              value={a}
              onChange={(e) => update(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              placeholder="z.B. Boden staubsaugen"
              className="h-9 min-w-0 flex-1 rounded-lg"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Aufgabe ${i + 1} entfernen`}
              disabled={aufgaben.length === 1 && !a.trim()}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[hsl(var(--destructive)/0.08)] hover:text-[hsl(var(--destructive))] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={add}
        className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-background/40 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.04)] hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Aufgabe hinzufügen
      </button>

      {/* Hidden — Server-Action liest "aufgaben" als \n-joined String */}
      <textarea
        name="aufgaben"
        value={aufgabenJoined}
        readOnly
        hidden
        aria-hidden
      />
    </div>
  );
}
