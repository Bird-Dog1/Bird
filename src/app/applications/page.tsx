import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import {
  formatLocation,
  formatMoney,
  formatVehicleTitle,
  primaryUseLabels,
  statusLabels,
} from "@/lib/marketplace/format";
import { getCustomerApplications, type ApplicationWithVehicle } from "@/lib/marketplace/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My applications",
};

export default async function ApplicationsPage() {
  const { user } = await requireRole(["customer", "admin"], "/applications");
  const { applications, error } = await getCustomerApplications(user.id);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            My applications
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Track your rental applications.
          </h1>
        </div>
        <Button asChild>
          <Link href="/vehicles">Browse vehicles</Link>
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive-foreground">
            We could not load your applications: {error}
          </CardContent>
        </Card>
      ) : applications.length > 0 ? (
        <div className="grid gap-5">
          {applications.map((application) => (
            <ApplicationCard application={application} key={application.id} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <ClipboardList className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <h2 className="text-xl font-semibold">No applications yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Submit a rental application from an available vehicle listing.
            </p>
            <Button asChild className="mt-5">
              <Link href="/vehicles">Find a vehicle</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

function ApplicationCard({ application }: { application: ApplicationWithVehicle }) {
  const vehicle = application.dealer_vehicles;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>
            {vehicle ? formatVehicleTitle(vehicle) : "General rental application"}
          </CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Submitted {new Date(application.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className="w-fit rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
          {statusLabels[application.status] ?? application.status}
        </span>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <ApplicationFact label="Primary use" value={primaryUseLabels[application.primary_use ?? ""] ?? "Not provided"} />
        <ApplicationFact label="Monthly budget" value={formatMoney(application.monthly_budget)} />
        <ApplicationFact
          label="Vehicle monthly"
          value={vehicle ? formatMoney(vehicle.monthly_price) : "No vehicle selected"}
        />
        <ApplicationFact
          label="Dealership"
          value={vehicle?.dealership_name ?? (vehicle ? formatLocation(vehicle) : "Pending match")}
        />
      </CardContent>
    </Card>
  );
}

function ApplicationFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/30 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}
