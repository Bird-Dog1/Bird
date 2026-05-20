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
  getDealerContext,
  listDealerRentalsFor,
  type DealerRental,
} from "@/lib/dealer/dashboard";

type RentalsPageProps = {
  searchParams: Promise<{
    dealership?: string;
    error?: string;
    message?: string;
  }>;
};

export const metadata = {
  title: "Active rentals",
};

export default async function DealerRentalsPage({ searchParams }: RentalsPageProps) {
  const params = await searchParams;
  const { dealership } = await getDealerContext(params.dealership);

  if (!dealership) {
    return (
      <div className="space-y-6">
        <DealerPageHeader
          description="Rentals require an assigned dealership."
          title="Active rentals"
        />
        <EmptyState
          description="No dealership assignment was found for this account."
          title="No dealership assigned"
        />
      </div>
    );
  }

  const { data, error } = await listDealerRentalsFor(dealership.id);

  if (error) {
    return (
      <div className="space-y-6">
        <DealerPageHeader description="Active rentals could not be loaded." title="Active rentals" />
        <ErrorState message={error.message} />
      </div>
    );
  }

  const rentals = (data ?? []) as DealerRental[];

  return (
    <div className="space-y-6">
      <DealerPageHeader
        description={`Active monthly rentals for ${dealership.name}.`}
        title="Active rentals"
      />
      <StatusMessage error={params.error} message={params.message} />
      {rentals.length === 0 ? (
        <EmptyState
          description="Approved applications converted into rentals will appear here."
          title="No active rentals"
        />
      ) : (
        <div className="grid gap-4">
          {rentals.map((rental) => (
            <Card key={rental.id}>
              <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold">
                      {rental.vehicles
                        ? `${rental.vehicles.year} ${rental.vehicles.make} ${rental.vehicles.model}`
                        : "Vehicle unavailable"}
                    </h2>
                    <StatusBadge status={rental.active ? "active" : "ended"} />
                  </div>
                  <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-3">
                    <span>
                      Customer{" "}
                      {rental.profiles?.full_name ?? rental.profiles?.email ?? rental.customer_id}
                    </span>
                    <span>Started {new Date(rental.start_date).toLocaleDateString()}</span>
                    <span>
                      <Money value={rental.monthly_rate} /> / month ·{" "}
                      <Money value={rental.deposit} /> deposit
                    </span>
                  </div>
                </div>
                {rental.application_id ? (
                  <Button asChild variant="outline">
                    <Link href={`/dashboard/dealer/applications/${rental.application_id}`}>
                      View application
                    </Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
