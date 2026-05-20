import Link from "next/link";
import { Search } from "lucide-react";

import { VehicleCard } from "@/components/marketplace/vehicle-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getAvailableVehicles,
  hasVehicleFilters,
  parseVehicleFilters,
  type VehicleFilterOptions,
  type VehicleFilters,
} from "@/lib/marketplace/queries";

type VehiclesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse vehicles",
};

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const params = await searchParams;
  const filters = parseVehicleFilters(params);
  const { vehicles, options, error } = await getAvailableVehicles(filters);
  const hasFilters = hasVehicleFilters(filters);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Browse vehicles
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Find a monthly dealership rental.
          </h1>
        </div>
        <p className="text-sm leading-6 text-muted-foreground lg:text-right">
          Approval is not guaranteed. Valid license and active insurance
          required. Final approval, contract, and payment are handled by the
          dealership.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <VehicleFiltersForm filters={filters} hasFilters={hasFilters} options={options} />
        <section className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {error ? "Vehicle search unavailable" : `${vehicles.length} available vehicle${vehicles.length === 1 ? "" : "s"}`}
            </p>
            <Button asChild variant="outline">
              <Link href="/applications">My applications</Link>
            </Button>
          </div>

          {error ? (
            <Card>
              <CardContent className="p-6 text-sm text-destructive-foreground">
                We could not load available vehicles: {error}
              </CardContent>
            </Card>
          ) : vehicles.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                <h2 className="text-xl font-semibold">
                  {hasFilters ? "No vehicles match those filters" : "No vehicles available"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {hasFilters
                    ? "Clear or adjust filters to search available dealership rentals."
                    : "Dealership rentals will appear here after they are marked available."}
                </p>
                {hasFilters ? (
                  <Button asChild className="mt-5" variant="outline">
                    <Link href="/vehicles">Clear filters</Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}

function VehicleFiltersForm({
  filters,
  hasFilters,
  options,
}: {
  filters: VehicleFilters;
  hasFilters: boolean;
  options: VehicleFilterOptions;
}) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Filter rentals</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <SelectFilter label="City" name="city" options={options.cities} value={filters.city} />
          <SelectFilter label="State" name="state" options={options.states} value={filters.state} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <PriceField label="Min price" name="min_price" value={filters.minPrice} />
            <PriceField label="Max price" name="max_price" value={filters.maxPrice} />
          </div>
          <SelectFilter label="Make" name="make" options={options.makes} value={filters.make} />
          <SelectFilter label="Model" name="model" options={options.models} value={filters.model} />
          <SelectFilter
            label="Vehicle type"
            name="vehicle_type"
            options={options.vehicleTypes}
            value={filters.vehicleType}
          />
          <label className="flex items-start gap-3 rounded-2xl border border-border bg-background/30 p-3 text-sm">
            <input
              className="mt-1 h-4 w-4 accent-primary"
              defaultChecked={filters.rideshareAllowed}
              name="rideshare_allowed"
              type="checkbox"
              value="true"
            />
            <span>
              <span className="block font-medium">Rideshare allowed</span>
              <span className="text-muted-foreground">Show vehicles open to Uber or Lyft use.</span>
            </span>
          </label>
          <Button className="w-full" type="submit">
            Apply filters
          </Button>
          {hasFilters ? (
            <Button asChild className="w-full" variant="ghost">
              <Link href="/vehicles">Clear all</Link>
            </Button>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

function SelectFilter({
  label,
  name,
  options,
  value,
}: {
  label: string;
  name: string;
  options: string[];
  value?: string;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium" htmlFor={name}>
      <span>{label}</span>
      <select
        className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        defaultValue={value ?? ""}
        id={name}
        name={name}
      >
        <option value="">Any {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function PriceField({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value?: number;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium" htmlFor={name}>
      <span>{label}</span>
      <Input defaultValue={value ?? ""} id={name} min={0} name={name} type="number" />
    </label>
  );
}
