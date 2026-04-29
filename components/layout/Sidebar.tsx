"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  FileText,
  BookOpen,
  CheckSquare,
  Contact,
  GraduationCap,
  HelpCircle,
  Home,
  ListTodo,
  Megaphone,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { istAdmin, istFuehrungskraftOderHoeher, type Rolle } from "@/lib/rollen";
import { rolleLabel } from "@/lib/format";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { ThemeToggle } from "@/components/ThemeToggle";

type NavEintrag = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  rollen?: Rolle[];
  bald?: boolean;
};

const LERNEN_NAV: NavEintrag[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/lernpfade", label: "Lernpfade", icon: GraduationCap },
  { href: "/praxisfreigaben", label: "Praxisfreigaben", icon: CheckSquare },
];

const STUDIO_NAV: NavEintrag[] = [
  { href: "/aufgaben", label: "Aufgaben", icon: ListTodo },
  { href: "/wissen", label: "Handbuch", icon: BookOpen },
  { href: "/kontakte", label: "Kontakte", icon: Contact },
  { href: "/infos", label: "Wichtige Infos", icon: Megaphone },
  { href: "/maengel", label: "Mängel melden", icon: AlertTriangle },
  { href: "/formulare", label: "Formulare", icon: FileText },
];

const ADMIN_NAV: NavEintrag[] = [
  { href: "/admin", label: "Übersicht", icon: ShieldCheck },
  { href: "/admin/benutzer", label: "Benutzer", icon: Users },
  { href: "/admin/lernpfade", label: "Lernpfade", icon: GraduationCap },
  { href: "/admin/quizze", label: "Quizze", icon: HelpCircle },
  { href: "/admin/praxisaufgaben", label: "Praxisaufgaben", icon: CheckSquare },
  { href: "/admin/praxisfreigaben", label: "Anfragen", icon: CheckSquare },
  { href: "/admin/wissen", label: "Handbuch", icon: BookOpen },
  { href: "/admin/kontakte", label: "Kontakte", icon: Contact },
  { href: "/admin/infos", label: "Infos", icon: Megaphone },
  { href: "/admin/aufgaben", label: "Aufgaben", icon: ListTodo },
  { href: "/admin/maengel", label: "Mängel", icon: AlertTriangle },
  { href: "/admin/formulare", label: "Formulare", icon: FileText },
  { href: "/admin/fortschritt", label: "Fortschritt", icon: Activity },
];

function initialen(name: string | null): string {
  if (!name) return "VA";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Sidebar({
  rolle,
  fullName,
}: {
  rolle: Rolle;
  fullName?: string | null;
}) {
  const pathname = usePathname();
  const showAdmin = istFuehrungskraftOderHoeher(rolle);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-background lg:flex lg:flex-col">
      <div className="sticky top-0 flex h-screen flex-col">
        {/* Branding oben */}
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--brand-lime))] text-sm font-bold text-[hsl(var(--brand-ink))]">
            VA
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Vitness Academy
          </span>
        </div>

        {/* Search-Trigger */}
        <div className="px-3 pt-4">
          <SearchTrigger />
        </div>

        {/* Nav-Gruppen scrollbar */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 text-sm">
          <NavGruppe label="Lernen" eintraege={LERNEN_NAV} pathname={pathname} />
          <NavGruppe
            label="Studio"
            eintraege={STUDIO_NAV}
            pathname={pathname}
            className="mt-7"
          />
          {showAdmin && (
            <NavGruppe
              label={istAdmin(rolle) ? "Verwaltung" : "Team"}
              eintraege={ADMIN_NAV}
              pathname={pathname}
              className="mt-7"
            />
          )}
        </nav>

        {/* Theme-Toggle */}
        <div className="border-t border-border px-3 py-2">
          <ThemeToggle variant="row" />
        </div>

        {/* Profil-Footer */}
        <Link
          href="/einstellungen"
          className="group flex items-center gap-3 border-t border-border px-4 py-4 transition-colors hover:bg-muted"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-sm font-semibold text-[hsl(var(--primary-foreground))]">
            {initialen(fullName ?? null)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {fullName ?? "—"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {rolleLabel(rolle)}
            </p>
          </div>
          <Settings
            className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground"
            strokeWidth={1.75}
          />
        </Link>
      </div>
    </aside>
  );
}

function NavGruppe({
  label,
  eintraege,
  pathname,
  className,
}: {
  label: string;
  eintraege: NavEintrag[];
  pathname: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <ul className="space-y-0.5">
        {eintraege.map((e) => (
          <li key={e.href}>
            <NavLink eintrag={e} pathname={pathname} />
          </li>
        ))}
      </ul>
    </div>
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
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground/60"
        title="Bald verfügbar"
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
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
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
        aktiv
          ? "bg-[hsl(var(--primary)/0.08)] font-semibold text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {/* Magenta-Bar links als Aktiv-Indikator */}
      {aktiv && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[hsl(var(--primary))]"
        />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          aktiv
            ? "text-[hsl(var(--primary))]"
            : "text-muted-foreground group-hover:text-foreground",
        )}
        strokeWidth={1.75}
      />
      <span>{eintrag.label}</span>
    </Link>
  );
}
