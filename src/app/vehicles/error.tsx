"use client";

import { InventoryEmptyState } from "@/components/marketplace/inventory-empty-state";

export default function VehiclesError({ error }: { error: Error }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <InventoryEmptyState title="Marketplace error" description={error.message} />
    </main>
  );
}
