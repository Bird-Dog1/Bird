import { createCustomerApplication } from "@/app/dashboard/actions";
import { FormSection } from "@/components/forms/form-section";
import { SelectField, TextareaField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusMessage } from "@/components/ui/status-message";
import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { type Database } from "@/types/supabase";

export const metadata = {
  title: "Customer workspace",
};

type CustomerDashboardPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function CustomerDashboardPage({
  searchParams,
}: CustomerDashboardPageProps) {
  const { user } = await requireRole(["customer", "admin"]);
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const [vehiclesResult, applicationsResult] = await Promise.all([
    supabase
      .from("vehicles")
      .select(
        "id, year, make, model, city, state, monthly_price, dealerships!inner(approved, suspended)",
      )
      .eq("status", "available")
      .eq("dealerships.approved", true)
      .eq("dealerships.suspended", false)
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("rental_applications")
      .select(
        "id, status, created_at, customer_notes, vehicles(year, make, model), dealerships(name)",
      )
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  const vehicles = (vehiclesResult.data ?? []) as VehicleOption[];
  const applications = (applicationsResult.data ?? []) as CustomerApplication[];
  const hasVehicleOptions = vehicles.length > 0;

  return (
    <div className="space-y-6">
      {params.error ? (
        <StatusMessage tone="error">{params.error}</StatusMessage>
      ) : null}
      {params.message ? (
        <StatusMessage tone="success">{params.message}</StatusMessage>
      ) : null}
      {vehiclesResult.error || applicationsResult.error ? (
        <StatusMessage tone="error">
          Some dashboard data could not be loaded. Refresh the page or try again later.
        </StatusMessage>
      ) : null}
      <FormSection
        description="Submit an application for an available vehicle."
        title="Rental application"
      >
        <form action={createCustomerApplication} className="grid gap-4">
          <SelectField
            disabled={!hasVehicleOptions}
            label="Available vehicle"
            name="vehicle_id"
            required
          >
            <option value="">
              {hasVehicleOptions ? "Select a vehicle" : "No available vehicles"}
            </option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.city},{" "}
                {vehicle.state} - {formatCurrency(vehicle.monthly_price)}/mo
              </option>
            ))}
          </SelectField>
          <TextareaField
            disabled={!hasVehicleOptions}
            label="Customer notes"
            name="customer_notes"
            placeholder="Describe timing, intended use, and any questions for the dealer."
            required
          />
          <SubmitButton disabled={!hasVehicleOptions} pendingLabel="Saving application...">
            Submit application
          </SubmitButton>
        </form>
      </FormSection>
      <Card>
        <CardHeader>
          <CardTitle>Recent applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
            <div className="grid gap-3">
              {applications.map((application) => (
                <div
                  className="rounded-2xl border border-border bg-background/30 p-4"
                  key={application.id}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">
                        {application.vehicles
                          ? `${application.vehicles.year} ${application.vehicles.make} ${application.vehicles.model}`
                          : "Vehicle unavailable"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {application.dealerships?.name ?? "Dealership pending"}
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {application.status.replace("_", " ")}
                    </span>
                  </div>
                  {application.customer_notes ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {application.customer_notes}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              description="Choose an available vehicle above to send your first rental application."
              title="No applications yet"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type VehicleOption = {
  id: string;
  year: number;
  make: string;
  model: string;
  city: string;
  state: string;
  monthly_price: number;
};

type CustomerApplication = {
  id: string;
  status: Database["public"]["Enums"]["application_status"];
  created_at: string;
  customer_notes: string | null;
  vehicles: {
    year: number;
    make: string;
    model: string;
  } | null;
  dealerships: {
    name: string;
  } | null;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}
