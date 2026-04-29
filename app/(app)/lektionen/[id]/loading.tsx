import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-40" />
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}
