import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-12">
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-96 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
        <Skeleton className="mt-6 h-12 w-full rounded-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}
