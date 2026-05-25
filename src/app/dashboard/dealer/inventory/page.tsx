import Link from "next/link";
import type { Route } from "next";

import { InventoryEmptyState } from "@/components/marketplace/inventory-empty-state";
import { VehicleFilters } from "@/components/marketplace/vehicle-filters";
import { VehicleGrid } from "@/components/marketplace/vehicle-grid";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/guards";
import { listAccessibleDealerships } from "@/lib/bird-dog/dealer-data";
import {
  filterInventoryVehicles,
  getInventoryFilterState,
  getInventoryLocationOptions,
  getInventoryMakeOptions,
  hasActiveInventoryFilters,
} from "@/lib/bird-dog/inventory";
import type { DealerVehicle } from "@/lib/bird-dog/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signVehiclePhotos } from "@/lib/supabase/storage";

export const metadata = { title: "Inventory" };
export default async function DealerInventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { user, profile } = await requireRole(["dealer", "admin"]);
  const supabase = await createServerSupabaseClient();
  const { data: dealerships, error: dealershipError } = await listAccessibleDealerships(
    supabase,
    user.id,
    profile.role,
  );
  const ids = dealerships.map((d) => d.id);

  if (dealershipError) {
    return (
      <InventoryEmptyState
        title="Inventory could not load"
        description={dealershipError.message}
      />
    );
  }

  if (!ids.length) {
    return (
      <InventoryEmptyState
        action={<Button asChild><Link href="/dashboard/dealer/settings">Create dealership profile</Link></Button>}
        description="Inventory can be added after your dealership profile exists."
        title="No dealership assigned"
      />
    );
  }

  const { data, error } = await supabase.from("vehicles").select("*, vehicle_photos (id, vehicle_id, photo_url, sort_order, created_at, updated_at)").in("dealership_id", ids).order("created_at", { ascending: false });
  const vehicles = await Promise.all(((data ?? []) as DealerVehicle[]).map(async (vehicle) => ({ ...vehicle, vehicle_photos: await signVehiclePhotos(supabase, vehicle.vehicle_photos) })));
  const filterState = getInventoryFilterState(params);
  const filteredVehicles = filterInventoryVehicles(vehicles, filterState);
  const hasFilters = hasActiveInventoryFilters(filterState);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            Dealer inventory
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Inventory</h1>
          <p className="mt-2 text-muted-foreground">
            Add, edit, price, and publish dealership vehicles.
          </p>
        </div>
        <Button asChild><Link href="/dashboard/dealer/inventory/new">Add vehicle</Link></Button>
      </div>

      <VehicleFilters
        clearHref="/dashboard/dealer/inventory"
        filters={filterState}
        locationOptions={getInventoryLocationOptions(vehicles)}
        makeOptions={getInventoryMakeOptions(vehicles)}
      />

      {error ? (
        <InventoryEmptyState title="Vehicles could not load" description={error.message} />
      ) : vehicles.length === 0 ? (
        <InventoryEmptyState
          action={<Button asChild><Link href="/dashboard/dealer/inventory/new">Add your first vehicle</Link></Button>}
          description="Vehicles you add will be protected by dealership RLS."
          title="No inventory yet"
        />
      ) : filteredVehicles.length === 0 ? (
        <InventoryEmptyState
          description={hasFilters ? "No vehicles match your filters. Try adjusting your search." : "Vehicles you add will be protected by dealership RLS."}
          title={hasFilters ? "No vehicles match your filters" : "No inventory yet"}
        />
      ) : (
        <VehicleGrid
          getVehicleCardProps={(vehicle) => ({
            applyHref: `/dashboard/dealer/inventory/${vehicle.id}/edit` as Route,
            applyLabel: "Edit",
            detailsHref: `/vehicles/${vehicle.id}` as Route,
          })}
          vehicles={filteredVehicles}
        />
      )}
    </div>
  );
}
