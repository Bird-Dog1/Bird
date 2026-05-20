import { createCustomerApplication } from "@/app/dashboard/actions";
import { FormSection } from "@/components/forms/form-section";
import { TextareaField, TextField } from "@/components/forms/form-field";
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
        description="Submit an application for an available vehicle."
        title="Rental application"
      >
        <form action={createCustomerApplication} className="grid gap-4">
          <TextField label="Vehicle ID" name="vehicle_id" required />
          <TextareaField
            label="Customer notes"
            name="customer_notes"
            placeholder="Describe timing, intended use, and any questions for the dealer."
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
