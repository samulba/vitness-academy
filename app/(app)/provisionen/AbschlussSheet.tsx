"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommissionRate } from "@/lib/provisionen-types";
import { AbschlussForm } from "./AbschlussForm";

/**
 * Toggle + Sheet fuer "Neuer Abschluss".
 *
 * Rendert standardmaessig nur einen prominenten CTA-Button. Klick
 * oeffnet ein Sheet:
 *  - Mobile (< sm): Bottom-Sheet, slide-up, swipe-down to dismiss.
 *  - Desktop:        Centered Modal mit Backdrop.
 * Nach erfolgreichem Submit schliesst sich das Sheet automatisch.
 */
export function AbschlussSheet({ rates }: { rates: CommissionRate[] }) {
  const [offen, setOffen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef<number | null>(null);

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

  // Drag-Reset wenn von aussen geschlossen
  useEffect(() => {
    if (!offen) {
      setDragOffset(0);
      setIsDragging(false);
      dragStartY.current = null;
    }
  }, [offen]);

  // Swipe-to-dismiss am Drag-Handle / Header. Threshold 90px.
  function handleTouchStart(e: React.TouchEvent) {
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (dragStartY.current == null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    setDragOffset(Math.max(0, delta));
  }
  function handleTouchEnd() {
    if (dragStartY.current == null) return;
    const wirdGeschlossen = dragOffset > 90;
    setIsDragging(false);
    setDragOffset(0);
    dragStartY.current = null;
    if (wirdGeschlossen) setOffen(false);
  }

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

      {/* Sheet: Mobile = bottom-sheet, Desktop = centered modal.
          w-screen + overflow-hidden auf dem Sheet selbst verhindert,
          dass intrinsic-width von Date-Inputs / Selects auf iOS das
          Layout horizontal sprengt. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Neuer Abschluss"
        style={{
          transform:
            offen && dragOffset > 0
              ? `translateY(${dragOffset}px)`
              : undefined,
          transition: isDragging ? "none" : undefined,
        }}
        className={cn(
          "fixed z-50 flex w-screen max-w-full flex-col overflow-hidden border border-border bg-card shadow-2xl transition-transform duration-300",
          // Mobile bottom-sheet
          "bottom-0 left-0 right-0 max-h-[92vh] rounded-t-3xl",
          // Desktop centered modal
          "sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-full sm:max-h-[88vh] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl",
          offen
            ? "translate-y-0 sm:opacity-100"
            : "translate-y-full sm:translate-y-[-40%] sm:opacity-0",
        )}
      >
        {/* Header. Touch-Events nur hier, sonst wuerde jedes Antippen
            der Form-Felder das Sheet zudruecken. */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="relative flex shrink-0 touch-none items-start justify-between gap-3 border-b border-border bg-card px-5 pb-3 pt-5 sm:px-6 sm:pt-4"
        >
          <span
            aria-hidden
            className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-border sm:hidden"
          />
          <div className="min-w-0">
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

        {/* Scroll-Bereich. overflow-x-hidden + min-w-0 verhindert
            horizontalen Scroll-Bug auf iOS. */}
        <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-5 pb-6 pt-5 sm:px-6 sm:pt-6">
          <AbschlussForm rates={rates} onSuccess={() => setOffen(false)} />
        </div>
      </div>
    </>
  );
}
