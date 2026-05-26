import Link from "next/link";
import type { Route } from "next";

import { DashboardHero, InfoTile } from "@/components/app/dashboard-ui";
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
  logInventoryDebug,
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
  const { user, profile } = await requireRole(["dealer"], "/dashboard/dealer/inventory");
  const supabase = await createServerSupabaseClient();
  const { data: dealerships, error: dealershipError } = await listAccessibleDealerships(
    supabase,
    user.id,
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

  const { data, error } = await supabase
    .from("vehicles")
    .select("*, vehicle_photos (id, vehicle_id, photo_url, sort_order, created_at, updated_at)")
    .in("dealership_id", ids)
    .order("created_at", { ascending: false });
  logInventoryDebug("dealer-inventory", { count: data?.length ?? 0, error, role: profile.role });
  const vehicles = await Promise.all(
    ((data ?? []) as DealerVehicle[]).map(async (vehicle) => ({
      ...vehicle,
      vehicle_photos: await signVehiclePhotos(supabase, vehicle.vehicle_photos),
    })),
  );
  const filterState = getInventoryFilterState(params);
  const filteredVehicles = filterInventoryVehicles(vehicles, filterState);
  const hasFilters = hasActiveInventoryFilters(filterState);

  return (
    <div className="space-y-7">
      <DashboardHero
        eyebrow="Dealer inventory"
        title="Keep your rental lineup ready."
        description="Add, edit, price, filter, and publish dealership vehicles with clear availability and photo coverage."
        actions={<Button asChild><Link href="/dashboard/dealer/inventory/new">Add vehicle</Link></Button>}
      >
        <div className="grid gap-3 sm:grid-cols-4">
          <InfoTile label="Total vehicles" value={vehicles.length} />
          <InfoTile label="Available" value={vehicles.filter((vehicle) => vehicle.status === "available").length} />
          <InfoTile label="Pending" value={vehicles.filter((vehicle) => vehicle.status === "pending").length} />
          <InfoTile label="Rented" value={vehicles.filter((vehicle) => vehicle.status === "rented").length} />
        </div>
      </DashboardHero>

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
          description="Create a listing with photos, rental price, deposit, insurance rules, and availability so customers can apply."
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
            applyLabel: "Edit listing",
            detailsHref: `/vehicles/${vehicle.id}` as Route,
          })}
          vehicles={filteredVehicles}
        />
      )}
    </div>
  );
}
