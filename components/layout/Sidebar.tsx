"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  GraduationCap,
  CheckSquare,
  BookOpen,
  ShieldCheck,
  Users,
  Activity,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { istAdmin, istFuehrungskraftOderHoeher, type Rolle } from "@/lib/rollen";

type NavEintrag = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  rollen?: Rolle[];
  bald?: boolean;
};

const MITARBEITER_NAV: NavEintrag[] = [
  { href: "/dashboard", label: "Mein Dashboard", icon: Home },
  { href: "/lernpfade", label: "Meine Lernpfade", icon: GraduationCap },
  { href: "/praxisfreigaben", label: "Praxisfreigaben", icon: CheckSquare },
  { href: "/wissen", label: "Handbuch", icon: BookOpen },
];

const ADMIN_NAV: NavEintrag[] = [
  { href: "/admin", label: "Übersicht", icon: ShieldCheck },
  { href: "/admin/benutzer", label: "Benutzer", icon: Users },
  { href: "/admin/lernpfade", label: "Lernpfade", icon: GraduationCap },
  { href: "/admin/quizze", label: "Quizze", icon: HelpCircle },
  { href: "/admin/praxisaufgaben", label: "Praxisaufgaben", icon: CheckSquare },
  { href: "/admin/praxisfreigaben", label: "Anfragen", icon: CheckSquare },
  { href: "/admin/wissen", label: "Handbuch", icon: BookOpen },
  { href: "/admin/fortschritt", label: "Fortschritt", icon: Activity },
];

export function Sidebar({ rolle }: { rolle: Rolle }) {
  const pathname = usePathname();
  const showAdmin = istFuehrungskraftOderHoeher(rolle);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-background lg:block">
      <nav className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col gap-1 overflow-y-auto p-4 text-sm">
        <div className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Lernen
        </div>
        {MITARBEITER_NAV.map((eintrag) => (
          <NavLink key={eintrag.href} eintrag={eintrag} pathname={pathname} />
        ))}

        {showAdmin ? (
          <>
            <div className="mt-6 px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {istAdmin(rolle) ? "Verwaltung" : "Team"}
            </div>
            {ADMIN_NAV.map((eintrag) => (
              <NavLink key={eintrag.href} eintrag={eintrag} pathname={pathname} />
            ))}
          </>
        ) : null}
      </nav>
    </aside>
  );
}

function NavLink({
  eintrag,
  pathname,
}: {
  eintrag: NavEintrag;
  pathname: string;
}) {
  const Icon = eintrag.icon;
  const aktiv =
    pathname === eintrag.href ||
    (eintrag.href !== "/" && pathname.startsWith(`${eintrag.href}/`));

  if (eintrag.bald) {
    return (
      <span
        className="flex items-center gap-2 rounded-md px-2 py-2 text-muted-foreground/70"
        title="Bald verfügbar"
      >
        <Icon className="h-4 w-4" />
        <span>{eintrag.label}</span>
        <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          bald
        </span>
      </span>
    );
  }

  return (
    <Link
      href={eintrag.href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
        aktiv
          ? "bg-foreground text-background font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          aktiv
            ? "text-[hsl(var(--brand-lime))]"
            : "text-muted-foreground group-hover:text-foreground",
        )}
        strokeWidth={1.75}
      />
      <span>{eintrag.label}</span>
    </Link>
  );
}
