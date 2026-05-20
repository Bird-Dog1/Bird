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
  listDealerApplicationsFor,
  type DealerApplication,
} from "@/lib/dealer/dashboard";

type ApplicationsPageProps = {
  searchParams: Promise<{
    dealership?: string;
    error?: string;
    message?: string;
  }>;
};

export const metadata = {
  title: "Applications inbox",
};

export default async function DealerApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const params = await searchParams;
  const { dealership } = await getDealerContext(params.dealership);

  if (!dealership) {
    return (
      <div className="space-y-6">
        <DealerPageHeader
          description="Applications require an assigned dealership."
          title="Applications inbox"
        />
        <EmptyState
          description="No dealership assignment was found for this account."
          title="No dealership assigned"
        />
      </div>
    );
  }

  const { data, error } = await listDealerApplicationsFor(dealership.id);

  if (error) {
    return (
      <div className="space-y-6">
        <DealerPageHeader
          description="Application data could not be loaded."
          title="Applications inbox"
        />
        <ErrorState message={error.message} />
      </div>
    );
  }

  const applications = (data ?? []) as DealerApplication[];

  return (
    <div className="space-y-6">
      <DealerPageHeader
        description={`Review customer applications for ${dealership.name}, including license and insurance uploads.`}
        title="Applications inbox"
      />
      <StatusMessage error={params.error} message={params.message} />
      {applications.length === 0 ? (
        <EmptyState
          description="Submitted customer applications for this dealership will appear here."
          title="No applications yet"
        />
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold">
                      {application.vehicles
                        ? `${application.vehicles.year} ${application.vehicles.make} ${application.vehicles.model}`
                        : "Vehicle unavailable"}
                    </h2>
                    <StatusBadge status={application.status} />
                  </div>
                  <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-3">
                    <span>
                      Submitted {new Date(application.created_at).toLocaleDateString()}
                    </span>
                    <span>
                      {application.application_documents.length} customer document
                      {application.application_documents.length === 1 ? "" : "s"}
                    </span>
                    <span>
                      {application.vehicles ? (
                        <>
                          <Money value={application.vehicles.monthly_price} /> / month
                        </>
                      ) : (
                        "Vehicle price unavailable"
                      )}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {application.customer_notes ?? "No customer notes provided."}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/dealer/applications/${application.id}`}>
                    Review application
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
