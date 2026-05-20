import { createCustomerApplication } from "@/app/dashboard/actions";
import { FormSection } from "@/components/forms/form-section";
import {
  SelectField,
  TextareaField,
  TextField,
} from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { requireRole } from "@/lib/auth/guards";

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
  await requireRole(["customer", "admin"]);
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
        description="Foundation form for real monthly vehicle applications."
        title="Customer application"
      >
        <form action={createCustomerApplication} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Monthly budget" min={0} name="monthly_budget" required type="number" />
            <SelectField label="Primary use" name="primary_use" required>
              <option value="">Select use</option>
              <option value="rideshare">Uber or Lyft</option>
              <option value="personal">Personal transportation</option>
              <option value="between_vehicles">Between vehicles</option>
            </SelectField>
          </div>
          <TextareaField
            label="Transportation needs"
            name="transportation_needs"
            placeholder="Describe timing, vehicle type, and location requirements."
            required
          />
          <SubmitButton pendingLabel="Saving application...">
            Submit application
          </SubmitButton>
        </form>
      </FormSection>
    </div>
  );
}
