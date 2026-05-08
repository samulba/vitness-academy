import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 sm:space-y-12">
      {/* Header */}
      <div className="space-y-2 sm:space-y-3">
        <Skeleton className="h-3 w-24 sm:w-32" />
        <Skeleton className="h-7 w-full max-w-xs sm:h-10 sm:max-w-md" />
        <Skeleton className="h-3.5 w-full max-w-md sm:h-4 sm:max-w-lg" />
      </div>

      {/* Content */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[16/10] w-full rounded-xl sm:rounded-2xl" />
        ))}
      </div>

      <div className="space-y-2 sm:space-y-3">
        <Skeleton className="h-5 w-36 sm:h-6 sm:w-48" />
        <Skeleton className="h-20 w-full rounded-xl sm:h-24" />
        <Skeleton className="h-20 w-full rounded-xl sm:h-24" />
      </div>
    </div>
  );
}
