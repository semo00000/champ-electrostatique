interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`rounded bg-[var(--bg-hover)] animate-pulse ${className}`}
    />
  );
}
