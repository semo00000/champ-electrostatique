import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-12 animate-in fade-in">
      {/* Hero skeleton */}
      <section className="text-center py-12">
        <Skeleton className="h-6 w-48 mx-auto mb-6" />
        <Skeleton className="h-12 w-96 max-w-full mx-auto mb-4" />
        <Skeleton className="h-5 w-80 max-w-full mx-auto mb-8" />
        <div className="flex justify-center gap-3">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-32" />
        </div>
      </section>

      {/* Stats skeleton */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </section>

      {/* Cards skeleton */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </section>
    </div>
  );
}
