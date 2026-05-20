import { createCustomerApplication } from "@/app/dashboard/actions";
import { FormSection } from "@/components/forms/form-section";
import { SelectField, TextareaField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  formatCurrency,
  type VehicleListing,
  vehicleTitle,
} from "@/components/vehicles/vehicle-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { listAvailableVehicles, listCustomerApplications } from "@/lib/supabase/queries";

export const metadata = {
  title: "Customer workspace",
};

type CustomerDashboardPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    vehicle_id?: string;
  }>;
};

type QueryResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

type CustomerApplication = {
  id: string;
  status: string;
  customer_notes: string | null;
  dealer_notes: string | null;
  created_at: string;
  vehicles: Pick<
    VehicleListing,
    "id" | "year" | "make" | "model" | "trim" | "monthly_price" | "city" | "state"
  > | null;
  dealerships: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
};

export default async function CustomerDashboardPage({
  searchParams,
}: CustomerDashboardPageProps) {
  const { user } = await requireRole(["customer", "admin"]);
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const [vehicleResult, applicationResult] = await Promise.all([
    listAvailableVehicles(supabase, { limit: 50 }) as unknown as Promise<
      QueryResult<VehicleListing[]>
    >,
    listCustomerApplications(supabase, user.id, { limit: 10 }) as unknown as Promise<
      QueryResult<CustomerApplication[]>
    >,
  ]);
  const vehicles = vehicleResult.data ?? [];
  const applications = applicationResult.data ?? [];
  const queryError = vehicleResult.error?.message ?? applicationResult.error?.message;

  return (
    <div className="space-y-6">
      {params.error ? (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {params.error}
        </p>
      ) : null}
      {params.message ? (
        <p className="rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm text-accent">
          {params.message}
        </p>
      ) : null}
      {queryError ? (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {queryError}
        </p>
      ) : null}
      <FormSection
        description="Pick an approved live listing and tell the dealer about your rental needs."
        title="Rental application"
      >
        <form action={createCustomerApplication} className="grid gap-4">
          <SelectField
            defaultValue={params.vehicle_id ?? ""}
            disabled={vehicles.length === 0}
            label="Available vehicle"
            name="vehicle_id"
            required
          >
            <option value="">
              {vehicles.length > 0 ? "Select a vehicle" : "No approved vehicles available"}
            </option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicleTitle(vehicle)} - {vehicle.city}, {vehicle.state} -{" "}
                {formatCurrency(vehicle.monthly_price)}/mo
              </option>
            ))}
          </SelectField>
          <TextareaField
            label="Customer notes"
            name="customer_notes"
            placeholder="Describe timing, intended use, and any questions for the dealer."
            required
          />
          <SubmitButton disabled={vehicles.length === 0} pendingLabel="Saving application...">
            Submit application
          </SubmitButton>
        </form>
      </FormSection>
      <Card>
        <CardHeader>
          <CardTitle>Recent applications</CardTitle>
          <CardDescription>Track submissions and dealer responses.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Applications you submit from live inventory will appear here.
            </p>
          ) : (
            applications.map((application) => (
              <div
                className="rounded-2xl border border-border bg-background/30 p-4"
                key={application.id}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold">
                      {application.vehicles ? vehicleTitle(application.vehicles) : "Vehicle"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {application.dealerships?.name ?? "Dealership"} •{" "}
                      {application.vehicles?.city}, {application.vehicles?.state}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                    {formatStatus(application.status)}
                  </span>
                </div>
                {application.dealer_notes ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Dealer note: {application.dealer_notes}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}
