"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Vollflaechiger Loading-Overlay waehrend Server-Action laeuft.
 * Verhindert User-Doppel-Submits + zeigt klar an, dass etwas passiert.
 *
 * Wird als Sibling zu Form gerendert und reagiert auf pending-State.
 */
export function SubmitOverlay({
  pending,
  message = "Wird gespeichert …",
  className,
}: {
  pending: boolean;
  message?: string;
  className?: string;
}) {
  if (!pending) return null;
  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex items-center justify-center bg-background/70 backdrop-blur-sm",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-xl">
        <Loader2
          className="h-5 w-5 animate-spin text-[hsl(var(--primary))]"
          strokeWidth={2}
        />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
