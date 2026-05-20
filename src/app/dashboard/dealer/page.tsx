import { createDealerVehicle } from "@/app/dashboard/actions";
import { FormSection } from "@/components/forms/form-section";
import { SelectField, TextField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  formatCurrency,
  type VehicleDealership,
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
import { listDealerApplications, listDealerVehicles } from "@/lib/supabase/queries";

type DealerDashboardPageProps = {
  searchParams: Promise<{
    error?: string;
    dealership_id?: string;
    message?: string;
  }>;
};

type QueryResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

type DealerMembership = {
  dealership_id: string;
  dealerships: VehicleDealership | VehicleDealership[] | null;
};

type DealerApplication = {
  id: string;
  status: string;
  created_at: string;
  customer_notes: string | null;
  vehicles: Pick<VehicleListing, "id" | "year" | "make" | "model" | "trim" | "city" | "state"> | null;
};

export const metadata = {
  title: "Dealer workspace",
};

export default async function DealerDashboardPage({
  searchParams,
}: DealerDashboardPageProps) {
  const { profile, user } = await requireRole(["dealer", "admin"]);
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const dealerships = await getDealerships(supabase, user.id, profile.role === "admin");
  const selectedDealershipId = params.dealership_id ?? dealerships[0]?.id ?? "";
  const [vehicleResult, applicationResult] = selectedDealershipId
    ? await Promise.all([
        listDealerVehicles(supabase, selectedDealershipId, { limit: 20 }) as unknown as Promise<
          QueryResult<VehicleListing[]>
        >,
        listDealerApplications(supabase, selectedDealershipId, { limit: 10 }) as unknown as Promise<
          QueryResult<DealerApplication[]>
        >,
      ])
    : [
        { data: [], error: null },
        { data: [], error: null },
      ];
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
      <Card>
        <CardHeader>
          <CardTitle>Assigned dealerships</CardTitle>
          <CardDescription>
            Select the dealership you are managing before adding vehicles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dealerships.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No dealership assignments found. Ask an admin to approve a dealership and assign
              your user before listing inventory.
            </p>
          ) : (
            <form className="grid gap-3 sm:grid-cols-[1fr_auto]" action="/dashboard/dealer">
              <SelectField
                defaultValue={selectedDealershipId}
                label="Dealership"
                name="dealership_id"
              >
                {dealerships.map((dealership) => (
                  <option key={dealership.id} value={dealership.id}>
                    {dealership.name} - {dealership.city}, {dealership.state}
                    {dealership.approved ? "" : " (pending approval)"}
                  </option>
                ))}
              </SelectField>
              <SubmitButton className="self-end" pendingLabel="Loading...">
                Load
              </SubmitButton>
            </form>
          )}
        </CardContent>
      </Card>
      <FormSection
        description="Add available monthly rental vehicles for your assigned dealership."
        title="Vehicle inventory intake"
      >
        <form action={createDealerVehicle} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              defaultValue={selectedDealershipId}
              disabled={dealerships.length === 0}
              label="Dealership"
              name="dealership_id"
              required
            >
              <option value="">
                {dealerships.length > 0 ? "Select dealership" : "No assignments available"}
              </option>
              {dealerships.map((dealership) => (
                <option key={dealership.id} value={dealership.id}>
                  {dealership.name} - {dealership.city}, {dealership.state}
                </option>
              ))}
            </SelectField>
            <TextField label="VIN" name="vin" required />
            <SelectField label="Vehicle type" name="vehicle_type" required>
              <option value="">Select type</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="other">Other</option>
            </SelectField>
            <TextField label="Year" min={1980} name="year" required type="number" />
            <TextField label="Make" name="make" required />
            <TextField label="Model" name="model" required />
            <TextField label="City" name="city" required />
            <TextField label="State" maxLength={2} name="state" required />
            <TextField label="Mileage limit" min={1} name="mileage_limit" type="number" />
            <TextField
              label="Monthly price"
              min={0}
              name="monthly_price"
              required
              type="number"
            />
            <TextField label="Deposit" min={0} name="deposit" type="number" />
          </div>
          <SubmitButton disabled={dealerships.length === 0} pendingLabel="Saving vehicle...">
            Save vehicle
          </SubmitButton>
        </form>
      </FormSection>
      <Card>
        <CardHeader>
          <CardTitle>Current inventory</CardTitle>
          <CardDescription>Recent vehicles for the selected dealership.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {vehicles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Vehicles saved for this dealership will appear here.
            </p>
          ) : (
            vehicles.map((vehicle) => (
              <div
                className="rounded-2xl border border-border bg-background/30 p-4"
                key={vehicle.id}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold">{vehicleTitle(vehicle)}</p>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.city}, {vehicle.state} • {formatCurrency(vehicle.monthly_price)}/mo
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                    {vehicle.status ?? "available"}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent applications</CardTitle>
          <CardDescription>Customer submissions for the selected dealership.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Customer applications for this dealership will appear here.
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
                      {application.customer_notes ?? "No customer note provided."}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                    {application.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getDealerships(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, userId: string, isAdmin: boolean) {
  if (isAdmin) {
    const { data } = await supabase
      .from("dealerships")
      .select("id,name,city,state,phone,website,approved,suspended")
      .order("name", { ascending: true });

    return (data ?? []) as VehicleDealership[];
  }

  const { data } = await supabase
    .from("dealer_users")
    .select(
      "dealership_id, dealerships (id, name, city, state, phone, website, approved, suspended)",
    )
    .eq("user_id", userId);

  return ((data ?? []) as DealerMembership[])
    .map((membership) => {
      const dealership = Array.isArray(membership.dealerships)
        ? membership.dealerships[0]
        : membership.dealerships;

      return dealership;
    })
    .filter((dealership): dealership is VehicleDealership => Boolean(dealership));
}
