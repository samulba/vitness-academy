"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Bug,
  CheckSquare,
  ChevronDown,
  Clock,
  Contact,
  Euro,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  Inbox,
  LifeBuoy,
  ListTodo,
  MapPin,
  Megaphone,
  MessageCircle,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import {
  istAdmin,
  istFuehrungskraftOderHoeher,
  type Rolle,
} from "@/lib/rollen";
import { hatModulZugriff, type Modul } from "@/lib/permissions";
import { rolleLabel } from "@/lib/format";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { ThemeToggle } from "@/components/ThemeToggle";
import { avatarUrlFuerPfad } from "@/lib/storage";

type NavEintrag = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Wenn true, gilt der Eintrag NUR bei exakt passendem pathname als
   * aktiv. Sonst (default) auch bei jeder Sub-Route. Nötig z.B. für
   * "Übersicht" /admin -- sonst wäre der Eintrag auf jeder Admin-
   * Sub-Page mit-markiert. */
  exact?: boolean;
  /** Welches Permission-Modul der Eintrag braucht. Eintrag wird nur
   * angezeigt wenn der User mind. eine Aktion auf dem Modul hat
   * (hatModulZugriff). Ohne `modul` immer sichtbar (z.B.
   * Mitarbeiter-Mode-Sidebar -- Permissions wirken nur auf
   * Verwaltung-Mode). */
  modul?: Modul;
};

type AdminGruppe = {
  id: string;
  label: string;
  eintraege: NavEintrag[];
};

// Mein Tag = Dashboard, solo ganz oben
const MEIN_TAG: NavEintrag = {
  href: "/dashboard",
  label: "Mein Tag",
  icon: Home,
  modul: "mitarbeiter-dashboard",
};

// Drei Untergruppen statt einer flachen Liste -- die Sidebar bleibt
// übersichtlich auch wenn Provisionen/Feedback dazu kommen.
const STUDIO_NAV: NavEintrag[] = [
  { href: "/aufgaben", label: "Aufgaben", icon: ListTodo, modul: "mitarbeiter-aufgaben" },
  { href: "/formulare", label: "Anfragen", icon: FileText, modul: "mitarbeiter-formulare" },
  { href: "/maengel", label: "Mängel melden", icon: AlertTriangle, modul: "mitarbeiter-maengel" },
  { href: "/putzprotokoll", label: "Putzprotokoll", icon: Sparkles, modul: "mitarbeiter-putzprotokoll" },
  { href: "/lohn", label: "Schichten & Lohn", icon: Clock, modul: "mitarbeiter-lohn" },
];

// "Verkauf" — Provisionen-Tab: gated by Permission "mitarbeiter-
// provisionen:view". getCurrentProfile setzt die Permission automatisch
// aus profiles.kann_provisionen für Standard-Rollen, sodass das alte
// Verhalten ("nur Vertriebler") erhalten bleibt. Custom-Rollen koennen
// die Permission explizit (de)aktivieren.
const VERKAUF_NAV: NavEintrag[] = [
  { href: "/provisionen", label: "Provisionen", icon: TrendingUp, modul: "mitarbeiter-provisionen" },
];

const TEAM_NAV: NavEintrag[] = [
  { href: "/infos", label: "Wichtige Infos", icon: Megaphone, modul: "mitarbeiter-infos" },
  { href: "/feedback", label: "Mitglieder-Feedback", icon: MessageCircle, modul: "mitarbeiter-feedback" },
  { href: "/kontakte", label: "Kontakte", icon: Contact, modul: "mitarbeiter-kontakte" },
  { href: "/wissen", label: "Handbuch", icon: BookOpen, modul: "mitarbeiter-wissen" },
];

const LERNEN_NAV: NavEintrag[] = [
  { href: "/lernpfade", label: "Lernpfade", icon: GraduationCap, modul: "mitarbeiter-lernpfade" },
  { href: "/praxisfreigaben", label: "Praxisfreigaben", icon: CheckSquare, modul: "mitarbeiter-praxisfreigaben" },
];

const ADMIN_OVERVIEW: NavEintrag = {
  href: "/admin",
  label: "Übersicht",
  icon: ShieldCheck,
  exact: true,
};

/**
 * Admin-Gruppen Operations-First geordnet:
 * 1. Operations (Tagesgeschaeft) — was wartet auf mich heute
 * 2. Mitarbeiter
 * 3. Kommunikation
 * 4. Akademie (Onboarding-Phase, seltener Daily-Use)
 * 5. Stammdaten + Auswertung (Footer)
 *
 * Provisionen werden conditional angezeigt — der Eintrag wird per
 * Filter weggelassen wenn der User kein kann_provisionen-Flag hat.
 * Die Gruppen-Reihenfolge spiegelt sich auch in der MobileHubSheet wider.
 */
const ADMIN_GROUPS: AdminGruppe[] = [
  {
    id: "operations",
    label: "Operations",
    eintraege: [
      { href: "/admin/aufgaben", label: "Aufgaben", icon: ListTodo, modul: "aufgaben" },
      { href: "/admin/maengel", label: "Mängel", icon: AlertTriangle, modul: "maengel" },
      { href: "/admin/putzprotokolle", label: "Putzprotokolle", icon: Sparkles, modul: "putzprotokolle" },
      { href: "/admin/formulare/eingaenge", label: "Eingänge", icon: Inbox, modul: "formulare" },
      { href: "/admin/praxisfreigaben", label: "Praxis-Anfragen", icon: CheckSquare, modul: "praxisfreigaben" },
      { href: "/admin/feedback", label: "Mitglieder-Feedback", icon: MessageCircle, modul: "feedback" },
    ],
  },
  {
    id: "team",
    label: "Mitarbeiter",
    eintraege: [
      { href: "/admin/benutzer", label: "Benutzer", icon: Users, modul: "benutzer" },
      { href: "/admin/lohn", label: "Lohnabrechnungen", icon: Euro, modul: "lohn" },
      { href: "/admin/provisionen", label: "Provisionen", icon: TrendingUp, modul: "provisionen" },
    ],
  },
  {
    id: "kommunikation",
    label: "Kommunikation",
    eintraege: [
      { href: "/admin/infos", label: "Wichtige Infos", icon: Megaphone, modul: "infos" },
      { href: "/admin/kontakte", label: "Kontakte", icon: Contact, modul: "kontakte" },
      { href: "/admin/formulare", label: "Formulare", icon: FileText, modul: "formulare" },
      { href: "/admin/wissen", label: "Handbuch", icon: BookOpen, modul: "wissen" },
    ],
  },
  {
    id: "akademie",
    label: "Akademie",
    eintraege: [
      { href: "/admin/lernpfade", label: "Lernpfade", icon: GraduationCap, modul: "lernpfade" },
      { href: "/admin/quizze", label: "Quizze", icon: HelpCircle, modul: "quizze" },
      { href: "/admin/praxisaufgaben", label: "Praxisaufgaben", icon: CheckSquare, modul: "praxisaufgaben" },
      { href: "/admin/onboarding-templates", label: "Onboarding-Templates", icon: Sparkles, modul: "onboarding-templates" },
    ],
  },
  {
    id: "stammdaten",
    label: "Stammdaten & Auswertung",
    eintraege: [
      { href: "/admin/standorte", label: "Standorte", icon: MapPin, modul: "standorte" },
      { href: "/admin/rollen", label: "Rollen & Rechte", icon: Shield, modul: "rollen" },
      { href: "/admin/fortschritt", label: "Fortschritt", icon: Activity, modul: "fortschritt" },
      { href: "/admin/audit-log", label: "Audit-Log", icon: ShieldCheck, modul: "audit" },
      { href: "/admin/bug-reports", label: "Bug-Reports", icon: Bug, modul: "bug_reports" },
      // Design-Showcase nur in Development sichtbar — Production muss
      // sauber sein. Filter unten in der Component (kein Modul, nur Dev-Flag).
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
  avatarPath,
  notificationSlot,
  standortSlot,
  kannProvisionen = false,
  permissions = [],
}: {
  rolle: Rolle;
  fullName?: string | null;
  avatarPath?: string | null;
  notificationSlot?: React.ReactNode;
  standortSlot?: React.ReactNode;
  kannProvisionen?: boolean;
  /** Permissions als "modul:aktion"-Strings vom Layout. Set für
   * O(1)-Lookup intern erzeugt. Leer für User ohne Custom-Rolle und
   * fehlender Migration. */
  permissions?: readonly string[];
}) {
  const pathname = usePathname();
  const showAdmin = istFuehrungskraftOderHoeher(rolle);
  const adminMode = pathname === "/admin" || pathname.startsWith("/admin/");
  const offen = aktiverGruppenId(pathname);
  const [openGroup, setOpenGroup] = useState<string | null>(offen);
  const permsSet = new Set(permissions);

  // Bereichs-spezifische Aktiv-Flags:
  //  - Verwaltung: irgendeine Permission ohne "mitarbeiter-"-Praefix
  //  - Mitarbeiter: irgendeine "mitarbeiter-"-Permission
  // Wenn Bereich INAKTIV ist (= Migrations-Lag oder leer), gilt die
  // alte Rolle-basierte Logik für den jeweiligen Bereich. Damit bricht
  // weder Verwaltungs- noch Mitarbeiter-Sidebar bei Migrations-Lag,
  // und Custom-Rollen filtern strikt sobald sie greifen.
  const istDev = process.env.NODE_ENV === "development";
  let verwaltungAktiv = false;
  let mitarbeiterAktiv = false;
  for (const p of permsSet) {
    if (p.startsWith("mitarbeiter-")) mitarbeiterAktiv = true;
    else verwaltungAktiv = true;
    if (verwaltungAktiv && mitarbeiterAktiv) break;
  }

  const sichtbareGruppen = ADMIN_GROUPS.map((g) => ({
    ...g,
    eintraege: g.eintraege.filter((e) => {
      if (e.href === "/admin/showcase") return istDev;
      if (verwaltungAktiv) {
        if (!e.modul) return true;
        return hatModulZugriff(permsSet, e.modul);
      }
      // Fallback: alte Rolle-basierte Logik (vor Migration 0061)
      if (e.href === "/admin/provisionen" && !kannProvisionen) return false;
      // Für "Rollen & Rechte" gilt der alte Pattern: nur Admin+
      if (e.href === "/admin/rollen" && !istAdmin(rolle)) return false;
      return true;
    }),
  })).filter((g) => g.eintraege.length > 0);

  // Mitarbeiter-Bereich filtern. Bei aktiver Permission-Welt strikt;
  // sonst alte Logik (Provisionen nur mit Boolean, Rest immer).
  function filterMitarbeiter(items: NavEintrag[]): NavEintrag[] {
    if (mitarbeiterAktiv) {
      return items.filter((e) =>
        e.modul ? hatModulZugriff(permsSet, e.modul) : true,
      );
    }
    return items.filter((e) => {
      if (e.href === "/provisionen" && !kannProvisionen) return false;
      return true;
    });
  }
  const meinTagSichtbar = mitarbeiterAktiv
    ? hatModulZugriff(permsSet, "mitarbeiter-dashboard")
    : true;
  const studioNav = filterMitarbeiter(STUDIO_NAV);
  const verkaufNav = filterMitarbeiter(VERKAUF_NAV);
  const teamNav = filterMitarbeiter(TEAM_NAV);
  const lernenNav = filterMitarbeiter(LERNEN_NAV);

  function toggle(id: string) {
    setOpenGroup((prev) => (prev === id ? null : id));
  }

  return (
    <aside className="hidden h-screen w-60 shrink-0 border-r border-border bg-background lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col">
      <div className="flex h-full flex-col">
        {/* Branding + NotificationBell oben */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-3">
          <Logo size={28} priority />
          <span className="flex-1 text-[14px] font-semibold tracking-tight">
            Vitness Crew
          </span>
          {notificationSlot}
        </div>

        {/* Mode-Toggle (Mitarbeiter / Verwaltung) -- nur für
            fuehrungskraft+, weil Mitarbeiter keinen Verwaltungs-Modus
            haben. Aktiver Modus wird aus dem Pathname abgeleitet,
            damit Browser-Back/Direkt-Links funktionieren. */}
        {showAdmin && <ModeToggle adminMode={adminMode} />}

        {/* Standort-Switcher (nur wenn >=2 Studios) */}
        {standortSlot && <div className="px-3 pt-3">{standortSlot}</div>}

        {/* Search-Trigger */}
        <div className="px-3 pt-3">
          <SearchTrigger />
        </div>

        {/* Nav scrollbar */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 text-sm">
          {showAdmin && adminMode ? (
            <>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {istAdmin(rolle) ? "Verwaltung" : "Team"}
              </p>
              <ul className="space-y-0.5">
                <li>
                  <NavLink eintrag={ADMIN_OVERVIEW} pathname={pathname} />
                </li>
              </ul>
              <div className="mt-1 space-y-0.5">
                {sichtbareGruppen.map((g) => (
                  <CollapsibleGruppe
                    key={g.id}
                    gruppe={g}
                    pathname={pathname}
                    open={openGroup === g.id}
                    onToggle={() => toggle(g.id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              {meinTagSichtbar && (
                <ul className="space-y-0.5">
                  <li>
                    <NavLink eintrag={MEIN_TAG} pathname={pathname} />
                  </li>
                </ul>
              )}
              {studioNav.length > 0 && (
                <NavGruppe
                  label="Studio"
                  eintraege={studioNav}
                  pathname={pathname}
                  className="mt-5"
                />
              )}
              {verkaufNav.length > 0 && (
                <NavGruppe
                  label="Verkauf"
                  eintraege={verkaufNav}
                  pathname={pathname}
                  className="mt-5"
                />
              )}
              {teamNav.length > 0 && (
                <NavGruppe
                  label="Team"
                  eintraege={teamNav}
                  pathname={pathname}
                  className="mt-5"
                />
              )}
              {lernenNav.length > 0 && (
                <NavGruppe
                  label="Lernen"
                  eintraege={lernenNav}
                  pathname={pathname}
                  className="mt-5"
                />
              )}
            </>
          )}
        </nav>

        {/* Problem melden -- für alle eingeloggten User sichtbar */}
        <Link
          href="/problem-melden"
          className={cn(
            "group flex items-center gap-2.5 border-t border-border px-4 py-2 text-[12px] transition-colors hover:bg-muted",
            pathname === "/problem-melden" || pathname.startsWith("/problem-melden/")
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <LifeBuoy className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Problem melden</span>
        </Link>

        {/* Theme-Toggle */}
        <div className="border-t border-border px-2 py-1.5">
          <ThemeToggle variant="row" />
        </div>

        {/* Profil-Footer */}
        <Link
          href="/einstellungen"
          className="group flex items-center gap-3 border-t border-border px-4 py-3 transition-colors hover:bg-muted"
        >
          {(() => {
            const url = avatarUrlFuerPfad(avatarPath);
            return url ? (
              <span className="block h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={fullName ?? "Profilbild"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </span>
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-semibold text-[hsl(var(--primary-foreground))]">
                {initialen(fullName ?? null)}
              </span>
            );
          })()}
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

function ModeToggle({ adminMode }: { adminMode: boolean }) {
  return (
    <div className="border-b border-border px-3 py-2.5">
      <div
        role="tablist"
        aria-label="App-Modus"
        className="flex items-center gap-1 rounded-full border border-border bg-muted/40 p-0.5"
      >
        <Link
          href="/dashboard"
          role="tab"
          aria-selected={!adminMode}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors",
            !adminMode
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <User className="h-3.5 w-3.5" strokeWidth={1.75} />
          Mitarbeiter
        </Link>
        <Link
          href="/admin"
          role="tab"
          aria-selected={adminMode}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors",
            adminMode
              ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Shield className="h-3.5 w-3.5" strokeWidth={1.75} />
          Verwaltung
        </Link>
      </div>
    </div>
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
    (!eintrag.exact &&
      eintrag.href !== "/" &&
      pathname.startsWith(`${eintrag.href}/`));

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
