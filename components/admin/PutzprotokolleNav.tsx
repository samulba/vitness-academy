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
 * Tab-Nav fuer den Putzprotokoll-Admin-Bereich. Drei Sub-Routes:
 * Übersicht (Liste der Tage) · Auswertung (Charts) · Templates (Editor).
 * Aktiver Tab wird Magenta-tinted.
 */
export function PutzprotokolleNav() {
  const pathname = usePathname();
  return (
    <nav className="inline-flex gap-1 rounded-full border border-border bg-muted/40 p-1">
      {TABS.map((t) => {
        const Icon = t.icon;
        const aktiv = t.matcher(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              aktiv
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.4)]"
                : "text-muted-foreground hover:bg-background hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
