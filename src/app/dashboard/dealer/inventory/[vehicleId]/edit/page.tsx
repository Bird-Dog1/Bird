import { updateDealerVehicle, uploadDealerVehiclePhoto } from "@/app/dashboard/actions";
import {
  DealerPageHeader,
  EmptyState,
  StatusMessage,
} from "@/components/dealer/dealer-shell";
import { VehicleForm } from "@/components/dealer/vehicle-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormSection } from "@/components/forms/form-section";
import { TextField } from "@/components/forms/form-field";
import {
  createVehiclePhotoSignedUrls,
  getDealerContext,
  requireDealerVehicle,
} from "@/lib/dealer/dashboard";

type EditVehiclePageProps = {
  params: Promise<{
    vehicleId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export const metadata = {
  title: "Edit vehicle",
};

export default async function EditDealerVehiclePage({
  params,
  searchParams,
}: EditVehiclePageProps) {
  const [{ vehicleId }, query] = await Promise.all([params, searchParams]);
  const { supabase, vehicle } = await requireDealerVehicle(vehicleId);
  const { dealerships } = await getDealerContext(vehicle.dealership_id);
  const photos = await createVehiclePhotoSignedUrls(supabase, vehicle.vehicle_photos);

  return (
    <div className="space-y-6">
      <DealerPageHeader
        description="Update vehicle pricing, deposit, mileage, rental terms, status, and photos."
        title={`Edit ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
      />
      <StatusMessage error={query.error} message={query.message} />
      {dealerships.length === 0 ? (
        <EmptyState
          description="No dealership assignment was found for this account."
          title="No dealership assigned"
        />
      ) : (
        <>
          <FormSection
            description="Changes are written directly to Supabase inventory."
            title="Vehicle details"
          >
            <VehicleForm
              action={updateDealerVehicle}
              dealerships={dealerships}
              pendingLabel="Updating vehicle..."
              submitLabel="Update vehicle"
              vehicle={vehicle}
            />
          </FormSection>
          <FormSection
            description="Photos upload to the private vehicle-photos bucket and are displayed with signed URLs."
            title="Vehicle photos"
          >
            <div className="grid gap-5">
              {photos.length === 0 ? (
                <p className="rounded-2xl border border-border bg-background/30 p-4 text-sm text-muted-foreground">
                  No photos uploaded yet.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {photos.map((photo) => (
                    <div
                      className="overflow-hidden rounded-2xl border border-border bg-background/30"
                      key={photo.id}
                    >
                      {photo.signedUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt="Vehicle upload"
                          className="h-44 w-full object-cover"
                          src={photo.signedUrl}
                        />
                      ) : (
                        <div className="grid h-44 place-items-center text-sm text-muted-foreground">
                          Photo preview unavailable
                        </div>
                      )}
                      <p className="p-3 text-xs text-muted-foreground">
                        Sort order {photo.sort_order}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <form action={uploadDealerVehiclePhoto} className="grid gap-4">
                <input name="vehicle_id" type="hidden" value={vehicle.id} />
                <TextField
                  accept="image/jpeg,image/png,image/webp"
                  label="Upload photo"
                  name="photo"
                  required
                  type="file"
                />
                <SubmitButton pendingLabel="Uploading photo...">Upload photo</SubmitButton>
              </form>
            </div>
          </FormSection>
        </>
      )}
    </div>
  );
}
