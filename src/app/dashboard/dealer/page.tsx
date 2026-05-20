import Link from "next/link";

import {
  DealerPageHeader,
  EmptyState,
  ErrorState,
  Money,
  StatCard,
  StatusBadge,
  StatusMessage,
} from "@/components/dealer/dealer-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  dealershipQuery,
  getDealerContext,
  listDealerApplicationsFor,
  listDealerRentalsFor,
  listDealerVehiclesFor,
  type DealerApplication,
  type DealerRental,
  type Vehicle,
} from "@/lib/dealer/dashboard";

type DealerDashboardPageProps = {
  searchParams: Promise<{
    dealership?: string;
    error?: string;
    message?: string;
  }>;
};

export const metadata = {
  title: "Dealer workspace",
};

export default async function DealerDashboardPage({
  searchParams,
}: DealerDashboardPageProps) {
  const params = await searchParams;
  const { dealership } = await getDealerContext(params.dealership);

  if (!dealership) {
    return (
      <div className="space-y-6">
        <DealerPageHeader
          description="Ask an admin to assign your user to an approved dealership before managing inventory, applications, and rentals."
          title="Dealer dashboard"
        />
        <EmptyState
          description="No dealership assignment was found for this account."
          title="No dealership assigned"
        />
      </div>
    );
  }

  const [vehiclesResult, applicationsResult, rentalsResult] = await Promise.all([
    listDealerVehiclesFor(dealership.id),
    listDealerApplicationsFor(dealership.id),
    listDealerRentalsFor(dealership.id),
  ]);

  if (vehiclesResult.error || applicationsResult.error || rentalsResult.error) {
    return (
      <div className="space-y-6">
        <DealerPageHeader
          description="Your operational overview could not be loaded."
          title={dealership.name}
        />
        <ErrorState
          message={
            vehiclesResult.error?.message ??
            applicationsResult.error?.message ??
            rentalsResult.error?.message ??
            "Dashboard data could not be loaded."
          }
        />
      </div>
    );
  }

  const vehicles = (vehiclesResult.data ?? []) as Vehicle[];
  const applications = (applicationsResult.data ?? []) as DealerApplication[];
  const rentals = (rentalsResult.data ?? []) as DealerRental[];
  const query = dealershipQuery(dealership);
  const availableCount = vehicles.filter((vehicle) => vehicle.status === "available").length;
  const pendingCount = applications.filter((application) =>
    ["submitted", "under_review"].includes(application.status),
  ).length;

  return (
    <div className="space-y-6">
      <DealerPageHeader
        actionHref={`/dashboard/dealer/inventory/new${query}`}
        actionLabel="Add vehicle"
        description="Manage inventory, incoming applications, active rentals, and dealership profile details."
        title={dealership.name}
      />
      <StatusMessage error={params.error} message={params.message} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard hint="All statuses" label="Inventory" value={vehicles.length} />
        <StatCard hint="Ready for customers" label="Available" value={availableCount} />
        <StatCard hint="Needs review" label="Applications" value={pendingCount} />
        <StatCard hint="Currently active" label="Rentals" value={rentals.length} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Recent inventory</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/dealer/inventory${query}`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3">
            {vehicles.length === 0 ? (
              <p className="rounded-2xl border border-border bg-background/30 p-4 text-sm text-muted-foreground">
                No vehicles yet. Add your first vehicle to start accepting applications.
              </p>
            ) : (
              vehicles.slice(0, 5).map((vehicle) => (
                <div
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-background/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                  key={vehicle.id}
                >
                  <div>
                    <p className="font-semibold">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <Money value={vehicle.monthly_price} /> / month
                    </p>
                  </div>
                  <StatusBadge status={vehicle.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Applications inbox</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/dealer/applications${query}`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3">
            {applications.length === 0 ? (
              <p className="rounded-2xl border border-border bg-background/30 p-4 text-sm text-muted-foreground">
                New applications for this dealership will appear here.
              </p>
            ) : (
              applications.slice(0, 5).map((application) => (
                <Link
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-background/30 p-4 hover:bg-secondary/50 sm:flex-row sm:items-center sm:justify-between"
                  href={`/dashboard/dealer/applications/${application.id}`}
                  key={application.id}
                >
                  <div>
                    <p className="font-semibold">
                      {application.vehicles
                        ? `${application.vehicles.year} ${application.vehicles.make} ${application.vehicles.model}`
                        : "Vehicle unavailable"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={application.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
