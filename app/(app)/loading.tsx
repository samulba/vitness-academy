import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Content */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[16/10] w-full rounded-2xl" />
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}
