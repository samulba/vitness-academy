"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckSquare,
  ChevronDown,
  Contact,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  ListTodo,
  MapPin,
  Megaphone,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  istAdmin,
  istFuehrungskraftOderHoeher,
  type Rolle,
} from "@/lib/rollen";
import { rolleLabel } from "@/lib/format";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { ThemeToggle } from "@/components/ThemeToggle";

type NavEintrag = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type AdminGruppe = {
  id: string;
  label: string;
  eintraege: NavEintrag[];
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

const ADMIN_OVERVIEW: NavEintrag = {
  href: "/admin",
  label: "Übersicht",
  icon: ShieldCheck,
};

const ADMIN_GROUPS: AdminGruppe[] = [
  {
    id: "inhalte",
    label: "Inhalte",
    eintraege: [
      { href: "/admin/lernpfade", label: "Lernpfade", icon: GraduationCap },
      { href: "/admin/quizze", label: "Quizze", icon: HelpCircle },
      { href: "/admin/praxisaufgaben", label: "Praxisaufgaben", icon: CheckSquare },
      { href: "/admin/wissen", label: "Handbuch", icon: BookOpen },
    ],
  },
  {
    id: "team",
    label: "Mitarbeiter",
    eintraege: [
      { href: "/admin/benutzer", label: "Benutzer", icon: Users },
      { href: "/admin/standorte", label: "Standorte", icon: MapPin },
    ],
  },
  {
    id: "studio",
    label: "Studio-Daten",
    eintraege: [
      { href: "/admin/aufgaben", label: "Aufgaben", icon: ListTodo },
      { href: "/admin/infos", label: "Infos", icon: Megaphone },
      { href: "/admin/kontakte", label: "Kontakte", icon: Contact },
      { href: "/admin/maengel", label: "Mängel", icon: AlertTriangle },
      { href: "/admin/formulare", label: "Formulare", icon: FileText },
      { href: "/admin/praxisfreigaben", label: "Anfragen", icon: CheckSquare },
    ],
  },
  {
    id: "auswertung",
    label: "Auswertung",
    eintraege: [
      { href: "/admin/fortschritt", label: "Fortschritt", icon: Activity },
      { href: "/admin/audit-log", label: "Audit-Log", icon: ShieldCheck },
      { href: "/admin/showcase", label: "Design-Showcase", icon: Sparkles },
    ],
  },
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

function aktiverGruppenId(pathname: string): string | null {
  for (const g of ADMIN_GROUPS) {
    if (
      g.eintraege.some(
        (e) => pathname === e.href || pathname.startsWith(`${e.href}/`),
      )
    ) {
      return g.id;
    }
  }
  return null;
}

export function Sidebar({
  rolle,
  fullName,
  notificationSlot,
}: {
  rolle: Rolle;
  fullName?: string | null;
  notificationSlot?: React.ReactNode;
}) {
  const pathname = usePathname();
  const showAdmin = istFuehrungskraftOderHoeher(rolle);
  const offen = aktiverGruppenId(pathname);
  const [openGroup, setOpenGroup] = useState<string | null>(offen);

  function toggle(id: string) {
    setOpenGroup((prev) => (prev === id ? null : id));
  }

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-background lg:flex lg:flex-col">
      <div className="sticky top-0 flex h-screen flex-col">
        {/* Branding + NotificationBell oben */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--primary))] text-[11px] font-bold text-[hsl(var(--primary-foreground))]">
            VA
          </span>
          <span className="flex-1 text-[14px] font-semibold tracking-tight">
            Vitness Academy
          </span>
          {notificationSlot}
        </div>

        {/* Search-Trigger */}
        <div className="px-3 pt-3">
          <SearchTrigger />
        </div>

        {/* Nav scrollbar */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 text-sm">
          <NavGruppe
            label="Lernen"
            eintraege={LERNEN_NAV}
            pathname={pathname}
          />
          <NavGruppe
            label="Studio"
            eintraege={STUDIO_NAV}
            pathname={pathname}
            className="mt-5"
          />
          {showAdmin && (
            <div className="mt-5">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {istAdmin(rolle) ? "Verwaltung" : "Team"}
              </p>
              <ul className="space-y-0.5">
                <li>
                  <NavLink eintrag={ADMIN_OVERVIEW} pathname={pathname} />
                </li>
              </ul>
              <div className="mt-1 space-y-0.5">
                {ADMIN_GROUPS.map((g) => (
                  <CollapsibleGruppe
                    key={g.id}
                    gruppe={g}
                    pathname={pathname}
                    open={openGroup === g.id}
                    onToggle={() => toggle(g.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Theme-Toggle */}
        <div className="border-t border-border px-2 py-1.5">
          <ThemeToggle variant="row" />
        </div>

        {/* Profil-Footer */}
        <Link
          href="/einstellungen"
          className="group flex items-center gap-3 border-t border-border px-4 py-3 transition-colors hover:bg-muted"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-semibold text-[hsl(var(--primary-foreground))]">
            {initialen(fullName ?? null)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-foreground">
              {fullName ?? "—"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {rolleLabel(rolle)}
            </p>
          </div>
          <Settings
            className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground"
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
      <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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

function CollapsibleGruppe({
  gruppe,
  pathname,
  open,
  onToggle,
}: {
  gruppe: AdminGruppe;
  pathname: string;
  open: boolean;
  onToggle: () => void;
}) {
  const aktiv = gruppe.eintraege.some(
    (e) => pathname === e.href || pathname.startsWith(`${e.href}/`),
  );

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
          aktiv
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span>{gruppe.label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open ? "rotate-0" : "-rotate-90",
          )}
          strokeWidth={2}
        />
      </button>
      {open && (
        <ul className="mt-0.5 space-y-0.5 pl-1">
          {gruppe.eintraege.map((e) => (
            <li key={e.href}>
              <NavLink eintrag={e} pathname={pathname} />
            </li>
          ))}
        </ul>
      )}
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

  return (
    <Link
      href={eintrag.href}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] transition-colors",
        aktiv
          ? "bg-[hsl(var(--primary)/0.08)] font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {aktiv && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-[hsl(var(--primary))]"
        />
      )}
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0 transition-colors",
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
