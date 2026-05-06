"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  FileText,
  GraduationCap,
  Home,
  ListTodo,
  Megaphone,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { istFuehrungskraftOderHoeher, type Rolle } from "@/lib/rollen";

type MobileLink = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Wenn true, gilt der Eintrag NUR bei exakt passendem pathname als
   *  aktiv -- sonst wuerde z.B. "Uebersicht" /admin auch bei
   *  /admin/benutzer aktiv erscheinen. */
  exact?: boolean;
};

// Mitarbeiter-Modus: Daily-Use-Reihenfolge
const MITARBEITER_LINKS: MobileLink[] = [
  { href: "/dashboard", label: "Mein Tag", icon: Home },
  { href: "/aufgaben", label: "Aufgaben", icon: ListTodo },
  { href: "/formulare", label: "Anfragen", icon: FileText },
  { href: "/lernpfade", label: "Lernen", icon: GraduationCap },
];

// Verwaltungs-Modus: 4 Top-Level-Bereiche + Mode-Switch zurueck
const VERWALTUNG_LINKS: MobileLink[] = [
  { href: "/admin", label: "Übersicht", icon: ShieldCheck, exact: true },
  { href: "/admin/lernpfade", label: "Inhalte", icon: Sparkles },
  { href: "/admin/benutzer", label: "Mitarbeiter", icon: Users },
  { href: "/admin/aufgaben", label: "Studio", icon: Megaphone },
  { href: "/admin/fortschritt", label: "Auswertung", icon: Activity },
];

export function MobileNav({ rolle }: { rolle: Rolle }) {
  const pathname = usePathname();
  const zeigeAdmin = istFuehrungskraftOderHoeher(rolle);
  const adminMode = pathname === "/admin" || pathname.startsWith("/admin/");

  let links: MobileLink[];
  if (zeigeAdmin && adminMode) {
    // Im Verwaltungs-Modus: Admin-Top-Level + Switch-zurueck als 5.
    links = [
      ...VERWALTUNG_LINKS,
      { href: "/dashboard", label: "Mitarbeiter", icon: User },
    ];
  } else {
    // Mitarbeiter-Modus: Daily-Use + (fuer Admins) Switch-zur-Verwaltung.
    links = [
      ...MITARBEITER_LINKS,
      ...(zeigeAdmin
        ? [{ href: "/admin", label: "Verwaltung", icon: ShieldCheck, exact: true } satisfies MobileLink]
        : [
            {
              href: "/wissen",
              label: "Handbuch",
              icon: BookOpen,
            } satisfies MobileLink,
          ]),
    ];
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-card/95 backdrop-blur lg:hidden">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const aktiv =
          pathname === href ||
          (!exact && href !== "/" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href + label}
            href={href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
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
      })}
    </nav>
  );
}
