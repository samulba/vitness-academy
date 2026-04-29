import { cn } from "@/lib/utils";

export type PillTon =
  | "neutral"
  | "primary"
  | "success"
  | "warn"
  | "danger"
  | "info";

const STYLE: Record<PillTon, string> = {
  neutral:
    "bg-muted text-muted-foreground",
  primary:
    "bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]",
  success:
    "bg-[hsl(var(--success)/0.14)] text-[hsl(var(--success))]",
  warn: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  danger:
    "bg-destructive/10 text-destructive",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
};

/**
 * Einheitliche Pille fuer Status, Severity, Counts. Bewusst klein (text-[10px])
 * und subtil -- in modernen SaaS-UIs ist Pillen-Lautstärke ein häufiger Fehler.
 */
export function StatusPill({
  ton = "neutral",
  children,
  className,
}: {
  ton?: PillTon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        STYLE[ton],
        className,
      )}
    >
      {children}
    </span>
  );
}
