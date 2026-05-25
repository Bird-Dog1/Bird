import { SelectField, TextareaField, TextField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Label } from "@/components/ui/label";
import type { Tables } from "@/lib/supabase/database.types";

type Vehicle = Tables<"vehicles">;
type Dealership = Tables<"dealerships">;

type VehicleFormProps = {
  action: (formData: FormData) => Promise<void>;
  dealerships: Dealership[];
  vehicle?: Vehicle;
};

export function VehicleForm({ action, dealerships, vehicle }: VehicleFormProps) {
  return (
    <form action={action} className="grid gap-6">
      {vehicle ? <input name="vehicle_id" type="hidden" value={vehicle.id} /> : null}
      {!vehicle ? (
        <SelectField label="Dealership" name="dealership_id" required>
          <option value="">Select dealership</option>
          {dealerships.map((dealership) => (
            <option key={dealership.id} value={dealership.id}>{dealership.name}</option>
          ))}
        </SelectField>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <TextField defaultValue={vehicle?.vin ?? ""} label="VIN" name="vin" required />
        <TextField defaultValue={vehicle?.year ?? ""} label="Year" name="year" required type="number" />
        <TextField defaultValue={vehicle?.make ?? ""} label="Make" name="make" required />
        <TextField defaultValue={vehicle?.model ?? ""} label="Model" name="model" required />
        <TextField defaultValue={vehicle?.trim ?? ""} label="Trim" name="trim" />
        <TextField defaultValue={vehicle?.vehicle_type ?? ""} label="Vehicle type" name="vehicle_type" />
        <TextField defaultValue={vehicle?.monthly_price ?? ""} label="Monthly price" min="0" name="monthly_price" required step="0.01" type="number" />
        <TextField defaultValue={vehicle?.deposit ?? ""} label="Deposit" min="0" name="deposit" required step="0.01" type="number" />
        <TextField defaultValue={vehicle?.mileage_limit ?? ""} label="Mileage limit" min="1" name="mileage_limit" type="number" />
        <TextField defaultValue={vehicle?.city ?? ""} label="City" name="city" required />
        <TextField defaultValue={vehicle?.state ?? ""} label="State" maxLength={2} name="state" required />
        <TextField defaultValue={vehicle?.minimum_age ?? 21} label="Minimum age" min="0" name="minimum_age" required type="number" />
      </div>
      <SelectField defaultValue={vehicle?.status ?? "unavailable"} label="Status" name="status" required>
        <option value="available">Available</option>
        <option value="pending">Pending</option>
        <option value="rented">Rented</option>
        <option value="unavailable">Unavailable</option>
      </SelectField>
      <div className="grid gap-3 md:grid-cols-2">
        <CheckboxField defaultChecked={vehicle?.rideshare_allowed ?? false} label="Rideshare allowed" name="rideshare_allowed" />
        <CheckboxField defaultChecked={vehicle?.insurance_required ?? true} label="Insurance required" name="insurance_required" />
      </div>
      <TextareaField defaultValue={vehicle?.description ?? ""} label="Rental terms and description" name="description" rows={5} />
      <div className="space-y-2.5">
        <Label htmlFor="photos">Vehicle photos</Label>
        <input accept="image/jpeg,image/png,image/webp" className="flex min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground shadow-inner shadow-black/20 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" id="photos" multiple name="photos" type="file" />
        <p className="text-xs leading-5 text-muted-foreground">Uploads are stored in the private vehicle-photos bucket.</p>
      </div>
      <SubmitButton pendingLabel="Saving vehicle...">{vehicle ? "Save vehicle" : "Add vehicle"}</SubmitButton>
    </form>
  );
}

function CheckboxField({ defaultChecked, label, name }: { defaultChecked: boolean; label: string; name: string }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-muted-foreground hover:border-white/20 hover:text-foreground">
      <input className="h-4 w-4 accent-primary" defaultChecked={defaultChecked} name={name} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}
