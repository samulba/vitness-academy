"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Vorschau-Button + Modal mit iframe der oeffentlichen Page.
 * Ersetzt den klassischen <Link target="_blank">-Pattern damit der
 * Admin im Verwaltungs-Kontext bleibt und nicht zwischen Tabs
 * springen muss.
 *
 * Render: passt visuell zur SecondaryButton-Optik aus PageHeader
 * (h-8 / quadratisch / rounded-md). Nutzt das `extras`-Slot in
 * PageHeader oder kann standalone gerendert werden.
 */
export function VorschauButton({
  url,
  label = "Vorschau",
  variant = "icon",
}: {
  url: string;
  label?: string;
  /** "icon" = quadratisch (PageHeader-Style); "row" = breiter Button mit Label */
  variant?: "icon" | "row";
}) {
  const [offen, setOffen] = useState(false);

  // Esc schliesst, Body-Scroll blockieren waehrend offen
  useEffect(() => {
    if (!offen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOffen(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [offen]);

  const trigger =
    variant === "icon" ? (
      <button
        type="button"
        onClick={() => setOffen(true)}
        aria-label={label}
        title={label}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition active:scale-[0.95] hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground"
      >
        <Eye className="size-3.5" />
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOffen(true)}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-[12px] font-medium text-foreground transition active:scale-[0.98] hover:border-[hsl(var(--brand-pink)/0.4)]"
      >
        <Eye className="h-3.5 w-3.5" />
        {label}
      </button>
    );

  return (
    <>
      {trigger}
      {offen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${label}: ${url}`}
          className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur"
          onClick={(e) => {
            // Klick auf den semi-transparenten Backdrop schliesst,
            // Klicks innerhalb des Modals nicht
            if (e.target === e.currentTarget) setOffen(false);
          }}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
                Vorschau
              </span>
              <span className="truncate font-mono text-[11px] text-muted-foreground">
                {url}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                In neuem Tab öffnen
              </Link>
              <button
                type="button"
                onClick={() => setOffen(false)}
                aria-label="Vorschau schließen"
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition",
                  "hover:bg-muted hover:text-foreground",
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* iframe */}
          <iframe
            src={url}
            title={`Vorschau ${url}`}
            className="flex-1 w-full border-0 bg-background"
          />
        </div>
      )}
    </>
  );
}
