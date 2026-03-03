import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-96 max-w-full" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
