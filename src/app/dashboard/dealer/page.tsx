import { createDealerVehicle } from "@/app/dashboard/actions";
import { FormSection } from "@/components/forms/form-section";
import { SelectField, TextareaField, TextField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
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
            <SelectField label="Listing status" name="status" required>
              <option value="draft">Draft</option>
              <option value="available">Available</option>
            </SelectField>
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
            <TextField label="Vehicle type" name="vehicle_type" placeholder="SUV, sedan, truck" />
            <TextField label="City" name="city" />
            <TextField label="State" maxLength={2} name="state" />
            <TextField label="Mileage" min={0} name="mileage" type="number" />
            <TextField
              label="Monthly price"
              min={0}
              name="monthly_price"
              type="number"
            />
            <TextField label="Deposit" min={0} name="deposit_amount" type="number" />
            <TextField label="Mileage limit per month" min={0} name="mileage_limit" type="number" />
            <TextField label="Minimum age" min={18} name="minimum_age" required type="number" defaultValue={21} />
            <SelectField label="Insurance requirement" name="insurance_required" required>
              <option value="true">Valid active insurance required</option>
              <option value="false">Ask dealership</option>
            </SelectField>
            <SelectField label="Rideshare allowed" name="rideshare_allowed" required>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </SelectField>
            <TextField label="Dealership name" name="dealership_name" />
            <TextField label="Dealership phone" name="dealership_phone" type="tel" />
            <TextField label="Dealership email" name="dealership_email" type="email" />
          </div>
          <TextareaField
            label="Vehicle description"
            name="description"
            placeholder="Add customer-facing listing details."
          />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="vehicle_photos">
              Vehicle photo uploads
            </label>
            <Input
              accept="image/*"
              id="vehicle_photos"
              multiple
              name="vehicle_photos"
              type="file"
            />
            <p className="text-xs text-muted-foreground">
              Upload public listing photos to the Supabase vehicle-photos bucket.
            </p>
          </div>
          <TextareaField
            hint="Paste public Supabase Storage URLs or other public image URLs, one per line."
            label="Photo URLs"
            name="photo_urls"
          />
          <SubmitButton pendingLabel="Saving vehicle...">Save vehicle</SubmitButton>
        </form>
      </FormSection>
    </div>
  );
}
