import { SelectField, TextareaField, TextField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { type Dealership, type Vehicle, vehicleStatuses } from "@/lib/dealer/dashboard";

type VehicleFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  dealerships: Dealership[];
  defaultDealershipId?: string;
  vehicle?: Vehicle;
  submitLabel: string;
  pendingLabel: string;
};

export function VehicleForm({
  action,
  defaultDealershipId,
  dealerships,
  vehicle,
  submitLabel,
  pendingLabel,
}: VehicleFormProps) {
  return (
    <form action={action} className="grid gap-5">
      {vehicle ? <input name="vehicle_id" type="hidden" value={vehicle.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          defaultValue={vehicle?.dealership_id ?? defaultDealershipId ?? dealerships[0]?.id}
          label="Dealership"
          name="dealership_id"
          required
        >
          {dealerships.map((dealership) => (
            <option key={dealership.id} value={dealership.id}>
              {dealership.name}
            </option>
          ))}
        </SelectField>
        <SelectField defaultValue={vehicle?.status ?? "available"} label="Status" name="status">
          {vehicleStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replace("_", " ")}
            </option>
          ))}
        </SelectField>
        <TextField defaultValue={vehicle?.vin} label="VIN" name="vin" required />
        <TextField
          defaultValue={vehicle?.year}
          label="Year"
          min={1886}
          name="year"
          required
          type="number"
        />
        <TextField defaultValue={vehicle?.make} label="Make" name="make" required />
        <TextField defaultValue={vehicle?.model} label="Model" name="model" required />
        <TextField defaultValue={vehicle?.trim ?? ""} label="Trim" name="trim" />
        <SelectField
          defaultValue={vehicle?.vehicle_type ?? ""}
          label="Vehicle type"
          name="vehicle_type"
        >
          <option value="">Select type</option>
          <option value="sedan">Sedan</option>
          <option value="suv">SUV</option>
          <option value="truck">Truck</option>
          <option value="van">Van</option>
          <option value="other">Other</option>
        </SelectField>
        <TextField defaultValue={vehicle?.city} label="City" name="city" required />
        <TextField
          defaultValue={vehicle?.state}
          label="State"
          maxLength={2}
          name="state"
          required
        />
        <TextField
          defaultValue={vehicle?.monthly_price}
          label="Monthly price"
          min={0}
          name="monthly_price"
          required
          step="0.01"
          type="number"
        />
        <TextField
          defaultValue={vehicle?.deposit}
          label="Deposit"
          min={0}
          name="deposit"
          step="0.01"
          type="number"
        />
        <TextField
          defaultValue={vehicle?.mileage_limit ?? ""}
          label="Mileage limit"
          min={1}
          name="mileage_limit"
          type="number"
        />
        <TextField
          defaultValue={vehicle?.minimum_age}
          label="Minimum renter age"
          min={0}
          name="minimum_age"
          type="number"
        />
      </div>
      <TextareaField
        defaultValue={vehicle?.description ?? ""}
        label="Rental terms"
        name="description"
        placeholder="Describe rental terms, pickup expectations, maintenance rules, and permitted use."
      />
      <div className="grid gap-3 rounded-2xl border border-border bg-background/30 p-4 sm:grid-cols-2">
        <label className="flex items-center gap-3 text-sm">
          <input
            className="size-4"
            defaultChecked={vehicle?.rideshare_allowed ?? false}
            name="rideshare_allowed"
            type="checkbox"
          />
          Rideshare allowed
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            className="size-4"
            defaultChecked={vehicle?.insurance_required ?? true}
            name="insurance_required"
            type="checkbox"
          />
          Insurance upload required
        </label>
      </div>
      <SubmitButton pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
    </form>
  );
}
