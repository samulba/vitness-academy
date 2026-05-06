"use client";

import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";

const STORAGE_KEY = "vitness:admin-mobile-hint-dismissed";

/**
 * Dezente Info-Pille die auf Mobile-Breite (< lg) auf jeder Admin-Page
 * erscheint. Erklaert dass Mobile nur die Hauptfunktionen zeigt und
 * voller Verwaltungs-Zugriff am Laptop empfohlen ist.
 *
 * Dismiss persistiert in localStorage -- nach dem Schliessen einmalig
 * weg, kein Spam.
 */
export function MobileAdminBanner() {
  const [zeigeBanner, setZeigeBanner] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const dismissed = window.localStorage.getItem(STORAGE_KEY);
      if (!dismissed) setZeigeBanner(true);
    } catch {
      // localStorage kann blockiert sein (privates Tab) - dann zeigen
      setZeigeBanner(true);
    }
  }, []);

  function dismiss() {
    setZeigeBanner(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (!zeigeBanner) return null;

  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-[hsl(var(--brand-pink)/0.3)] bg-[hsl(var(--brand-pink)/0.06)] p-3.5 lg:hidden">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-pink)/0.15)] text-[hsl(var(--brand-pink))]">
        <Info className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
      <div className="flex-1">
        <p className="text-[13px] font-semibold leading-tight">
          Mobile zeigt nur die Hauptfunktionen
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          Für die volle Verwaltung (CRUD, Auswertungen, Bulk-Aktionen) öffne
          die App am Laptop.
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Hinweis ausblenden"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
