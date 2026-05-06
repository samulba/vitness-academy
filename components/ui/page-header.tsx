import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type Breadcrumb = {
  label: string;
  /** Wenn href fehlt, ist dies der aktuelle Page-Eintrag (nicht klickbar) */
  href?: string;
};

export type PrimaryAction =
  | {
      label: string;
      icon?: React.ReactNode;
      href: string;
      onClick?: never;
    }
  | {
      label: string;
      icon?: React.ReactNode;
      onClick: () => void;
      href?: never;
    };

export type SecondaryAction = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
};

/**
 * Einheitlicher Page-Header für ALLE Admin-Seiten.
 *
 * Layout (top -> bottom):
 *  - Breadcrumbs (klickbar, Chevron-getrennt) -- optional
 *  - Eyebrow (12px uppercase tracking-wider muted) -- optional
 *  - Title (28px / 600) inline mit Description-Spalte rechts (oder
 *    description darunter wenn keine Actions)
 *  - Primary-Action + Secondary-Action-Icons rechts
 *
 * @example
 *   <PageHeader
 *     breadcrumbs={[{ label: "Verwaltung", href: "/admin" }, { label: "Mitarbeiter" }]}
 *     eyebrow="Team"
 *     title="Mitarbeiter"
 *     description="Rollen, Standorte und Lernpfad-Zuweisungen pflegen."
 *     primaryAction={{ label: "Neue:r Mitarbeiter:in", href: "/admin/benutzer/neu", icon: <Plus /> }}
 *     secondaryActions={[
 *       { label: "CSV importieren", icon: <Upload />, href: "/admin/benutzer/bulk-import" },
 *     ]}
 *   />
 */
export function PageHeader({
  breadcrumbs,
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryActions,
  extras,
  meta,
  className,
}: {
  breadcrumbs?: Breadcrumb[];
  eyebrow?: string;
  title: string;
  description?: string;
  primaryAction?: PrimaryAction;
  secondaryActions?: SecondaryAction[];
  /**
   * Beliebiger JSX-Slot rechts vor den Action-Buttons. Gedacht
   * fuer Client-Components mit eigenem State (z.B. VorschauButton),
   * die nicht ueber das href/onClick-API von SecondaryAction passen.
   */
  extras?: React.ReactNode;
  /** Optional rechts vom Title (z.B. Live-Pille, Counter) */
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("space-y-3", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <BreadcrumbBar items={breadcrumbs} />
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <h1 className="text-[22px] font-semibold leading-tight tracking-tight sm:text-[28px]">
              {title}
            </h1>
            {meta}
          </div>
          {description && (
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {(primaryAction ||
          (secondaryActions && secondaryActions.length > 0) ||
          extras) && (
          <div className="flex items-center gap-1.5">
            {extras}
            {secondaryActions?.map((a, i) => (
              <SecondaryButton key={i} action={a} />
            ))}
            {primaryAction && <PrimaryButton action={primaryAction} />}
          </div>
        )}
      </div>
    </header>
  );
}

function BreadcrumbBar({ items }: { items: Breadcrumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 text-[12px] text-muted-foreground"
    >
      {items.map((b, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {b.href && !last ? (
              <Link
                href={b.href}
                className="rounded px-1 -mx-1 transition-colors hover:text-foreground"
              >
                {b.label}
              </Link>
            ) : (
              <span
                aria-current={last ? "page" : undefined}
                className={cn("px-1 -mx-1", last && "text-foreground")}
              >
                {b.label}
              </span>
            )}
            {!last && (
              <ChevronRight
                className="h-3 w-3 text-muted-foreground/50"
                aria-hidden
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

function PrimaryButton({ action }: { action: PrimaryAction }) {
  const cls =
    "inline-flex h-8 items-center gap-1.5 rounded-md bg-[hsl(var(--primary))] px-3 text-[13px] font-medium text-[hsl(var(--primary-foreground))] shadow-[0_1px_0_0_rgba(0,0,0,0.08)] transition active:scale-[0.98] hover:bg-[hsl(var(--primary)/0.92)] [&_svg]:size-3.5";
  if (action.href) {
    return (
      <Link href={action.href} className={cls}>
        {action.icon}
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={cls}>
      {action.icon}
      {action.label}
    </button>
  );
}

function SecondaryButton({ action }: { action: SecondaryAction }) {
  const cls =
    "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition active:scale-[0.95] hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground [&_svg]:size-3.5";
  const ariaLabel = action.label;
  if (action.href) {
    return (
      <Link href={action.href} aria-label={ariaLabel} title={ariaLabel} className={cls}>
        {action.icon}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={action.onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cls}
    >
      {action.icon}
    </button>
  );
}
