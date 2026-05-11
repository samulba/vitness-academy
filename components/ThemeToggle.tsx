"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Mode = "light" | "dark";

type DocWithViewTransition = Document & {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> };
};

function applyTheme(mode: Mode) {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }
}

/**
 * Theme-Switch mit View-Transition-Cross-Fade. Verhindert das harte
 * "Springen" der Farben. Faellt sauber auf direkten Switch zurueck wenn
 * Browser View-Transitions nicht unterstuetzt oder User
 * prefers-reduced-motion gesetzt hat.
 */
function switchThemeAnimated(callback: () => void) {
  const doc = document as DocWithViewTransition;
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !doc.startViewTransition) {
    callback();
    return;
  }
  doc.startViewTransition(callback);
}

function readTheme(): Mode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("vitness-theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle({
  variant = "icon",
}: {
  /** "icon" = nur Icon, "row" = Icon + Label für Sidebar,
   *  "menuItem" = Icon + Label fuer DropdownMenu (kein Border) */
  variant?: "icon" | "row" | "menuItem";
}) {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    setMode(readTheme());
  }, []);

  function toggle() {
    const next: Mode = mode === "dark" ? "light" : "dark";
    switchThemeAnimated(() => {
      setMode(next);
      applyTheme(next);
      try {
        window.localStorage.setItem("vitness-theme", next);
      } catch {
        // ignore
      }
    });
  }

  // Vor Hydration: identische Render-Variante (kein Flash)
  const istDark = mode === "dark";
  const Icon = istDark ? Sun : Moon;
  const label = istDark ? "Heller Modus" : "Dunkler Modus";

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
        <span>{label}</span>
      </button>
    );
  }

  if (variant === "menuItem") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        className="flex w-full items-center gap-2 text-left"
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}
