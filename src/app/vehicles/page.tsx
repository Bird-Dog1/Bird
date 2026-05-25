import { InventoryEmptyState } from "@/components/marketplace/inventory-empty-state";
import { VehicleFilters } from "@/components/marketplace/vehicle-filters";
import { VehicleGrid } from "@/components/marketplace/vehicle-grid";
import {
  filterInventoryVehicles,
  getInventoryFilterState,
  getInventoryLocationOptions,
  getInventoryMakeOptions,
  hasActiveInventoryFilters,
} from "@/lib/bird-dog/inventory";
import type { PublicVehicle } from "@/lib/bird-dog/types";
import { PUBLIC_VEHICLE_SELECT } from "@/lib/supabase/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signPublicVehicles } from "@/lib/supabase/storage";

type VehiclesPageProps = { searchParams: Promise<Record<string, string | undefined>> };
export const metadata = { title: "Browse vehicles" };

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("vehicles")
    .select(PUBLIC_VEHICLE_SELECT)
    .order("created_at", { ascending: false });

  const vehicles = error ? [] : await signPublicVehicles(supabase, (data ?? []) as PublicVehicle[]);
  const filterState = getInventoryFilterState(params);
  const filteredVehicles = filterInventoryVehicles(vehicles, filterState);
  const makeOptions = getInventoryMakeOptions(vehicles);
  const locationOptions = getInventoryLocationOptions(vehicles);
  const hasFilters = hasActiveInventoryFilters(filterState);

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <section className="space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Bird Dog marketplace</p>
        <h1 className="max-w-5xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Browse available monthly vehicle programs.</h1>
        <p className="max-w-3xl text-lg leading-8 text-muted-foreground">Available inventory appears by default. Search and filters are optional and only narrow the vehicles shown.</p>
      </section>

      <VehicleFilters
        clearHref="/vehicles"
        filters={filterState}
        locationOptions={locationOptions}
        makeOptions={makeOptions}
      />

      {error ? (
        <InventoryEmptyState title="Vehicles could not load" description={error.message} />
      ) : vehicles.length === 0 ? (
        <InventoryEmptyState title="No inventory available" description="No vehicles are available right now. Check back soon or contact a participating dealership." />
      ) : filteredVehicles.length === 0 ? (
        <InventoryEmptyState
          title={hasFilters ? "No vehicles match your filters" : "No inventory available"}
          description={hasFilters ? "No vehicles match your filters. Try adjusting your search." : "No vehicles are available right now. Check back soon or contact a participating dealership."}
        />
      ) : (
        <VehicleGrid vehicles={filteredVehicles} />
      )}
    </main>
  );
}
