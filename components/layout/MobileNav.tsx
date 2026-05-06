"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BookOpen,
  FileText,
  GraduationCap,
  Home,
  ListTodo,
  Megaphone,
  ShieldCheck,
  Sparkles,
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

// Verwaltungs-Modus: 4 Top-Level-Bereiche (Auswertung weggelassen — am
// Laptop sinnvoller). Switch-zur-App ist visuell separater 5. Eintrag.
const VERWALTUNG_LINKS: MobileLink[] = [
  { href: "/admin", label: "Übersicht", icon: ShieldCheck, exact: true },
  { href: "/admin/lernpfade", label: "Inhalte", icon: Sparkles },
  { href: "/admin/benutzer", label: "Team", icon: Users },
  { href: "/admin/aufgaben", label: "Studio", icon: Megaphone },
];

export function MobileNav({ rolle }: { rolle: Rolle }) {
  const pathname = usePathname();
  const zeigeAdmin = istFuehrungskraftOderHoeher(rolle);
  const adminMode = pathname === "/admin" || pathname.startsWith("/admin/");

  if (zeigeAdmin && adminMode) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-card/95 backdrop-blur lg:hidden">
        {VERWALTUNG_LINKS.map((link) => (
          <NavItem key={link.href + link.label} link={link} pathname={pathname} />
        ))}
        {/* Mode-Switch optisch abgesetzt: vertikaler Border, Magenta-Tint */}
        <Link
          href="/dashboard"
          className="relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 border-l border-border py-2 text-[11px] font-medium text-[hsl(var(--primary))] transition-colors hover:bg-muted/50"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.4)]">
            <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
          <span>Zur App</span>
        </Link>
      </nav>
    );
  }

  // Mitarbeiter-Modus
  const links: MobileLink[] = [
    ...MITARBEITER_LINKS,
    zeigeAdmin
      ? { href: "/admin", label: "Verwaltung", icon: ShieldCheck, exact: true }
      : { href: "/wissen", label: "Handbuch", icon: BookOpen },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-card/95 backdrop-blur lg:hidden">
      {links.map((link, i) => {
        const istSwitch = zeigeAdmin && i === links.length - 1;
        if (istSwitch) {
          return (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 border-l border-border py-2 text-[11px] font-medium text-[hsl(var(--primary))] transition-colors hover:bg-muted/50"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.4)]">
                <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <span>{link.label}</span>
            </Link>
          );
        }
        return <NavItem key={link.href + link.label} link={link} pathname={pathname} />;
      })}
    </nav>
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
        "relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors",
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
