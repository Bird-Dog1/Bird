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
        description="Add eligible vehicles from aged, punched, R-unit, service-loaner, or extra inventory."
        title="Dealer inventory intake"
      >
        <form action={createDealerVehicle} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="VIN" name="vin" required />
            <SelectField label="Inventory type" name="inventory_type" required>
              <option value="">Select type</option>
              <option value="aged_inventory">Aged inventory</option>
              <option value="punched_unit">Punched unit</option>
              <option value="r_unit">R unit</option>
              <option value="service_loaner">Service loaner</option>
              <option value="extra_vehicle">Extra vehicle</option>
            </SelectField>
            <TextField label="Year" min={1980} name="year" required type="number" />
            <TextField label="Make" name="make" required />
            <TextField label="Model" name="model" required />
            <TextField label="Mileage" min={0} name="mileage" type="number" />
            <TextField
              label="Monthly price"
              min={0}
              name="monthly_price"
              type="number"
            />
          </div>
          <SubmitButton pendingLabel="Saving vehicle...">Save vehicle</SubmitButton>
        </form>
      </FormSection>
    </div>
  );
}
