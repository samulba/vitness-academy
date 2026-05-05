import { Skeleton, SkeletonStatCard, SkeletonTableRow } from "@/components/ui/skeleton";

/**
 * Loading-Skeleton für den Admin-Bereich. Wird automatisch via Next.js
 * Suspense angezeigt, waehrend die echte Page-Component die Daten laedt.
 */
export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader-Skeleton */}
      <div className="space-y-3 pb-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* StatGrid-Skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
