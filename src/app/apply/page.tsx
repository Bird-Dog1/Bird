import Link from "next/link";
import { type Route } from "next";
import { AlertTriangle, ArrowLeft, Upload } from "lucide-react";

import { submitRentalApplication } from "@/app/apply/actions";
import { TextareaField, TextField, SelectField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { VehiclePhoto } from "@/components/marketplace/vehicle-photo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { formatLocation, formatMoney, formatVehicleTitle } from "@/lib/marketplace/format";
import { getAvailableVehicleById } from "@/lib/marketplace/queries";

type ApplyPageProps = {
  searchParams: Promise<{
    vehicle?: string;
    error?: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Apply",
};

export default async function ApplyPage({ searchParams }: ApplyPageProps) {
  const params = await searchParams;
  const nextPath = (params.vehicle ? `/apply?vehicle=${params.vehicle}` : "/apply") as Route;
  await requireRole(["customer", "admin"], nextPath);
  const { vehicle, error } = params.vehicle
    ? await getAvailableVehicleById(params.vehicle)
    : { vehicle: null, error: null };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Button asChild className="mb-6" variant="ghost">
        <Link href={params.vehicle ? `/vehicles/${params.vehicle}` : "/vehicles"}>
          <ArrowLeft className="h-4 w-4" />
          Back to vehicles
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Rental application
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Submit your customer application.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Approval is not guaranteed. Valid license and active insurance
              required. Final approval, contract, and payment are handled by the
              dealership.
            </p>
          </div>

          {params.error ? (
            <div className="flex gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
              <AlertTriangle className="h-5 w-5 flex-none" />
              <p>{params.error}</p>
            </div>
          ) : null}

          {error ? (
            <Card>
              <CardContent className="p-5 text-sm text-destructive-foreground">
                We could not load the selected vehicle: {error}
              </CardContent>
            </Card>
          ) : vehicle ? (
            <Card className="overflow-hidden">
              <VehiclePhoto className="min-h-52 rounded-none" vehicle={vehicle} />
              <CardContent className="space-y-2 p-5">
                <h2 className="text-2xl font-semibold">{formatVehicleTitle(vehicle)}</h2>
                <p className="text-sm text-muted-foreground">{formatLocation(vehicle)}</p>
                <p className="font-semibold">{formatMoney(vehicle.monthly_price)} / month</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                Select a vehicle from browse to attach it to this application, or
                submit your requirements for dealership review.
              </CardContent>
            </Card>
          )}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Application details</CardTitle>
            <CardDescription>
              Upload the required documents and tell the dealership what you need.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={submitRentalApplication} className="grid gap-4">
              {vehicle ? <input name="vehicle_id" type="hidden" value={vehicle.id} /> : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Phone" name="applicant_phone" required type="tel" />
                <TextField label="Monthly budget" min={0} name="monthly_budget" required type="number" />
                <TextField label="City" name="applicant_city" required />
                <TextField label="State" maxLength={2} name="applicant_state" required />
                <TextField label="Desired start date" name="desired_start_date" required type="date" />
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
                placeholder="Describe timing, vehicle type, mileage needs, and location requirements."
                required
              />
              <TextField label="Employment status" name="employment_status" required />
              <TextareaField
                label="Notes for dealership"
                name="notes"
                placeholder="Add anything the dealership should know before review."
              />
              <DocumentField label="Driver's license" name="driver_license" />
              <DocumentField label="Proof of insurance" name="proof_of_insurance" />
              <SubmitButton pendingLabel="Submitting application...">
                Submit application
              </SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function DocumentField({ label, name }: { label: string; name: string }) {
  return (
    <label className="block space-y-2 text-sm font-medium" htmlFor={name}>
      <span>{label}</span>
      <span className="flex min-h-24 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-border bg-background/40 px-4 text-center text-sm text-muted-foreground">
        <Upload className="mr-2 h-4 w-4" />
        Upload PDF or image, max 10 MB
      </span>
      <input
        accept="application/pdf,image/*"
        className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:font-semibold file:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        id={name}
        name={name}
        required
        type="file"
      />
    </label>
  );
}
