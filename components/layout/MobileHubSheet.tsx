"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckSquare,
  Contact,
  Euro,
  FileText,
  GraduationCap,
  HelpCircle,
  Inbox,
  ListTodo,
  LogOut,
  MapPin,
  Megaphone,
  MessageCircle,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { abmelden } from "@/app/login/actions";
import { cn } from "@/lib/utils";
import { istAdmin, istFuehrungskraftOderHoeher, type Rolle } from "@/lib/rollen";
import { hatModulZugriff, type Modul } from "@/lib/permissions";

type HubLink = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Permission-Modul. Leer = immer sichtbar (z.B. Mitarbeiter-Bereich). */
  modul?: Modul;
};

const STUDIO: HubLink[] = [
  { href: "/putzprotokoll", label: "Putzprotokoll", icon: Sparkles, modul: "mitarbeiter-putzprotokoll" },
  { href: "/maengel", label: "Mängel", icon: AlertTriangle, modul: "mitarbeiter-maengel" },
];

const TEAM: HubLink[] = [
  { href: "/infos", label: "Infos", icon: Megaphone, modul: "mitarbeiter-infos" },
  { href: "/feedback", label: "Feedback", icon: MessageCircle, modul: "mitarbeiter-feedback" },
  { href: "/kontakte", label: "Kontakte", icon: Contact, modul: "mitarbeiter-kontakte" },
];

const LERNEN: HubLink[] = [
  { href: "/lernpfade", label: "Lernpfade", icon: GraduationCap, modul: "mitarbeiter-lernpfade" },
  { href: "/praxisfreigaben", label: "Praxisfreigaben", icon: CheckSquare, modul: "mitarbeiter-praxisfreigaben" },
  { href: "/wissen", label: "Handbuch", icon: BookOpen, modul: "mitarbeiter-wissen" },
];

const VERKAUF: HubLink = {
  href: "/provisionen",
  label: "Provisionen",
  icon: TrendingUp,
  modul: "mitarbeiter-provisionen",
};

// Admin-Hub: 5 Sektionen analog zur Sidebar — Operations zuerst.
// Pro Eintrag das Permission-Modul fuer Filterung.
const ADMIN_OPERATIONS: HubLink[] = [
  { href: "/admin/aufgaben", label: "Aufgaben", icon: ListTodo, modul: "aufgaben" },
  { href: "/admin/maengel", label: "Mängel", icon: AlertTriangle, modul: "maengel" },
  { href: "/admin/putzprotokolle", label: "Putzprotokolle", icon: Sparkles, modul: "putzprotokolle" },
  { href: "/admin/formulare/eingaenge", label: "Eingänge", icon: Inbox, modul: "formulare" },
  { href: "/admin/praxisfreigaben", label: "Praxis-Anfragen", icon: CheckSquare, modul: "praxisfreigaben" },
  { href: "/admin/feedback", label: "Feedback", icon: MessageCircle, modul: "feedback" },
];

const ADMIN_TEAM: HubLink[] = [
  { href: "/admin/benutzer", label: "Benutzer", icon: Users, modul: "benutzer" },
  { href: "/admin/lohn", label: "Lohn", icon: Euro, modul: "lohn" },
  { href: "/admin/provisionen", label: "Provisionen", icon: TrendingUp, modul: "provisionen" },
];

const ADMIN_KOMMUNIKATION: HubLink[] = [
  { href: "/admin/infos", label: "Infos", icon: Megaphone, modul: "infos" },
  { href: "/admin/kontakte", label: "Kontakte", icon: Contact, modul: "kontakte" },
  { href: "/admin/formulare", label: "Formulare", icon: FileText, modul: "formulare" },
  { href: "/admin/wissen", label: "Handbuch", icon: BookOpen, modul: "wissen" },
];

const ADMIN_AKADEMIE: HubLink[] = [
  { href: "/admin/lernpfade", label: "Lernpfade", icon: GraduationCap, modul: "lernpfade" },
  { href: "/admin/quizze", label: "Quizze", icon: HelpCircle, modul: "quizze" },
  { href: "/admin/praxisaufgaben", label: "Praxisaufgaben", icon: CheckSquare, modul: "praxisaufgaben" },
  { href: "/admin/onboarding-templates", label: "Onboarding", icon: Sparkles, modul: "onboarding-templates" },
];

const ADMIN_STAMMDATEN: HubLink[] = [
  { href: "/admin/standorte", label: "Standorte", icon: MapPin, modul: "standorte" },
  { href: "/admin/rollen", label: "Rollen & Rechte", icon: Shield, modul: "rollen" },
  { href: "/admin/fortschritt", label: "Fortschritt", icon: Activity, modul: "fortschritt" },
  { href: "/admin/audit-log", label: "Audit-Log", icon: ShieldCheck, modul: "audit" },
];

/**
 * Bottom-Sheet das alle App-Bereiche zeigt — getriggert vom zentralen
 * "+"-FAB in der MobileNav. Slide-up-Animation, Backdrop-Blur. Schliesst
 * automatisch beim Klick auf einen Link (via Link onClick) und beim
 * Klick auf den Backdrop.
 */
export function MobileHubSheet({
  offen,
  onClose,
  rolle,
  kannProvisionen,
  permissions = [],
  adminMode,
}: {
  offen: boolean;
  onClose: () => void;
  rolle: Rolle;
  kannProvisionen: boolean;
  permissions?: readonly string[];
  adminMode: boolean;
}) {
  const istFuehrung = istFuehrungskraftOderHoeher(rolle);
  const permsSet = new Set(permissions);
  let verwaltungAktiv = false;
  let mitarbeiterAktiv = false;
  for (const p of permsSet) {
    if (p.startsWith("mitarbeiter-")) mitarbeiterAktiv = true;
    else verwaltungAktiv = true;
    if (verwaltungAktiv && mitarbeiterAktiv) break;
  }

  // Filter-Helper: zeige Eintrag wenn Bereich aktiv UND modul erlaubt,
  // ODER Bereich inaktiv (Migrations-Lag, alte Logik).
  function filterAdmin(items: HubLink[]): HubLink[] {
    if (!verwaltungAktiv) {
      // Alte Logik: Provisionen nur mit Flag, Rollen-Eintrag nur Admin+
      return items.filter((i) => {
        if (i.href === "/admin/provisionen" && !kannProvisionen) return false;
        if (i.href === "/admin/rollen" && !istAdmin(rolle)) return false;
        return true;
      });
    }
    return items.filter((i) => !i.modul || hatModulZugriff(permsSet, i.modul));
  }
  function filterMitarbeiter(items: HubLink[]): HubLink[] {
    if (!mitarbeiterAktiv) {
      return items.filter((i) => {
        if (i.href === "/provisionen" && !kannProvisionen) return false;
        return true;
      });
    }
    return items.filter((i) => !i.modul || hatModulZugriff(permsSet, i.modul));
  }
  const verkaufSichtbar = mitarbeiterAktiv
    ? hatModulZugriff(permsSet, "mitarbeiter-provisionen")
    : kannProvisionen;

  // ESC-Key schliesst Sheet
  useEffect(() => {
    if (!offen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [offen, onClose]);

  // Body-Scroll-Lock
  useEffect(() => {
    if (!offen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [offen]);

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-hidden={!offen}
        tabIndex={-1}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden",
          offen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Alle Bereiche"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border border-border bg-card shadow-2xl transition-transform duration-300 lg:hidden",
          offen ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* Drag-Handle visuell */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/95 px-5 pb-3 pt-3 backdrop-blur">
          <span
            aria-hidden
            className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-border"
          />
          <h2 className="text-base font-semibold tracking-tight">
            {adminMode ? "Verwaltung" : "Alle Bereiche"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 p-5 pb-24">
          {adminMode ? (
            <>
              {(() => {
                // Pro Sektion filtern, leere Sektionen ausblenden.
                const operations = filterAdmin(ADMIN_OPERATIONS);
                const team = filterAdmin(ADMIN_TEAM);
                const kommunikation = filterAdmin(ADMIN_KOMMUNIKATION);
                const akademie = filterAdmin(ADMIN_AKADEMIE);
                const stammdaten = filterAdmin(ADMIN_STAMMDATEN);
                return (
                  <>
                    {operations.length > 0 && (
                      <Section titel="Operations">
                        <Grid items={operations} onNavigate={onClose} />
                      </Section>
                    )}
                    {team.length > 0 && (
                      <Section titel="Mitarbeiter">
                        <Grid items={team} onNavigate={onClose} />
                      </Section>
                    )}
                    {kommunikation.length > 0 && (
                      <Section titel="Kommunikation">
                        <Grid items={kommunikation} onNavigate={onClose} />
                      </Section>
                    )}
                    {akademie.length > 0 && (
                      <Section titel="Akademie">
                        <Grid items={akademie} onNavigate={onClose} />
                      </Section>
                    )}
                    {stammdaten.length > 0 && (
                      <Section titel="Stammdaten & Auswertung">
                        <Grid items={stammdaten} onNavigate={onClose} />
                      </Section>
                    )}
                  </>
                );
              })()}
              <Section titel="Modus">
                <ZurApp adminMode onClose={onClose} />
              </Section>
            </>
          ) : (
            <>
              {(() => {
                const studio = filterMitarbeiter(STUDIO);
                const team = filterMitarbeiter(TEAM);
                const lernen = filterMitarbeiter(LERNEN);
                return (
                  <>
                    {studio.length > 0 && (
                      <Section titel="Studio">
                        <Grid items={studio} onNavigate={onClose} />
                      </Section>
                    )}
                    {team.length > 0 && (
                      <Section titel="Team">
                        <Grid items={team} onNavigate={onClose} />
                      </Section>
                    )}
                    {lernen.length > 0 && (
                      <Section titel="Lernen & Wissen">
                        <Grid items={lernen} onNavigate={onClose} />
                      </Section>
                    )}
                  </>
                );
              })()}
              {verkaufSichtbar && (
                <Section titel="Verkauf">
                  <Grid items={[VERKAUF]} onNavigate={onClose} />
                </Section>
              )}
              {istFuehrung && (
                <Section titel="Modus">
                  <ZurApp adminMode={false} onClose={onClose} />
                </Section>
              )}
            </>
          )}

          <Section titel="Account">
            <div className="space-y-1.5">
              <Link
                href="/einstellungen"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:border-[hsl(var(--primary)/0.4)] hover:bg-muted/40"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Einstellungen
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
              </Link>
              <form action={abmelden}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-[hsl(var(--destructive))] transition-colors hover:border-[hsl(var(--destructive)/0.4)] hover:bg-[hsl(var(--destructive)/0.05)]"
                >
                  <LogOut className="h-4 w-4" />
                  Abmelden
                </button>
              </form>
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({
  titel,
  children,
}: {
  titel: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {titel}
      </h3>
      {children}
    </section>
  );
}

function Grid({
  items,
  onNavigate,
}: {
  items: HubLink[];
  onNavigate: () => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <HubItem key={item.href} item={item} onClick={onNavigate} />
      ))}
    </div>
  );
}

function HubItem({
  item,
  onClick,
}: {
  item: HubLink;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-3 text-center transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/0.4)] hover:shadow-sm"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <span className="text-[11px] font-medium leading-tight">
        {item.label}
      </span>
    </Link>
  );
}

function ZurApp({
  adminMode,
  onClose,
}: {
  adminMode: boolean;
  onClose: () => void;
}) {
  const href = adminMode ? "/dashboard" : "/admin";
  const label = adminMode ? "Zur Mitarbeiter-App" : "Zur Verwaltung";
  const Icon = adminMode ? Sparkles : Shield;
  return (
    <Link
      href={href}
      onClick={onClose}
      className="group flex items-center gap-3 rounded-xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.06)] px-4 py-3 text-sm font-semibold text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary)/0.1)]"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      {label}
      <ArrowRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
