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
  icon: React.ComponentType<{ className?: string }>;
  rollen?: Rolle[];
  bald?: boolean;
};

const MITARBEITER_NAV: NavEintrag[] = [
  { href: "/dashboard", label: "Mein Dashboard", icon: Home },
  { href: "/lernpfade", label: "Meine Lernpfade", icon: GraduationCap },
  { href: "/praxisfreigaben", label: "Praxisfreigaben", icon: CheckSquare },
  { href: "/wissen", label: "Wissensdatenbank", icon: BookOpen, bald: true },
];

const ADMIN_NAV: NavEintrag[] = [
  { href: "/admin", label: "Übersicht", icon: ShieldCheck },
  { href: "/admin/benutzer", label: "Benutzer", icon: Users },
  { href: "/admin/lernpfade", label: "Lernpfade", icon: GraduationCap },
  { href: "/admin/quizze", label: "Quizze", icon: HelpCircle },
  { href: "/admin/praxisfreigaben", label: "Praxisfreigaben", icon: CheckSquare },
  { href: "/admin/fortschritt", label: "Fortschritt", icon: Activity, bald: true },
];

export function Sidebar({ rolle }: { rolle: Rolle }) {
  const pathname = usePathname();
  const showAdmin = istFuehrungskraftOderHoeher(rolle);

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card lg:block">
      <nav className="flex h-full flex-col gap-1 p-3 text-sm">
        <div className="px-2 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Lernen
        </div>
        {MITARBEITER_NAV.map((eintrag) => (
          <NavLink key={eintrag.href} eintrag={eintrag} pathname={pathname} />
        ))}

        {showAdmin ? (
          <>
            <div className="mt-4 px-2 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
        "flex items-center gap-2 rounded-md px-2 py-2 transition-colors",
        aktiv
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{eintrag.label}</span>
    </Link>
  );
}
