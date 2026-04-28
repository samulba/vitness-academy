"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ListOrdered,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortierenContent } from "@/lib/lektion";

function deterministischMischen<T>(arr: T[]): T[] {
  // Reverse + Rotate als deterministisches "Mischen" — keine Hydration-Probleme,
  // nach dem Mount wird via useEffect echt zufaellig gemischt.
  const out = arr.slice().reverse();
  if (out.length > 2) {
    const head = out.shift()!;
    out.push(head);
  }
  return out;
}

function zufaelligMischen<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  // Falls die Zufalls-Reihenfolge zufaellig die korrekte ergibt, wenden.
  return out;
}

export function SortierAufgabe({ content }: { content: SortierenContent }) {
  const [reihenfolge, setReihenfolge] = useState<string[]>(() =>
    deterministischMischen(content.schritte_korrekt),
  );
  const [geprueft, setGeprueft] = useState(false);

  useEffect(() => {
    // Nach Mount: echt zufaellig mischen, falls noch nicht interagiert wurde.
    setReihenfolge((alt) => {
      let neu = zufaelligMischen(alt);
      if (
        neu.every((s, i) => s === content.schritte_korrekt[i]) &&
        neu.length > 1
      ) {
        // Versehentlich korrekte Reihenfolge -> einfach drehen
        neu = neu.slice().reverse();
      }
      return neu;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function bewegen(i: number, richtung: "hoch" | "runter") {
    if (geprueft) return;
    setReihenfolge((alt) => {
      const neu = alt.slice();
      const ziel = richtung === "hoch" ? i - 1 : i + 1;
      if (ziel < 0 || ziel >= neu.length) return alt;
      [neu[i], neu[ziel]] = [neu[ziel], neu[i]];
      return neu;
    });
  }

  function pruefen() {
    setGeprueft(true);
  }

  function zuruecksetzen() {
    setReihenfolge(zufaelligMischen(content.schritte_korrekt));
    setGeprueft(false);
  }

  const allesRichtig =
    geprueft && reihenfolge.every((s, i) => s === content.schritte_korrekt[i]);

  return (
    <div className="rounded-2xl border-2 border-[hsl(var(--brand-coral)/0.3)] bg-[hsl(var(--brand-coral)/0.04)] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-coral)/0.15)] text-[hsl(var(--brand-coral))]">
          <ListOrdered className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--brand-coral))]">
            Sortier-Aufgabe
          </p>
          <p className="mt-1 text-base font-semibold text-foreground sm:text-lg">
            {content.aufgabe}
          </p>
        </div>
      </div>

      <ol className="mt-5 space-y-2">
        {reihenfolge.map((schritt, i) => {
          const istKorrektPosition =
            geprueft && schritt === content.schritte_korrekt[i];
          const istFalschPosition =
            geprueft && schritt !== content.schritte_korrekt[i];

          return (
            <li
              key={`${schritt}-${i}`}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 bg-background px-3 py-2.5 transition-all",
                !geprueft && "border-border",
                istKorrektPosition &&
                  "border-[hsl(var(--success))] bg-[hsl(var(--success)/0.08)]",
                istFalschPosition &&
                  "border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.06)]",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  istKorrektPosition
                    ? "bg-[hsl(var(--success))] text-white"
                    : istFalschPosition
                    ? "bg-[hsl(var(--destructive))] text-white"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </span>
              <span className="flex-1 text-sm sm:text-base">{schritt}</span>
              {!geprueft && (
                <span className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => bewegen(i, "hoch")}
                    disabled={i === 0}
                    aria-label="Nach oben"
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => bewegen(i, "runter")}
                    disabled={i === reihenfolge.length - 1}
                    aria-label="Nach unten"
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-5 flex items-center gap-3">
        {!geprueft ? (
          <button
            type="button"
            onClick={pruefen}
            className="rounded-full bg-[hsl(var(--primary))] px-5 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-all hover:bg-[hsl(var(--primary)/0.9)]"
          >
            Reihenfolge prüfen
          </button>
        ) : (
          <>
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold",
                allesRichtig
                  ? "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"
                  : "bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))]",
              )}
            >
              {allesRichtig ? (
                <>
                  <Check className="h-4 w-4" /> Perfekt sortiert!
                </>
              ) : (
                <>
                  <X className="h-4 w-4" /> Nicht ganz, versuch&apos;s nochmal
                </>
              )}
            </span>
            <button
              type="button"
              onClick={zuruecksetzen}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Neu mischen
            </button>
          </>
        )}
      </div>
    </div>
  );
}
