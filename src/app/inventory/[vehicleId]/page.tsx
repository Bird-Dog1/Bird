import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatCurrency,
  VehicleCard,
  vehicleDealership,
  type VehicleListing,
  vehicleTitle,
} from "@/components/vehicles/vehicle-card";
import { isMissingSupabaseEnvError } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAvailableVehicleById, type SupabaseClientLike } from "@/lib/supabase/queries";

type VehicleDetailsPageProps = {
  params: Promise<{
    vehicleId: string;
  }>;
};

type QueryResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

export async function generateMetadata({ params }: VehicleDetailsPageProps) {
  const { vehicleId } = await params;

  return {
    title: `Vehicle ${vehicleId}`,
  };
}

export default async function VehicleDetailsPage({ params }: VehicleDetailsPageProps) {
  const { vehicleId } = await params;
  const result = await getVehicle(vehicleId);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "missing-env") {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Connect Supabase to show vehicle details</CardTitle>
            <CardDescription>
              Add Supabase environment variables and apply the migrations before going live.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (result.status === "error") {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {result.message}
        </p>
      </main>
    );
  }

  const { vehicle } = result;
  const dealership = vehicleDealership(vehicle);

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <VehicleCard vehicle={vehicle} actionLabel="Back to inventory" href="/inventory" />
      <section className="space-y-6">
        <Card>
          <CardHeader>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Vehicle details
            </p>
            <CardTitle>{vehicleTitle(vehicle)}</CardTitle>
            <CardDescription>
              {vehicle.city}, {vehicle.state} monthly rental from{" "}
              {dealership?.name ?? "an approved dealership"}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Monthly price" value={formatCurrency(vehicle.monthly_price)} />
              <Metric label="Deposit" value={formatCurrency(vehicle.deposit)} />
              <Metric
                label="Mileage limit"
                value={vehicle.mileage_limit ? `${vehicle.mileage_limit}/mo` : "Flexible"}
              />
            </div>
            {vehicle.description ? (
              <p className="leading-7 text-muted-foreground">{vehicle.description}</p>
            ) : (
              <p className="leading-7 text-muted-foreground">
                Contact the dealership through Bird Dog to confirm availability,
                insurance requirements, and pickup timing.
              </p>
            )}
            <div className="grid gap-3 rounded-2xl border border-border bg-background/30 p-4 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Dealer:</span>{" "}
                {dealership?.name ?? "Approved dealership"}
              </p>
              {dealership?.phone ? (
                <p>
                  <span className="font-semibold text-foreground">Phone:</span>{" "}
                  {dealership.phone}
                </p>
              ) : null}
              {dealership?.website ? (
                <p>
                  <span className="font-semibold text-foreground">Website:</span>{" "}
                  {dealership.website}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={`/dashboard/customer?vehicle_id=${vehicle.id}`}>
                  Apply for this vehicle
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/signup">Create customer account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

async function getVehicle(vehicleId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const queryClient = supabase as unknown as SupabaseClientLike;
    const { data, error } = await (getAvailableVehicleById(
      queryClient,
      vehicleId,
    ) as unknown as Promise<QueryResult<VehicleListing>>);

    if (error) {
      return { status: "error" as const, message: error.message };
    }

    if (!data) {
      return { status: "not-found" as const };
    }

    return { status: "ready" as const, vehicle: data };
  } catch (error) {
    if (isMissingSupabaseEnvError(error)) {
      return { status: "missing-env" as const };
    }

    throw error;
  }
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/30 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}
