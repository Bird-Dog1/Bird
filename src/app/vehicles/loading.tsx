import { InventoryLoadingState } from "@/components/marketplace/inventory-loading-state";

export default function VehiclesLoading() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
      <div className="h-44 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.06]" />
      <InventoryLoadingState />
    </main>
  );
}
