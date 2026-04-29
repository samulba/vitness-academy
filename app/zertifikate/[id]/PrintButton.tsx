"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:scale-[1.02]"
    >
      <Printer className="h-4 w-4" />
      Drucken oder als PDF speichern
    </button>
  );
}
