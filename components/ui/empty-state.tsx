import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type EmptyAction = {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
};

/**
 * Empty-State im Linear/Vercel-Style. NIE wieder "Icon + Text + 1 Button
 * zentriert".
 *
 * Layout:
 *  - Custom illustration ODER skeleton-Preview (was die Page spaeter zeigt,
 *    auf 30% Opacity, dahinter mit Mask-Gradient)
 *  - Titel (16px / 600)
 *  - Description (14px muted, max-w-md)
 *  - 3 horizontal angeordnete Action-Cards: jeweils Icon-Pille +
 *    Titel + 1-Zeilen-Beschreibung. Hover: translateY(-2px) + Border-Tint.
 *
 * @example
 *   <EmptyState
 *     title="Noch keine Mitarbeiter"
 *     description="Lege jemanden manuell an oder importiere mehrere via CSV."
 *     actions={[
 *       {
 *         icon: <Plus />,
 *         title: "Mitarbeiter:in anlegen",
 *         description: "Magic-Link per E-Mail",
 *         href: "/admin/benutzer/neu",
 *       },
 *       {
 *         icon: <Upload />,
 *         title: "CSV importieren",
 *         description: "Mehrere in einem Rutsch",
 *         href: "/admin/benutzer/bulk-import",
 *       },
 *       {
 *         icon: <BookOpen />,
 *         title: "Erfahre mehr",
 *         description: "Onboarding-Guide lesen",
 *         href: "/admin/wissen/onboarding",
 *       },
 *     ]}
 *   />
 */
export function EmptyState({
  illustration,
  title,
  description,
  actions,
  className,
}: {
  /**
   * Optional: ein <SkeletonPreview /> oder ein eigener SVG-/JSX-Block, der
   * auf 30% Opacity gerendert wird. Wenn nicht gesetzt, zeigen wir nichts
   * darueber -- Title + Description + Actions reichen oft.
   */
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  actions?: EmptyAction[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-12 text-center",
        className,
      )}
    >
      {illustration && (
        <div
          aria-hidden
          className="pointer-events-none mb-6 w-full max-w-md opacity-30 [mask-image:linear-gradient(to_bottom,black_30%,transparent_85%)]"
        >
          {illustration}
        </div>
      )}

      <h3 className="text-[16px] font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-[14px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      {actions && actions.length > 0 && (
        <div
          className={cn(
            "mt-6 grid w-full max-w-2xl gap-2.5",
            actions.length === 1 && "max-w-xs grid-cols-1",
            actions.length === 2 && "max-w-md grid-cols-1 sm:grid-cols-2",
            actions.length >= 3 && "grid-cols-1 sm:grid-cols-3",
          )}
        >
          {actions.map((a, i) => (
            <ActionCard key={i} action={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function ActionCard({ action }: { action: EmptyAction }) {
  const inhalt = (
    <>
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-foreground transition-colors group-hover:bg-[hsl(var(--brand-pink)/0.12)] group-hover:text-[hsl(var(--brand-pink))] [&_svg]:size-3.5">
        {action.icon}
      </span>
      <div className="mt-3 text-left">
        <p className="text-[13px] font-semibold tracking-tight">
          {action.title}
        </p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
          {action.description}
        </p>
      </div>
    </>
  );

  const cls =
    "group flex flex-col rounded-xl border border-border bg-card p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-[hsl(var(--brand-pink)/0.45)] hover:shadow-sm";

  if (action.href) {
    return (
      <Link href={action.href} className={cls}>
        {inhalt}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={cls}>
      {inhalt}
    </button>
  );
}

/**
 * Generischer "Skeleton-Preview" der Komponente die spaeter hier stehen wird.
 * Default rendert ein Tabellen-Skeleton mit 4 Zeilen -- benutze als
 * `illustration={<EmptyStateTablePreview />}` wenn die Page eine Tabelle
 * werden soll.
 */
export function EmptyStateTablePreview() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border bg-muted/40 px-3 py-2">
        <div className="flex gap-3">
          <div className="h-2 w-16 rounded bg-muted-foreground/20" />
          <div className="h-2 w-12 rounded bg-muted-foreground/20" />
          <div className="ml-auto h-2 w-8 rounded bg-muted-foreground/20" />
        </div>
      </div>
      {[60, 75, 50, 65].map((w, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-3 px-3 py-3",
            i < 3 && "border-b border-border",
          )}
        >
          <div className="h-6 w-6 rounded-full bg-muted" />
          <div
            className="h-2 rounded bg-muted-foreground/15"
            style={{ width: `${w}%` }}
          />
          <div className="ml-auto h-2 w-10 rounded bg-muted-foreground/15" />
        </div>
      ))}
    </div>
  );
}
