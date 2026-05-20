import Link from "next/link";

import {
  DealerPageHeader,
  EmptyState,
  ErrorState,
  Money,
  StatusBadge,
  StatusMessage,
} from "@/components/dealer/dealer-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  dealershipQuery,
  getDealerContext,
  listDealerVehiclesFor,
  type Vehicle,
} from "@/lib/dealer/dashboard";

type InventoryPageProps = {
  searchParams: Promise<{
    dealership?: string;
    error?: string;
    message?: string;
  }>;
};

export const metadata = {
  title: "Dealer inventory",
};

export default async function DealerInventoryPage({ searchParams }: InventoryPageProps) {
  const params = await searchParams;
  const { dealership } = await getDealerContext(params.dealership);

  if (!dealership) {
    return (
      <div className="space-y-6">
        <DealerPageHeader
          description="Inventory requires an assigned dealership."
          title="Inventory"
        />
        <EmptyState
          description="No dealership assignment was found for this account."
          title="No dealership assigned"
        />
      </div>
    );
  }

  const { data, error } = await listDealerVehiclesFor(dealership.id);

  if (error) {
    return (
      <div className="space-y-6">
        <DealerPageHeader
          description="Vehicle inventory could not be loaded."
          title="Inventory"
        />
        <ErrorState message={error.message} />
      </div>
    );
  }

  const vehicles = (data ?? []) as Vehicle[];
  const query = dealershipQuery(dealership);

  return (
    <div className="space-y-6">
      <DealerPageHeader
        actionHref={`/dashboard/dealer/inventory/new${query}`}
        actionLabel="Add vehicle"
        description={`Vehicles for ${dealership.name}. Edit prices, deposits, mileage limits, rental terms, status, and photos.`}
        title="Inventory"
      />
      <StatusMessage error={params.error} message={params.message} />
      {vehicles.length === 0 ? (
        <EmptyState
          actionHref={`/dashboard/dealer/inventory/new${query}`}
          actionLabel="Add vehicle"
          description="Add vehicles to publish monthly rental inventory for customers."
          title="No vehicles found"
        />
      ) : (
        <div className="grid gap-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                        {vehicle.trim ? ` ${vehicle.trim}` : ""}
                      </h2>
                      <StatusBadge status={vehicle.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      VIN {vehicle.vin} · {vehicle.city}, {vehicle.state}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {vehicle.description ?? "No rental terms added yet."}
                    </p>
                  </div>
                  <div className="grid gap-1 rounded-2xl border border-border bg-background/30 p-4 text-sm">
                    <span>
                      <Money value={vehicle.monthly_price} /> / month
                    </span>
                    <span>
                      <Money value={vehicle.deposit} /> deposit
                    </span>
                    <span>
                      {vehicle.mileage_limit ? `${vehicle.mileage_limit} miles` : "No mileage"}{" "}
                      limit
                    </span>
                  </div>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/dealer/inventory/${vehicle.id}/edit`}>
                    Edit vehicle
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
