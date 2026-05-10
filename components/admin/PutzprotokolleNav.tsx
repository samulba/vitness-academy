"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  {
    href: "/admin/putzprotokolle",
    label: "Übersicht",
    icon: ClipboardList,
    /** Aktiv wenn pathname genau /admin/putzprotokolle ist ODER ein
     *  Detail-Eintrag /admin/putzprotokolle/[uuid] (nicht /auswertung
     *  oder /templates). */
    matcher: (p: string) =>
      p === "/admin/putzprotokolle" ||
      (p.startsWith("/admin/putzprotokolle/") &&
        !p.startsWith("/admin/putzprotokolle/auswertung") &&
        !p.startsWith("/admin/putzprotokolle/templates")),
  },
  {
    href: "/admin/putzprotokolle/auswertung",
    label: "Auswertung",
    icon: BarChart3,
    matcher: (p: string) => p.startsWith("/admin/putzprotokolle/auswertung"),
  },
  {
    href: "/admin/putzprotokolle/templates",
    label: "Templates",
    icon: Sparkles,
    matcher: (p: string) => p.startsWith("/admin/putzprotokolle/templates"),
  },
] as const;

/**
 * Tab-Nav für den Putzprotokoll-Admin-Bereich. Drei Sub-Routes:
 * Übersicht (Liste der Tage) · Auswertung (Charts) · Templates (Editor).
 * Underline-Style: aktiver Tab bekommt Magenta-Border am unteren Rand,
 * dezenter als der vorherige gefuellte Pill-Container — fuegt sich
 * besser in den Page-Flow ein.
 */
export function PutzprotokolleNav() {
  const pathname = usePathname();
  return (
    <nav className="-mx-1 flex gap-0.5 overflow-x-auto border-b border-border">
      {TABS.map((t) => {
        const Icon = t.icon;
        const aktiv = t.matcher(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors",
              aktiv
                ? "text-[hsl(var(--primary))]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {t.label}
            {aktiv && (
              <span
                aria-hidden
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[hsl(var(--primary))]"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
