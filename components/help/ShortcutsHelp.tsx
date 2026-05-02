"use client";

import { useEffect, useState } from "react";
import { Keyboard, X } from "lucide-react";

type Shortcut = { keys: string[]; description: string };

const SHORTCUTS: { gruppe: string; eintraege: Shortcut[] }[] = [
  {
    gruppe: "Allgemein",
    eintraege: [
      { keys: ["?"], description: "Diese Hilfe öffnen / schließen" },
      { keys: ["Esc"], description: "Dialog / Menü schließen" },
    ],
  },
  {
    gruppe: "Suche",
    eintraege: [
      { keys: ["Cmd / Ctrl", "K"], description: "Globale Suche öffnen" },
      { keys: ["↑", "↓"], description: "Treffer wechseln" },
      { keys: ["Enter"], description: "Treffer öffnen" },
    ],
  },
  {
    gruppe: "Navigation",
    eintraege: [
      { keys: ["Tab"], description: 'Skip-Link „Zum Hauptinhalt"' },
    ],
  },
];

function istEingabe(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function ShortcutsHelp() {
  const [offen, setOffen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && offen) {
        setOffen(false);
        return;
      }
      if (e.key === "?" && !istEingabe(e.target)) {
        e.preventDefault();
        setOffen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [offen]);

  if (!offen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
      onClick={() => setOffen(false)}
    >
      <div
        role="dialog"
        aria-label="Tastenkürzel"
        className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-[hsl(var(--brand-pink))]" />
            <h2 className="text-[14px] font-semibold tracking-tight">
              Tastenkürzel
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOffen(false)}
            className="-mr-2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-5 px-5 py-4">
          {SHORTCUTS.map((g) => (
            <section key={g.gruppe}>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {g.gruppe}
              </h3>
              <ul className="mt-2 space-y-1.5">
                {g.eintraege.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-foreground">{s.description}</span>
                    <span className="flex items-center gap-1">
                      {s.keys.map((k, j) => (
                        <kbd
                          key={j}
                          className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-border bg-muted px-1.5 text-[11px] font-medium text-foreground"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
          Mit{" "}
          <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-muted px-1.5 text-[10px] font-medium">
            ?
          </kbd>{" "}
          jederzeit wieder öffnen.
        </div>
      </div>
    </div>
  );
}
