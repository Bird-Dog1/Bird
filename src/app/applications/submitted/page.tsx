import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { formatMoney, formatVehicleTitle, statusLabels } from "@/lib/marketplace/format";
import { getCustomerApplicationById } from "@/lib/marketplace/queries";

type SubmittedPageProps = {
  searchParams: Promise<{
    id?: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Application submitted",
};

export default async function SubmittedPage({ searchParams }: SubmittedPageProps) {
  const { user } = await requireRole(["customer", "admin"], "/applications/submitted");
  const params = await searchParams;
  const { application, error } = params.id
    ? await getCustomerApplicationById(user.id, params.id)
    : { application: null, error: null };
  const vehicle = application?.dealer_vehicles;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full">
        <CardContent className="space-y-6 p-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-accent" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Application submitted</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Approval is not guaranteed. Final approval, contract, and payment
              are handled by the dealership.
            </p>
          </div>

          {error ? (
            <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
              We submitted your application, but could not load the receipt:
              {" "}
              {error}
            </p>
          ) : application ? (
            <div className="rounded-3xl border border-border bg-background/30 p-5 text-left">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-xl font-semibold">
                {statusLabels[application.status] ?? application.status}
              </p>
              {vehicle ? (
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <p>
                    <span className="block text-muted-foreground">Vehicle</span>
                    {formatVehicleTitle(vehicle)}
                  </p>
                  <p>
                    <span className="block text-muted-foreground">Monthly</span>
                    {formatMoney(vehicle.monthly_price)}
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="rounded-2xl border border-border bg-background/30 p-4 text-sm text-muted-foreground">
              Your submitted applications are available in your account.
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/applications">View my applications</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/vehicles">Browse more vehicles</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
