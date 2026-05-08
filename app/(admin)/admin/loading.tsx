import { Skeleton, SkeletonStatCard, SkeletonTableRow } from "@/components/ui/skeleton";

/**
 * Loading-Skeleton für den Admin-Bereich. Wird automatisch via Next.js
 * Suspense angezeigt, waehrend die echte Page-Component die Daten laedt.
 */
export default function AdminLoading() {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* PageHeader-Skeleton */}
      <div className="space-y-2 pb-1 sm:space-y-3 sm:pb-2">
        <Skeleton className="h-3 w-20 sm:w-24" />
        <Skeleton className="h-7 w-full max-w-[240px] sm:h-8 sm:max-w-[320px]" />
        <Skeleton className="h-3.5 w-full max-w-md sm:h-4" />
      </div>

      {/* StatGrid-Skeleton */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Table-Skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <SkeletonTableRow />
        <SkeletonTableRow />
        <SkeletonTableRow />
        <SkeletonTableRow />
        <SkeletonTableRow />
      </div>
    </div>
  );
}
