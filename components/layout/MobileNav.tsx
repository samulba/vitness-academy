"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  ClipboardList,
  Clock,
  FileText,
  Home,
  Inbox,
  ListTodo,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { istFuehrungskraftOderHoeher, type Rolle } from "@/lib/rollen";
import { hatModulZugriff, type Modul } from "@/lib/permissions";
import { MobileHubSheet } from "./MobileHubSheet";

type MobileLink = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Wenn true, gilt der Eintrag NUR bei exakt passendem pathname als
   *  aktiv -- sonst wuerde z.B. "Übersicht" /admin auch bei
   *  /admin/benutzer aktiv erscheinen. */
  exact?: boolean;
  /** Permission-Modul. Leer = immer sichtbar. */
  modul?: Modul;
};

// Mitarbeiter: 4 daily-use Tabs + Center-FAB zum Hub-Sheet.
// Pro Eintrag das Permission-Modul ("mitarbeiter-..."). Custom-Rollen
// filtern strikt; Standard-Rollen sehen alle (permissive default in
// getCurrentProfile).
const MITARBEITER_LINKS_ALLE: MobileLink[] = [
  { href: "/dashboard", label: "Mein Tag", icon: Home, modul: "mitarbeiter-dashboard" },
  { href: "/aufgaben", label: "Aufgaben", icon: ListTodo, modul: "mitarbeiter-aufgaben" },
  { href: "/lohn", label: "Schichten", icon: Clock, modul: "mitarbeiter-lohn" },
  { href: "/formulare", label: "Anfragen", icon: FileText, modul: "mitarbeiter-formulare" },
];

// Verwaltungs-Modus: 4 Operations-Tabs + Center-FAB zum Admin-Hub.
// Alle 4 sind Inbox-/Daily-Use-Bereiche — Team/Auswertung kommen über
// den Hub-Sheet, sind sekundaer. Pro Eintrag das Permission-Modul.
const VERWALTUNG_LINKS_ALLE: MobileLink[] = [
  { href: "/admin", label: "Übersicht", icon: ShieldCheck, exact: true },
  { href: "/admin/formulare/eingaenge", label: "Eingänge", icon: Inbox, modul: "formulare" },
  { href: "/admin/maengel", label: "Mängel", icon: AlertTriangle, modul: "maengel" },
  { href: "/admin/aufgaben", label: "Aufgaben", icon: ClipboardList, modul: "aufgaben" },
];

export function MobileNav({
  rolle,
  kannProvisionen = false,
  permissions = [],
}: {
  rolle: Rolle;
  kannProvisionen?: boolean;
  permissions?: readonly string[];
}) {
  const pathname = usePathname();
  const [hubOffen, setHubOffen] = useState(false);
  const zeigeAdmin = istFuehrungskraftOderHoeher(rolle);
  const adminMode = pathname === "/admin" || pathname.startsWith("/admin/");
  const permsSet = new Set(permissions);
  let verwaltungAktiv = false;
  let mitarbeiterAktiv = false;
  for (const p of permsSet) {
    if (p.startsWith("mitarbeiter-")) mitarbeiterAktiv = true;
    else verwaltungAktiv = true;
    if (verwaltungAktiv && mitarbeiterAktiv) break;
  }

  // Tabs auf Permissions filtern. Wenn Bereich inaktiv (Migrations-Lag
  // oder leer), zeige alle Tabs (alte Logik). Wir behalten immer 4 Tabs
  // -- wenn ein Tab gefiltert wuerde, fallen wir auf den ersten
  // Eintrag als Platzhalter zurueck, damit das Grid stabil bleibt.
  // Echte Filterung passiert im Hub-Sheet.
  const verwaltungLinks: MobileLink[] = verwaltungAktiv
    ? VERWALTUNG_LINKS_ALLE.map((l) =>
        !l.modul || hatModulZugriff(permsSet, l.modul)
          ? l
          : VERWALTUNG_LINKS_ALLE[0],
      )
    : VERWALTUNG_LINKS_ALLE;

  const mitarbeiterLinks: MobileLink[] = mitarbeiterAktiv
    ? MITARBEITER_LINKS_ALLE.map((l) =>
        !l.modul || hatModulZugriff(permsSet, l.modul)
          ? l
          : MITARBEITER_LINKS_ALLE[0],
      )
    : MITARBEITER_LINKS_ALLE;

  const links = zeigeAdmin && adminMode ? verwaltungLinks : mitarbeiterLinks;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom,0)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 items-end">
          {/* Tab 1 + 2 */}
          <NavItem link={links[0]} pathname={pathname} />
          <NavItem link={links[1]} pathname={pathname} />

          {/* Center-FAB (Slot 3) */}
          <div className="relative flex justify-center">
            <button
              type="button"
              onClick={() => setHubOffen(true)}
              aria-label="Alle Bereiche öffnen"
              className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.55)] ring-4 ring-background transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-6 w-6" strokeWidth={2.25} />
            </button>
          </div>

          {/* Tab 4 + 5 */}
          <NavItem link={links[2]} pathname={pathname} />
          <NavItem link={links[3]} pathname={pathname} />
        </div>
      </nav>

      <MobileHubSheet
        offen={hubOffen}
        onClose={() => setHubOffen(false)}
        rolle={rolle}
        kannProvisionen={kannProvisionen}
        permissions={permissions}
        adminMode={zeigeAdmin && adminMode}
      />
    </>
  );
}

function NavItem({
  link,
  pathname,
}: {
  link: MobileLink;
  pathname: string;
}) {
  const { href, label, icon: Icon, exact } = link;
  const aktiv =
    pathname === href ||
    (!exact && href !== "/" && pathname.startsWith(`${href}/`));
  return (
    <Link
      href={href}
      className={cn(
        "relative flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors",
        aktiv
          ? "text-[hsl(var(--primary))]"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {aktiv && (
        <span
          aria-hidden
          className="absolute left-1/2 top-0 h-[2px] w-8 -translate-x-1/2 rounded-b-full bg-[hsl(var(--primary))]"
        />
      )}
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </Link>
  );
}
