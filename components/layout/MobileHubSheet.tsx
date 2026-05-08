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
  Heart,
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
import { istFuehrungskraftOderHoeher, type Rolle } from "@/lib/rollen";

type HubLink = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const STUDIO: HubLink[] = [
  { href: "/putzprotokoll", label: "Putzprotokoll", icon: Sparkles },
  { href: "/maengel", label: "Mängel", icon: AlertTriangle },
];

const TEAM: HubLink[] = [
  { href: "/infos", label: "Infos", icon: Megaphone },
  { href: "/kudos", label: "Kudos", icon: Heart },
  { href: "/feedback", label: "Feedback", icon: MessageCircle },
  { href: "/kontakte", label: "Kontakte", icon: Contact },
];

const LERNEN: HubLink[] = [
  { href: "/lernpfade", label: "Lernpfade", icon: GraduationCap },
  { href: "/praxisfreigaben", label: "Praxisfreigaben", icon: CheckSquare },
  { href: "/wissen", label: "Handbuch", icon: BookOpen },
];

const VERKAUF: HubLink = {
  href: "/provisionen",
  label: "Provisionen",
  icon: TrendingUp,
};

// Admin-Hub: 5 Sektionen analog zur Sidebar — Operations zuerst.
const ADMIN_OPERATIONS: HubLink[] = [
  { href: "/admin/aufgaben", label: "Aufgaben", icon: ListTodo },
  { href: "/admin/maengel", label: "Mängel", icon: AlertTriangle },
  { href: "/admin/putzprotokolle", label: "Putzprotokolle", icon: Sparkles },
  { href: "/admin/formulare/eingaenge", label: "Eingänge", icon: Inbox },
  { href: "/admin/praxisfreigaben", label: "Praxis-Anfragen", icon: CheckSquare },
  { href: "/admin/feedback", label: "Feedback", icon: MessageCircle },
];

const ADMIN_TEAM: HubLink[] = [
  { href: "/admin/benutzer", label: "Benutzer", icon: Users },
  { href: "/admin/lohn", label: "Lohn", icon: Euro },
  { href: "/admin/provisionen", label: "Provisionen", icon: TrendingUp },
];

const ADMIN_KOMMUNIKATION: HubLink[] = [
  { href: "/admin/infos", label: "Infos", icon: Megaphone },
  { href: "/admin/kontakte", label: "Kontakte", icon: Contact },
  { href: "/admin/formulare", label: "Formulare", icon: FileText },
  { href: "/admin/wissen", label: "Handbuch", icon: BookOpen },
];

const ADMIN_AKADEMIE: HubLink[] = [
  { href: "/admin/lernpfade", label: "Lernpfade", icon: GraduationCap },
  { href: "/admin/quizze", label: "Quizze", icon: HelpCircle },
  { href: "/admin/praxisaufgaben", label: "Praxisaufgaben", icon: CheckSquare },
  { href: "/admin/onboarding-templates", label: "Onboarding", icon: Sparkles },
];

const ADMIN_STAMMDATEN: HubLink[] = [
  { href: "/admin/standorte", label: "Standorte", icon: MapPin },
  { href: "/admin/fortschritt", label: "Fortschritt", icon: Activity },
  { href: "/admin/audit-log", label: "Audit-Log", icon: ShieldCheck },
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
  adminMode,
}: {
  offen: boolean;
  onClose: () => void;
  rolle: Rolle;
  kannProvisionen: boolean;
  adminMode: boolean;
}) {
  const istAdmin = istFuehrungskraftOderHoeher(rolle);

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
              <Section titel="Operations">
                <Grid items={ADMIN_OPERATIONS} onNavigate={onClose} />
              </Section>
              <Section titel="Mitarbeiter">
                <Grid
                  items={
                    kannProvisionen
                      ? ADMIN_TEAM
                      : ADMIN_TEAM.filter(
                          (i) => i.href !== "/admin/provisionen",
                        )
                  }
                  onNavigate={onClose}
                />
              </Section>
              <Section titel="Kommunikation">
                <Grid items={ADMIN_KOMMUNIKATION} onNavigate={onClose} />
              </Section>
              <Section titel="Akademie">
                <Grid items={ADMIN_AKADEMIE} onNavigate={onClose} />
              </Section>
              <Section titel="Stammdaten & Auswertung">
                <Grid items={ADMIN_STAMMDATEN} onNavigate={onClose} />
              </Section>
              <Section titel="Modus">
                <ZurApp adminMode onClose={onClose} />
              </Section>
            </>
          ) : (
            <>
              <Section titel="Studio">
                <Grid items={STUDIO} onNavigate={onClose} />
              </Section>
              <Section titel="Team">
                <Grid items={TEAM} onNavigate={onClose} />
              </Section>
              <Section titel="Lernen & Wissen">
                <Grid items={LERNEN} onNavigate={onClose} />
              </Section>
              {kannProvisionen && (
                <Section titel="Verkauf">
                  <Grid items={[VERKAUF]} onNavigate={onClose} />
                </Section>
              )}
              {istAdmin && (
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
