import { createDealerVehicle } from "@/app/dashboard/actions";
import { DealerPageHeader, EmptyState, StatusMessage } from "@/components/dealer/dealer-shell";
import { VehicleForm } from "@/components/dealer/vehicle-form";
import { FormSection } from "@/components/forms/form-section";
import { getDealerContext } from "@/lib/dealer/dashboard";

type NewVehiclePageProps = {
  searchParams: Promise<{
    dealership?: string;
    error?: string;
    message?: string;
  }>;
};

export const metadata = {
  title: "Add vehicle",
};

export default async function NewDealerVehiclePage({ searchParams }: NewVehiclePageProps) {
  const params = await searchParams;
  const { dealerships, dealership } = await getDealerContext(params.dealership);

  return (
    <div className="space-y-6">
      <DealerPageHeader
        description="Create a real Supabase inventory record with pricing, deposit, mileage limit, rental terms, and availability status."
        title="Add vehicle"
      />
      <StatusMessage error={params.error} message={params.message} />
      {!dealership ? (
        <EmptyState
          description="No dealership assignment was found for this account."
          title="No dealership assigned"
        />
      ) : (
        <FormSection
          description="Vehicle details are saved to your assigned dealership inventory."
          title="Vehicle details"
        >
          <VehicleForm
            action={createDealerVehicle}
            defaultDealershipId={dealership.id}
            dealerships={dealerships}
            pendingLabel="Saving vehicle..."
            submitLabel="Save vehicle"
          />
        </FormSection>
      )}
    </div>
  );
}
