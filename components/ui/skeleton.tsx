import { cn } from "@/lib/utils";

/**
 * Loading-Placeholder. Subtile Pulse-Animation, verwende fuer alles was
 * gerade laedt -- Cards, Table-Rows, Avatare, Text-Lines. Kein Spinner mehr.
 *
 * @example
 *   <Skeleton className="h-4 w-32" />
 *   <Skeleton variant="circle" className="h-8 w-8" />
 */
export function Skeleton({
  className,
  variant = "rect",
}: {
  className?: string;
  variant?: "rect" | "circle";
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "animate-pulse bg-muted-foreground/10 motion-reduce:animate-none",
        variant === "circle" ? "rounded-full" : "rounded-md",
        className,
      )}
    />
  );
}

/**
 * Vorgebauter Skeleton fuer eine typische Admin-Tabellen-Zeile.
 * 5 Spalten, Avatar links optional.
 */
export function SkeletonTableRow({ avatar = true }: { avatar?: boolean }) {
  return (
    <div className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0">
      {avatar && <Skeleton variant="circle" className="h-7 w-7 shrink-0" />}
      <Skeleton className="h-3 w-40" />
      <Skeleton className="ml-auto h-3 w-12" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/**
 * Vorgebaute KPI-Karte als Skeleton.
 */
export function SkeletonStatCard() {
  return (
    <div className="rounded-xl border border-border bg-secondary/50 p-4">
      <Skeleton className="h-2.5 w-20" />
      <Skeleton className="mt-3 h-8 w-16" />
      <Skeleton className="mt-3 h-10 w-full" />
    </div>
  );
}
