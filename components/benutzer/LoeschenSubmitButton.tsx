"use client";

import { Trash2 } from "lucide-react";

/**
 * Submit-Button mit Browser-Confirm vor dem Endgueltig-Loeschen.
 * Eigene Component weil onClick + native confirm() nur in Client-
 * Components erlaubt sind.
 */
export function LoeschenSubmitButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (
          !window.confirm(
            "Mitarbeiter komplett löschen? Das ist nicht rückgängig zu machen.\n\nNur möglich solange er sich nie eingeloggt hat.",
          )
        ) {
          e.preventDefault();
        }
      }}
      className="inline-flex h-10 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[hsl(var(--destructive)/0.4)] bg-background px-4 text-sm font-semibold text-[hsl(var(--destructive))] transition-all hover:bg-[hsl(var(--destructive)/0.08)] active:scale-95 sm:w-auto"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Löschen
    </button>
  );
}
