"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommissionRate } from "@/lib/provisionen-types";
import { AbschlussForm } from "./AbschlussForm";

/**
 * Toggle + Sheet fuer "Neuer Abschluss".
 *
 * Rendert standardmaessig nur einen prominenten CTA-Button. Klick
 * oeffnet ein Sheet:
 *  - Mobile (< sm): Full-Screen-Bottom-Sheet mit Backdrop, slide-up.
 *  - Desktop:        Centered Modal mit Backdrop.
 * Nach erfolgreichem Submit schliesst sich das Sheet automatisch.
 *
 * Verdraengt das frueher direkt in die Page eingebettete Formular --
 * /provisionen zeigt jetzt erstmal das Dashboard, das Eintragen wird
 * bewusst per Button getriggert.
 */
export function AbschlussSheet({ rates }: { rates: CommissionRate[] }) {
  const [offen, setOffen] = useState(false);

  // ESC schliesst Sheet
  useEffect(() => {
    if (!offen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOffen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [offen]);

  // Body-Scroll-Lock waehrend Sheet offen
  useEffect(() => {
    if (!offen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [offen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOffen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-all hover:bg-[hsl(var(--primary)/0.9)] hover:shadow-md"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Neuer Abschluss
      </button>

      {/* Backdrop */}
      <button
        type="button"
        onClick={() => setOffen(false)}
        aria-hidden={!offen}
        tabIndex={-1}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity",
          offen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Sheet: Mobile = bottom-sheet, Desktop = centered modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Neuer Abschluss"
        className={cn(
          "fixed z-50 flex flex-col border border-border bg-card shadow-2xl transition-transform duration-300",
          // Mobile bottom-sheet
          "bottom-0 left-0 right-0 max-h-[92vh] rounded-t-3xl",
          // Desktop centered modal
          "sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:max-h-[88vh] sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl",
          offen
            ? "translate-y-0 sm:opacity-100"
            : "translate-y-full sm:translate-y-[-40%] sm:opacity-0",
        )}
      >
        {/* Header mit Drag-Handle (Mobile) + Close */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/95 px-5 py-3 backdrop-blur sm:px-6 sm:py-4">
          <span
            aria-hidden
            className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-border sm:hidden"
          />
          <div className="mt-1.5 sm:mt-0">
            <h2 className="text-base font-semibold tracking-tight">
              Neuer Abschluss
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Provision wird live in der Vorschau berechnet.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOffen(false)}
            aria-label="Schließen"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <AbschlussForm rates={rates} onSuccess={() => setOffen(false)} />
        </div>
      </div>
    </>
  );
}
