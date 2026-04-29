import { cn } from "@/lib/utils";

export type PillTon =
  | "neutral"
  | "primary"
  | "success"
  | "warn"
  | "danger"
  | "info";

const STYLE: Record<PillTon, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary:
    "bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]",
  success: "bg-[hsl(var(--success)/0.14)] text-[hsl(var(--success))]",
  warn: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
};

const DOT: Record<PillTon, string> = {
  neutral: "bg-muted-foreground/60",
  primary: "bg-[hsl(var(--brand-pink))]",
  success: "bg-[hsl(var(--success))]",
  warn: "bg-amber-500",
  danger: "bg-destructive",
  info: "bg-sky-500",
};

/**
 * Einheitliche Pille fuer Status, Severity, Counts. Klein und subtil.
 * Mit `dot` bekommst du einen klassischen Status-Indicator-Punkt davor --
 * sieht moderner aus als nur Text.
 */
export function StatusPill({
  ton = "neutral",
  dot,
  pulse,
  children,
  className,
}: {
  ton?: PillTon;
  /** Statuspunkt vor dem Label */
  dot?: boolean;
  /** Wenn der Dot pulsieren soll (z.B. fuer "Live") */
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        STYLE[ton],
        className,
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 items-center justify-center">
          {pulse && (
            <span
              aria-hidden
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                DOT[ton],
              )}
            />
          )}
          <span
            aria-hidden
            className={cn(
              "relative inline-block h-1.5 w-1.5 rounded-full",
              DOT[ton],
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}
