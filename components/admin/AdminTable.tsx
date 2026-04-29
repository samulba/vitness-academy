import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Einheitliche Tabelle für Admin-Listen. Dichtes Spacing, dezente
 * Trennlinien, animierter Hover-Zustand mit Magenta-Akzent.
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
        // group + relative + hidden indicator-line, die bei hover sichtbar wird
        "group relative border-b border-border transition-all last:border-b-0",
        "hover:bg-[hsl(var(--brand-pink)/0.04)]",
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
 * dem Titel angezeigt. Optionaler `leading` Slot fuer Avatar/Thumbnail
 * links vom Titel.
 */
export function AdminTitleCell({
  href,
  title,
  subtitle,
  badge,
  leading,
}: {
  href: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  /** Avatar/Thumbnail/Icon-Pille links vom Titel */
  leading?: React.ReactNode;
}) {
  return (
    <AdminTd>
      <Link
        href={href}
        className="-mx-2 -my-1.5 flex items-center gap-3 rounded-md px-2 py-1.5 group-hover:text-foreground"
      >
        {leading}
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium text-foreground">
              {title}
            </span>
            {badge}
          </span>
          {subtitle && (
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {subtitle}
            </span>
          )}
        </span>
      </Link>
    </AdminTd>
  );
}

/**
 * Action-Zelle ganz rechts: ruhiger Chevron-Pfeil, der bei Row-Hover
 * nach rechts schiebt + Magenta wird.
 */
export function AdminActionCell({ href }: { href: string }) {
  return (
    <AdminTd align="right">
      <Link
        href={href}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/50 transition-all group-hover:bg-[hsl(var(--brand-pink)/0.1)] group-hover:text-[hsl(var(--brand-pink))]"
        aria-label="Bearbeiten"
      >
        <ChevronRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          strokeWidth={2}
        />
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
