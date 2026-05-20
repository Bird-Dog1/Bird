import { createDealerVehicle } from "@/app/dashboard/actions";
import { FormSection } from "@/components/forms/form-section";
import { SelectField, TextField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { requireRole } from "@/lib/auth/guards";

type DealerDashboardPageProps = {
  searchParams: Promise<{
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
  await requireRole(["dealer", "admin"]);
  const params = await searchParams;

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
      <FormSection
        description="Add available monthly rental vehicles for your assigned dealership."
        title="Vehicle inventory intake"
      >
        <form action={createDealerVehicle} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Dealership ID" name="dealership_id" required />
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
          <SubmitButton pendingLabel="Saving vehicle...">Save vehicle</SubmitButton>
        </form>
      </FormSection>
    </div>
  );
}
