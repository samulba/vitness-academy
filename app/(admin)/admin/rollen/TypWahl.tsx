import Link from "next/link";
import { ArrowRight, Briefcase, Shield } from "lucide-react";

/**
 * Wizard-Schritt vor dem eigentlichen Rollen-Form. Lenkt den User
 * gleich in den passenden Use-Case und vermeidet das Vermischen von
 * Mitarbeiter- und Verwaltungs-Permissions.
 *
 * Mitarbeiter-Rolle: filtert Tabs in der Mitarbeiter-App (/(app)/*).
 *   Beispiele: Vertrieb, Trainer, Reinigung.
 * Verwaltungs-Rolle: feingranularer Zugriff auf /admin/*-Module.
 *   Beispiele: Buchhalter, Studio-Leiter+, Marketing-Lead.
 */
export function TypWahl() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Link
        href="/admin/rollen/neu?typ=mitarbeiter"
        className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/0.45)] hover:shadow-[0_12px_32px_-16px_hsl(var(--primary)/0.25)]"
      >
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-[hsl(var(--brand-pink)/0.08)] text-[hsl(var(--brand-pink))]">
            <Briefcase className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">
            Mitarbeiter-Rolle
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Filtert die Tabs in der Mitarbeiter-App. Die Rolle sieht
            nur die Bereiche, die du freischaltest.
          </p>
        </div>
        <ul className="mt-1 space-y-1 text-[11px] text-muted-foreground">
          <li className="flex items-start gap-1.5">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--brand-pink))]" />
            <span>Beispiele: Vertrieb (nur Provisionen), Reinigung, Trainer</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--brand-pink))]" />
            <span>Basis-Level immer Mitarbeiter</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--brand-pink))]" />
            <span>13 Tabs, nur &bdquo;Sehen&ldquo;</span>
          </li>
        </ul>
      </Link>

      <Link
        href="/admin/rollen/neu?typ=verwaltung"
        className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/0.45)] hover:shadow-[0_12px_32px_-16px_hsl(var(--primary)/0.25)]"
      >
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-[hsl(var(--brand-pink)/0.08)] text-[hsl(var(--brand-pink))]">
            <Shield className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">
            Verwaltungs-Rolle
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Feingranularer Zugriff auf /admin/*. Bestimmt, welche
            Verwaltungs-Module die Rolle sehen und bearbeiten darf.
          </p>
        </div>
        <ul className="mt-1 space-y-1 text-[11px] text-muted-foreground">
          <li className="flex items-start gap-1.5">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--brand-pink))]" />
            <span>Beispiele: Buchhalter, Studio-Leiter+, Marketing</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--brand-pink))]" />
            <span>Basis-Level Führungskraft oder Admin</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--brand-pink))]" />
            <span>20 Module × Sehen / Anlegen / Bearbeiten / Löschen</span>
          </li>
        </ul>
      </Link>
    </div>
  );
}
