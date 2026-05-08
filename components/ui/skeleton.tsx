import { cn } from "@/lib/utils";

/**
 * Loading-Placeholder. Subtile Pulse-Animation, verwende für alles was
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
 * Vorgebauter Skeleton für eine typische Admin-Tabellen-Zeile.
 * Mobile-tauglich: Haupt-Skeleton flex-1 statt fixe Width, sekundaere
 * Pills auf Mobile versteckt.
 */
export function SkeletonTableRow({ avatar = true }: { avatar?: boolean }) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 sm:gap-4">
      {avatar && (
        <Skeleton variant="circle" className="h-8 w-8 shrink-0 sm:h-7 sm:w-7" />
      )}
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3 w-full max-w-[200px]" />
        <Skeleton className="h-2.5 w-2/3 max-w-[140px] sm:hidden" />
      </div>
      <Skeleton className="hidden h-3 w-12 sm:block" />
      <Skeleton className="h-3 w-14 shrink-0 sm:w-20" />
    </div>
  );
}

/**
 * Vorgebauter Skeleton fuer den PageHeader (eyebrow + title + description).
 * Mobile-tauglich: alle Skeletons sind max-w-full damit nichts ausreisst.
 */
export function SkeletonPageHeader() {
  return (
    <div className="space-y-2 pb-1 sm:space-y-3 sm:pb-2">
      <Skeleton className="h-3 w-20 sm:w-24" />
      <Skeleton className="h-7 w-full max-w-[240px] sm:h-8 sm:max-w-[320px]" />
      <Skeleton className="h-3.5 w-full max-w-md sm:h-4" />
    </div>
  );
}

/**
 * Vorgebaute KPI-Karte als Skeleton.
 */
export function SkeletonStatCard() {
  return (
    <div className="rounded-xl border border-border bg-secondary/50 p-3 sm:p-4">
      <Skeleton className="h-2.5 w-16 sm:w-20" />
      <Skeleton className="mt-2.5 h-7 w-14 sm:mt-3 sm:h-8 sm:w-16" />
      <Skeleton className="mt-2.5 h-8 w-full sm:mt-3 sm:h-10" />
    </div>
  );
}
