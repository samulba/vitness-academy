import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatItem = {
  icon?: React.ReactNode;
  label: string;
  wert: string | number;
  delta?: string;
  /** "Trend" als kleiner Hinweis ("seit gestern", "diese Woche", ...) */
  hint?: string;
  /** Optionaler Klick auf die ganze Kachel */
  href?: string;
  /** Magenta-Akzent (Hervorhebung der wichtigsten Kennzahl) */
  akzent?: boolean;
};

/**
 * Horizontale Stats-Leiste fuer den Kopfbereich von Admin-Listen.
 * Modern: dezente Karten mit Icon links oben, grosser Zahl, Label klein,
 * optionaler Delta-Pille rechts oben. Akzent-Variante hat Magenta-Border
 * und subtilen Magenta-Glow.
 */
export function StatsStrip({
  items,
  className,
}: {
  items: StatItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((s, i) => (
        <StatKachel key={i} {...s} />
      ))}
    </div>
  );
}

function StatKachel({
  icon,
  label,
  wert,
  delta,
  hint,
  href,
  akzent,
}: StatItem) {
  const innen = (
    <>
      <div className="flex items-start justify-between gap-2">
        {icon ? (
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              akzent
                ? "bg-[hsl(var(--brand-pink)/0.14)] text-[hsl(var(--brand-pink))]"
                : "bg-muted text-muted-foreground",
            )}
          >
            {icon}
          </span>
        ) : (
          <span />
        )}
        {delta && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
              akzent
                ? "bg-[hsl(var(--brand-pink))] text-white"
                : "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]",
            )}
          >
            {delta}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {wert}
        </p>
        <p className="mt-1 text-[12px] text-muted-foreground">{label}</p>
        {hint && (
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">
            {hint}
          </p>
        )}
      </div>
      {href && (
        <ArrowUpRight className="absolute right-3 top-3 h-3.5 w-3.5 text-muted-foreground/30 transition-all group-hover:right-2.5 group-hover:top-2.5 group-hover:text-[hsl(var(--brand-pink))]" />
      )}
    </>
  );

  const baseClass = cn(
    "group relative flex flex-col rounded-xl border bg-card p-4 transition-all",
    akzent
      ? "border-[hsl(var(--brand-pink)/0.35)] shadow-[0_0_0_4px_hsl(var(--brand-pink)/0.04)]"
      : "border-border",
    href && "hover:-translate-y-0.5 hover:border-[hsl(var(--brand-pink)/0.4)] hover:shadow-sm",
  );

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {innen}
      </Link>
    );
  }
  return <div className={baseClass}>{innen}</div>;
}
