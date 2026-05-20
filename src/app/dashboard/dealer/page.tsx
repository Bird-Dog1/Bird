import { createDealerVehicle } from "@/app/dashboard/actions";
import { FormSection } from "@/components/forms/form-section";
import { SelectField, TextField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusMessage } from "@/components/ui/status-message";
import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type DealerDashboardPageProps = {
  searchParams: Promise<{
    dealership_id?: string;
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
  const { profile, user } = await requireRole(["dealer", "admin"]);
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const dealershipOptions =
    profile.role === "admin"
      ? (((await supabase
          .from("dealerships")
          .select("id, name, city, state")
          .order("name", { ascending: true })).data ?? []) as DealershipOption[])
      : (((await supabase
          .from("dealer_users")
          .select("dealerships(id, name, city, state)")
          .eq("user_id", user.id)).data ?? []) as DealerUserDealership[])
          .map((row) => row.dealerships)
          .filter(isDealershipOption);
  const selectedDealership =
    dealershipOptions.find((dealership) => dealership.id === params.dealership_id) ??
    dealershipOptions[0] ??
    null;
  const vehiclesResult = selectedDealership
    ? await supabase
        .from("vehicles")
        .select("id, vin, year, make, model, city, state, monthly_price, status")
        .eq("dealership_id", selectedDealership.id)
        .order("created_at", { ascending: false })
        .limit(25)
    : null;
  const vehicles = (vehiclesResult?.data ?? []) as DealerVehicle[];
  const canCreateVehicle = dealershipOptions.length > 0;

  return (
    <div className="space-y-6">
      {params.error ? (
        <StatusMessage tone="error">{params.error}</StatusMessage>
      ) : null}
      {params.message ? (
        <StatusMessage tone="success">{params.message}</StatusMessage>
      ) : null}
      {vehiclesResult?.error ? (
        <StatusMessage tone="error">
          Inventory could not be loaded. Refresh the page or try again later.
        </StatusMessage>
      ) : null}
      <FormSection
        description="Add available monthly rental vehicles for your assigned dealership."
        title="Vehicle inventory intake"
      >
        <form action={createDealerVehicle} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              defaultValue={selectedDealership?.id ?? ""}
              disabled={!canCreateVehicle}
              label="Dealership"
              name="dealership_id"
              required
            >
              <option value="">
                {canCreateVehicle ? "Select dealership" : "No dealership assignment"}
              </option>
              {dealershipOptions.map((dealership) => (
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
          <SubmitButton disabled={!canCreateVehicle} pendingLabel="Saving vehicle...">
            Save vehicle
          </SubmitButton>
        </form>
      </FormSection>
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDealership ? `${selectedDealership.name} inventory` : "Inventory"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedDealership ? (
            <EmptyState
              description="An admin must assign your account to a dealership before you can add vehicles."
              title="No dealership assignment"
            />
          ) : vehicles.length > 0 ? (
            <div className="grid gap-3">
              {vehicles.map((vehicle) => (
                <div
                  className="rounded-2xl border border-border bg-background/30 p-4"
                  key={vehicle.id}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.vin} - {vehicle.city}, {vehicle.state} -{" "}
                        {formatCurrency(vehicle.monthly_price)}/mo
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {vehicle.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              description="Add your first available monthly rental vehicle with the intake form."
              title="No vehicles yet"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type DealershipOption = {
  id: string;
  name: string;
  city: string;
  state: string;
};

type DealerUserDealership = {
  dealerships: DealershipOption | null;
};

type DealerVehicle = {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  city: string;
  state: string;
  monthly_price: number;
  status: string;
};

function isDealershipOption(value: DealershipOption | null): value is DealershipOption {
  return Boolean(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}
