import Link from "next/link";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/app/empty-state";
import { VehicleCard } from "@/components/marketplace/vehicle-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PublicVehicle } from "@/lib/bird-dog/types";
import { PUBLIC_VEHICLE_SELECT } from "@/lib/supabase/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signPublicVehicles } from "@/lib/supabase/storage";

type VehiclesPageProps = { searchParams: Promise<Record<string, string | undefined>> };
export const metadata = { title: "Browse vehicles" };

const vehicleStatuses: PublicVehicle["status"][] = ["available", "pending", "rented", "unavailable"];

const priceRanges = [
  { label: "Any price", value: "all" },
  { label: "Under $750", value: "under-750" },
  { label: "$750 - $1,000", value: "750-1000" },
  { label: "$1,000 - $1,500", value: "1000-1500" },
  { label: "$1,500+", value: "1500-plus" },
];

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("vehicles")
    .select(PUBLIC_VEHICLE_SELECT)
    .order("created_at", { ascending: false });

  const vehicles = error ? [] : await signPublicVehicles(supabase, (data ?? []) as PublicVehicle[]);
  const filterState = getFilterState(params);
  const filteredVehicles = filterVehicles(vehicles, filterState);
  const makeOptions = uniqueOptions(vehicles.map((vehicle) => vehicle.make));
  const locationOptions = uniqueOptions(vehicles.map(formatVehicleLocation));
  const hasFilters = hasActiveFilters(filterState);

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <section className="space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Bird Dog marketplace</p>
        <h1 className="max-w-5xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Browse available monthly vehicle programs.</h1>
        <p className="max-w-3xl text-lg leading-8 text-muted-foreground">Available inventory appears by default. Search and filters are optional and only narrow the vehicles shown.</p>
      </section>

      <form className="grid gap-4 rounded-[2rem] border border-white/10 bg-card/85 p-4 shadow-2xl shadow-black/25 backdrop-blur-xl md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto]">
        <FilterField
          label="Search"
          name="q"
          placeholder="Make, model, year, dealership, or location"
          value={filterState.searchTerm}
        />
        <SelectFilter label="Make" name="make" value={filterState.selectedMake}>
          <option value="all">All makes</option>
          {makeOptions.map((make) => (
            <option key={make} value={make}>{make}</option>
          ))}
        </SelectFilter>
        <SelectFilter label="Price" name="price_range" value={filterState.selectedPriceRange}>
          {priceRanges.map((range) => (
            <option key={range.value} value={range.value}>{range.label}</option>
          ))}
        </SelectFilter>
        <SelectFilter label="Location" name="location" value={filterState.selectedLocation}>
          <option value="all">All locations</option>
          {locationOptions.map((location) => (
            <option key={location} value={location}>{location}</option>
          ))}
        </SelectFilter>
        <SelectFilter label="Status" name="status" value={filterState.selectedStatus}>
          <option value="all">All statuses</option>
          {vehicleStatuses.map((status) => (
            <option key={status} value={status}>{formatStatus(status)}</option>
          ))}
        </SelectFilter>
        <div className="flex items-end gap-2"><Button className="flex-1" type="submit">Search</Button><Button asChild variant="outline"><Link href="/vehicles">Clear</Link></Button></div>
      </form>

      {error ? (
        <EmptyState title="Vehicles could not load" description={error.message} />
      ) : vehicles.length === 0 || (!hasFilters && filteredVehicles.length === 0) ? (
        <EmptyState title="No inventory available" description="No vehicles are available right now. Check back soon or contact a participating dealership." />
      ) : filteredVehicles.length === 0 ? (
        <EmptyState title="No vehicles match your filters" description="No vehicles match your filters. Try adjusting your search." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
        </div>
      )}
    </main>
  );
}

type FilterState = {
  searchTerm: string;
  selectedMake: string;
  selectedPriceRange: string;
  selectedLocation: string;
  selectedStatus: string;
};

function getFilterState(params: Record<string, string | undefined>): FilterState {
  return {
    searchTerm: normalizeParam(params.q) ?? normalizeParam(params.searchTerm) ?? "",
    selectedMake: normalizeParam(params.make) ?? "all",
    selectedPriceRange: normalizeParam(params.price_range) ?? "all",
    selectedLocation: normalizeParam(params.location) ?? "all",
    selectedStatus: normalizeParam(params.status) ?? "available",
  };
}

function filterVehicles(vehicles: PublicVehicle[], filters: FilterState) {
  let filteredVehicles = vehicles;

  if (filters.searchTerm) {
    const searchTerm = filters.searchTerm.toLowerCase();
    filteredVehicles = filteredVehicles.filter((vehicle) =>
      [
        vehicle.make,
        vehicle.model,
        vehicle.year?.toString(),
        vehicle.dealerships?.name,
        vehicle.city,
        vehicle.state,
        vehicle.dealerships?.city,
        vehicle.dealerships?.state,
        formatVehicleLocation(vehicle),
        formatDealershipLocation(vehicle),
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(searchTerm)),
    );
  }

  if (filters.selectedMake !== "all") {
    filteredVehicles = filteredVehicles.filter((vehicle) =>
      matchesText(vehicle.make, filters.selectedMake),
    );
  }

  if (filters.selectedPriceRange !== "all") {
    filteredVehicles = filteredVehicles.filter((vehicle) =>
      matchesPriceRange(vehicle.monthly_price, filters.selectedPriceRange),
    );
  }

  if (filters.selectedLocation !== "all") {
    filteredVehicles = filteredVehicles.filter((vehicle) =>
      [formatVehicleLocation(vehicle), formatDealershipLocation(vehicle)]
        .filter(Boolean)
        .some((location) => matchesText(location, filters.selectedLocation)),
    );
  }

  if (filters.selectedStatus !== "all") {
    filteredVehicles = filteredVehicles.filter((vehicle) =>
      matchesText(vehicle.status, filters.selectedStatus),
    );
  }

  return filteredVehicles;
}

function hasActiveFilters(filters: FilterState) {
  return Boolean(
    filters.searchTerm ||
    filters.selectedMake !== "all" ||
    filters.selectedPriceRange !== "all" ||
    filters.selectedLocation !== "all" ||
    filters.selectedStatus !== "available",
  );
}

function FilterField({ label, name, type = "text", value, placeholder }: { label: string; name: string; type?: string; value?: string; placeholder?: string }) { return <div className="space-y-2.5"><Label htmlFor={name}>{label}</Label><Input defaultValue={value ?? ""} id={name} name={name} placeholder={placeholder} type={type} /></div>; }

function SelectFilter({ label, name, value, children }: { label: string; name: string; value: string; children: ReactNode }) { return <div className="space-y-2.5"><Label htmlFor={name}>{label}</Label><select className="flex h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground shadow-inner shadow-black/20 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" defaultValue={value} id={name} name={name}>{children}</select></div>; }

function normalizeParam(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function uniqueOptions(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b));
}

function matchesText(value: string | null | undefined, expected: string) {
  return value?.toLowerCase() === expected.toLowerCase();
}

function matchesPriceRange(value: number | string | null | undefined, range: string) {
  const price = Number(value ?? 0);

  if (!Number.isFinite(price)) {
    return false;
  }

  if (range === "under-750") return price < 750;
  if (range === "750-1000") return price >= 750 && price <= 1000;
  if (range === "1000-1500") return price > 1000 && price <= 1500;
  if (range === "1500-plus") return price > 1500;

  return true;
}

function formatVehicleLocation(vehicle: PublicVehicle) {
  return [vehicle.city, vehicle.state].filter(Boolean).join(", ");
}

function formatDealershipLocation(vehicle: PublicVehicle) {
  return [vehicle.dealerships?.city, vehicle.dealerships?.state].filter(Boolean).join(", ");
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}
