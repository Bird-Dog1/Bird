import { cn } from "@/lib/utils";

type InventoryLoadingStateProps = {
  cardCount?: number;
  className?: string;
  showFilters?: boolean;
};

export function InventoryLoadingState({
  cardCount = 6,
  className,
  showFilters = true,
}: InventoryLoadingStateProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {showFilters ? (
        <div className="h-28 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.06]" />
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cardCount }, (_, index) => (
          <div
            className="h-96 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/20"
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
