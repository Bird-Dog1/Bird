import { InventoryLoadingState } from "@/components/marketplace/inventory-loading-state";

export default function DealerInventoryLoading() {
  return (
    <div className="space-y-6">
      <div className="h-32 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.06]" />
      <InventoryLoadingState />
    </div>
  );
}
