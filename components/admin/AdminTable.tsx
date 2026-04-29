import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Einheitliche Tabelle für Admin-Listen. Dichtes Spacing, dezente
 * Trennlinien, Hover-Highlight. Bewusst minimal: jede Page schreibt
 * ihre <th>/<td>s direkt rein.
 *
 * Pro Zeile gibt's eine "Title-Spalte", die als Link rendert (TitelLink),
 * und am Zeilenende ein dezentes Chevron-Icon. Keine groben "Bearbeiten"-
 * Buttons mehr.
 */
export function AdminTable({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function AdminTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-border bg-muted/30">
      <tr>{children}</tr>
    </thead>
  );
}

export function AdminTh({
  children,
  align = "left",
  className,
}: {
  children?: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function AdminTr({
  className,
  children,
  archiviert,
}: {
  className?: string;
  children: React.ReactNode;
  /** Optisch ausgegraut */
  archiviert?: boolean;
}) {
  return (
    <tr
      className={cn(
        "group border-b border-border transition-colors last:border-b-0 hover:bg-muted/40",
        archiviert && "opacity-60",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function AdminTd({
  align = "left",
  className,
  children,
}: {
  align?: "left" | "right" | "center";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </td>
  );
}

/**
 * Titel-Zelle mit Link. Subtitle ist optional und wird klein/muted unter
 * dem Titel angezeigt.
 */
export function AdminTitleCell({
  href,
  title,
  subtitle,
  badge,
}: {
  href: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
}) {
  return (
    <AdminTd>
      <Link
        href={href}
        className="-mx-1 -my-1 inline-flex flex-col gap-0.5 rounded px-1 py-1 group-hover:text-foreground"
      >
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">{title}</span>
          {badge}
        </span>
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </Link>
    </AdminTd>
  );
}

/**
 * Action-Zelle ganz rechts: minimaler Chevron-Pfeil, der zur Detail-Seite
 * verlinkt. Modern, ruhig, kein roter Riesen-Button.
 */
export function AdminActionCell({ href }: { href: string }) {
  return (
    <AdminTd align="right">
      <Link
        href={href}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Bearbeiten"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </Link>
    </AdminTd>
  );
}

/** Leerer State innerhalb einer Tabelle. */
export function AdminTableEmpty({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-10 text-center text-sm text-muted-foreground"
      >
        {children}
      </td>
    </tr>
  );
}
