import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Breadcrumb skeleton */}
      <Skeleton className="h-4 w-72" />

      {/* Title */}
      <Skeleton className="h-8 w-80" />

      {/* Tab nav skeleton */}
      <div className="flex gap-1 border-b border-[var(--border-glass)] pb-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-5 w-4/6" />
        <Skeleton className="h-32 w-full rounded-xl mt-6" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
    </div>
  );
}
