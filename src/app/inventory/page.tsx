import Link from "next/link";

import { VehicleCard, type VehicleListing } from "@/components/vehicles/vehicle-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextField } from "@/components/forms/form-field";
import { isMissingSupabaseEnvError } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { listAvailableVehicles, type VehicleFilters } from "@/lib/supabase/queries";

export const metadata = {
  title: "Browse vehicles",
};

type InventoryPageProps = {
  searchParams: Promise<{
    city?: string;
    state?: string;
    make?: string;
    vehicle_type?: string;
    rideshare?: string;
  }>;
};

type QueryResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const params = await searchParams;
  const result = await getInventory(params);

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Live inventory
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find dealership vehicles ready for monthly rental.
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Browse approved vehicles, compare monthly pricing, then apply from your
            customer workspace.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Filter inventory</CardTitle>
            <CardDescription>Search by market, make, vehicle type, or rideshare fit.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 sm:grid-cols-2" action="/inventory">
              <TextField label="City" name="city" defaultValue={params.city ?? ""} />
              <TextField
                label="State"
                maxLength={2}
                name="state"
                defaultValue={params.state ?? ""}
              />
              <TextField label="Make" name="make" defaultValue={params.make ?? ""} />
              <TextField
                label="Vehicle type"
                name="vehicle_type"
                defaultValue={params.vehicle_type ?? ""}
                placeholder="sedan, suv, truck"
              />
              <label className="flex items-center gap-3 rounded-2xl border border-border bg-background/30 px-4 py-3 text-sm sm:col-span-2">
                <input
                  defaultChecked={params.rideshare === "true"}
                  name="rideshare"
                  type="checkbox"
                  value="true"
                />
                Only show rideshare-friendly vehicles
              </label>
              <div className="flex gap-3 sm:col-span-2">
                <Button type="submit">Search</Button>
                <Button asChild type="button" variant="outline">
                  <Link href="/inventory">Clear</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      {result.status === "missing-env" ? <InventorySetupNotice /> : null}
      {result.status === "error" ? (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {result.message}
        </p>
      ) : null}
      {result.status === "ready" && result.vehicles.length === 0 ? (
        <EmptyInventory />
      ) : null}
      {result.status === "ready" && result.vehicles.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {result.vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </section>
      ) : null}
    </main>
  );
}

async function getInventory(params: Awaited<InventoryPageProps["searchParams"]>) {
  const filters: VehicleFilters = {
    city: clean(params.city),
    make: clean(params.make),
    state: clean(params.state)?.toUpperCase(),
    vehicleType: clean(params.vehicle_type)?.toLowerCase(),
    rideshareAllowed: params.rideshare === "true" ? true : undefined,
    limit: 24,
  };

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await (listAvailableVehicles(
      supabase,
      filters,
    ) as unknown as Promise<QueryResult<VehicleListing[]>>);

    if (error) {
      return { status: "error" as const, message: error.message };
    }

    return { status: "ready" as const, vehicles: data ?? [] };
  } catch (error) {
    if (isMissingSupabaseEnvError(error)) {
      return { status: "missing-env" as const };
    }

    throw error;
  }
}

function clean(value?: string) {
  const trimmed = value?.trim();

  return trimmed || undefined;
}

function EmptyInventory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No vehicles match that search yet</CardTitle>
        <CardDescription>
          Clear the filters or check back after more approved dealer inventory is loaded.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function InventorySetupNotice() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Supabase to show live inventory</CardTitle>
        <CardDescription>
          Add Supabase environment variables and apply the migrations before going live.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
